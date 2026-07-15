// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const { phone, honeypot } = body;

    if (honeypot) {
      return new Response(
        JSON.stringify({ success: true, message: "Processado com sucesso (honeypot)." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "O número de telefone é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const N8N_WEBHOOK_URL = Deno.env.get("N8N_CANCELAMENTO_URL") || "https://n8n.anselmotech.online/webhook-test/cancelamento";
    const N8N_API_KEY = Deno.env.get("N8N_API_KEY") || "n8n-secure-auth-token-2026";

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": N8N_API_KEY,
      },
      body: JSON.stringify({
        action: "unsubscribe",
        phone,
        timestamp: new Date().toISOString(),
        source: "liturgia.anselmotech.online",
      }),
    });

    if (!n8nResponse.ok) {
      throw new Error(`Erro na resposta do n8n: ${n8nResponse.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Cancelamento realizado com sucesso!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro na Edge Function de cancelamento:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno no servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
