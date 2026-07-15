import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

const webhookUrl = "https://n8n.anselmotech.online/webhook-test/cancelamento";
const apiKey = "n8n-secure-auth-token-2026";

export default defineHandler(async (event) => {
  if (event.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Método não permitido.",
    });
  }

  const body = await readBody<{ phone?: string }>(event);

  if (!body?.phone) {
    throw createError({
      statusCode: 400,
      statusMessage: "O número de telefone é obrigatório.",
    });
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      action: "unsubscribe",
      phone: body.phone,
      timestamp: new Date().toISOString(),
      source: "liturgia.anselmotech.online",
    }),
  });

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: "Erro ao encaminhar a solicitação de cancelamento.",
    });
  }

  return { success: true };
});
