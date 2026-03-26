// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTERNAL_API_URL = "https://liturgia.up.railway.app/v2/";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const today = new Date().toLocaleDateString('pt-BR'); // Formato DD/MM/YYYY usado na tabela

    // 1. Tentar buscar no Cache (Banco de Dados)
    const { data: cached } = await supabase
      .from("liturgias")
      .select("*")
      .eq("data", today)
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Tentar API Externa com Timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(EXTERNAL_API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const externalData = await res.json();
        
        // Salvar no Cache
        const { data: saved } = await supabase
          .from("liturgias")
          .upsert({
            data: today,
            liturgia: externalData.liturgia,
            cor: externalData.cor,
            oracoes: externalData.oracoes,
            leituras: externalData.leituras,
            antifonas: externalData.antifonas
          })
          .select()
          .single();

        return new Response(JSON.stringify(saved), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (fetchError) {
      console.error("Erro na API externa:", fetchError);
    }

    // 3. Fallback: Retornar a última liturgia salva se a API falhar
    const { data: fallback } = await supabase
      .from("liturgias")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallback) {
      return new Response(JSON.stringify({ ...fallback, is_fallback: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Indisponível" }), { status: 503, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});