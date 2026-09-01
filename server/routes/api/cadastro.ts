import { defineHandler } from "nitro";
import { createError, getRequestHeaders, readBody } from "nitro/h3";
import {
  assertBodySize,
  assertRateLimit,
  cadastroSchema,
  clientIdentifier,
  normalizePhone,
} from "../../utils/subscription";
import { createCadastro, createServico } from "../../utils/supabase";

export default defineHandler(async (event) => {
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Método não permitido.",
    });
  }

  const headers = getRequestHeaders(event);
  assertBodySize(headers["content-length"]);
  assertRateLimit(`cadastro:${clientIdentifier(headers)}`, 5, 60_000);

  const rawBody = await readBody(event) as Record<string, unknown>;
  const parsed = cadastroSchema.safeParse({ ...rawBody, phone: typeof rawBody.phone === "string" ? normalizePhone(rawBody.phone) : rawBody.phone });
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Dados de cadastro inválidos.",
      data: { fields: parsed.error.flatten().fieldErrors },
    });
  }

  const body = parsed.data;

  if (body?.honeypot) {
    return { success: true };
  }

  const created = await createCadastro({
    nome: body.name,
    telefone: body.phone,
    email: body.email || null,
    cidade: body.city || null,
    data_nascimento: body.birthdate || null,
    consentimento: body.consent,
    versao_consentimento: body.consentVersion,
    consentimento_em: new Date().toISOString(),
    status: "ativo",
    origem: "liturgia.anselmotech.online",
  });
  const rows = await created.json() as Array<{ id: string }>;
  if (rows[0]?.id) await createServico(rows[0].id);

  return { success: true };
});
