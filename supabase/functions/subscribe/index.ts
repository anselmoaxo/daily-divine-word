// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

serve(async (req) => {
  // Trata requisições preflight do CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Validar chave de API secreta entre o Frontend e esta Edge Function
    const apiKey = req.headers.get("x-api-key");
    const EXPECTED_API_KEY = Deno.env.get("FRONTEND_API_KEY") || "liturgia-diaria-secret-key-2026";

    if (apiKey !== EXPECTED_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Não autorizado. Chave de API inválida." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Obter dados do corpo da requisição
    const body = await req.json();
    const { action, name, phone, email, city, birthdate, honeypot } = body;

    // 3. Proteção Honeypot (se o campo invisível estiver preenchido, é um bot)
    if (honeypot) {
      console.warn("Tentativa de spam detectada via Honeypot.");
      return new Response(
        JSON.stringify({ success: true, message: "Processado com sucesso (honeypot)." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Validar campos obrigatórios
    if (!phone) {
      return new Response(
        JSON.stringify({ error: "O número de telefone é obrigatório." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "subscribe" && !name) {
      return new Response(
        JSON.stringify({ error: "O nome é obrigatório para inscrição." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Encaminhar para o n8n de forma segura (URL de Produção atualizada)
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL") || "https://n8n.anselmotech.online/webhook/cadastro";
    
    // Construindo os parâmetros para o GET do n8n
    const params = new URLSearchParams({
      action,
      name: name || "",
      phone,
      email: email || "",
      city: city || "",
      birthdate: birthdate || "",
      consent: "true",
      timestamp: new Date().toISOString(),
      source: "liturgia.anselmotech.online"
    });

    // Faz a chamada segura para o n8n adicionando um header de autenticação secreto
    const n8nResponse = await fetch(`${N8N_WEBHOOK_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "X-API-Key": Deno.env.get("N8N_API_KEY") || "n8n-secure-auth-token-2026"
      }
    });

    if (!n8nResponse.ok) {
      throw new Error(`Erro na resposta do n8n: ${n8nResponse.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Operação realizada com sucesso!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno no servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});