import { defineHandler, useRuntimeConfig } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const webhookUrl = config.n8nCancelamentoUrl;
  const apiKey = config.n8nApiKey;

  if (!webhookUrl || !apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Configuração do n8n ausente.",
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
