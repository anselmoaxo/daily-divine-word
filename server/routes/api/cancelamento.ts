import { defineHandler } from "nitro";
import { readBody, createError, getRequestHeaders } from "nitro/h3";
import {
  assertBodySize,
  assertRateLimit,
  cancelamentoSchema,
  clientIdentifier,
  cancelamentoConfirmSchema,
  normalizePhone,
} from "../../utils/subscription";
import { cancelServico, findClienteComServicos } from "../../utils/supabase";
import { cancellationActor, requireCancellationAdmin } from "../../utils/cancellation-auth";

export default defineHandler(async (event) => {
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Método não permitido.",
    });
  }

  const headers = getRequestHeaders(event);
  assertBodySize(headers["content-length"]);
  assertRateLimit(`cancelamento:${clientIdentifier(headers)}`, 5, 60_000);
  const authenticatedUser = await requireCancellationAdmin(headers.authorization);

  const requestBody = await readBody(event) as Record<string, unknown>;
  const normalizedBody = {
    ...requestBody,
    phone: typeof requestBody.phone === "string" ? normalizePhone(requestBody.phone) : requestBody.phone,
  };
  const parsed = cancelamentoConfirmSchema.safeParse(normalizedBody);
  const lookup = cancelamentoSchema.safeParse(normalizedBody);
  if (!parsed.success) {
    if (!lookup.success) throw createError({ statusCode: 422, statusMessage: "Dados de cancelamento inválidos." });
    return { client: await findClienteComServicos(lookup.data.phone) };
  }

  const clients = await findClienteComServicos(parsed.data.phone) as Array<{
    id: string;
    whatsapp_servicos?: Array<{ id: string; status: string }>;
  }>;
  const client = clients[0];
  const ownsActiveService = client?.whatsapp_servicos?.some(
    (service) => service.id === parsed.data.serviceId && service.status === "ATIVO",
  );
  if (!client || !ownsActiveService) {
    throw createError({ statusCode: 404, statusMessage: "Serviço ativo não encontrado para este telefone." });
  }

  const now = new Date().toISOString();
  const response = await cancelServico(parsed.data.serviceId, client.id, {
    status: "CANCELADO",
    cancelado_em: now,
    cancelado_por: cancellationActor(authenticatedUser),
    motivo_cancelamento: parsed.data.reason,
    telefone_consulta: parsed.data.phone,
    atualizado_em: now,
  });
  const updated = await response.json() as unknown[];
  if (updated.length !== 1) {
    throw createError({ statusCode: 409, statusMessage: "O serviço já foi alterado. Atualize a consulta." });
  }

  return { success: true };
});
