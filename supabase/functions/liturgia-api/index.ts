import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);

  try {
    // GET /liturgia-api?date=23/03/2026 — public read
    if (req.method === "GET") {
      const dateParam = url.searchParams.get("date");

      if (dateParam) {
        const { data, error } = await supabase
          .from("liturgias")
          .select("*")
          .eq("data", dateParam)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Liturgia não encontrada para esta data" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(JSON.stringify(formatOutput(data)), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // List recent
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const { data, error } = await supabase
        .from("liturgias")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return new Response(JSON.stringify((data || []).map(formatOutput)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST — insert/upsert liturgia (requires auth)
    if (req.method === "POST") {
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Não autorizado" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { data: liturgiaData, liturgia, cor, oracoes, leituras, antifonas } = body;

      if (!liturgiaData || !liturgia) {
        return new Response(
          JSON.stringify({ error: "Campos obrigatórios: data, liturgia" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("liturgias")
        .upsert(
          {
            data: liturgiaData,
            liturgia,
            cor: cor || "",
            oracoes: oracoes || {},
            leituras: leituras || {},
            antifonas: antifonas || null,
          },
          { onConflict: "data" }
        )
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(formatOutput(data)), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Método não suportado" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function formatOutput(row: any) {
  return {
    data: row.data,
    liturgia: row.liturgia,
    cor: row.cor,
    oracoes: row.oracoes,
    leituras: row.leituras,
    antifonas: row.antifonas,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
