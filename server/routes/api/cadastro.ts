import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

const webhookUrl = "https://n8n.anselmotech.online/webhook/cadastro";
const apiKey = "n8n-secure-auth-token-2026";

export default defineHandler(async (event) => {
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Método não permitido.",
    });
  }

  const body = await readBody<{

    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    birthdate?: string;
    honeypot?: string;
  }>(event);

  if (body?.honeypot) {
    return { success: true };
  }

  if (!body?.phone) {
    throw createError({
      statusCode: 400,
      statusMessage: "O número de telefone é obrigatório.",
    });
  }

  if (!body?.name) {
    throw createError({
      statusCode: 400,
      statusMessage: "O nome é obrigatório para inscrição.",
    });
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      action: "subscribe",
      name: body.name,
      phone: body.phone,
      email: body.email || "",
      city: body.city || "",
      birthdate: body.birthdate || "",
      consent: true,
      timestamp: new Date().toISOString(),
      source: "liturgia.anselmotech.online",
    }),
  });

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: "Erro ao encaminhar a inscrição.",
    });
  }

  return { success: true };
});
