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

  const requestBody = await readBody(event) as Record<string, unknown>;
  const normalizedBody = {
    ...requestBody,
    phone: typeof requestBody.phone === "string" ? normalizePhone(requestBody.phone) : requestBody.phone,
    lookupPhone: typeof requestBody.lookupPhone === "string" ? normalizePhone(requestBody.lookupPhone) : requestBody.lookupPhone,
  };
  const parsed = cancelamentoConfirmSchema.safeParse(normalizedBody);
  const lookup = cancelamentoSchema.safeParse(normalizedBody);
  if (!parsed.success) {
    if (!lookup.success) throw createError({ statusCode: 422, statusMessage: "Dados de cancelamento inválidos." });
    return { client: await findClienteComServicos(normalizePhone(lookup.data.phone)) };
  }

  await cancelServico(parsed.data.serviceId, { status: "CANCELADO", cancelado_em: new Date().toISOString(), cancelado_por: parsed.data.responsibleUser, motivo_cancelamento: parsed.data.reason, telefone_consulta: parsed.data.lookupPhone, atualizado_em: new Date().toISOString() });

  return { success: true };
});
