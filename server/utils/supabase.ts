import { createError } from "nitro/h3";
import { useRuntimeConfig } from "nitro/runtime-config";

function runtimeCredentials() {
  // Nitro runtime config is server-scoped; this is not a React hook.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const config = useRuntimeConfig() as Record<string, string>;
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw createError({ statusCode: 503, statusMessage: "Banco de dados não configurado." });
  }
  return { url: config.supabaseUrl.replace(/\/$/, ""), key: config.supabaseServiceRoleKey };
}

export type AuthenticatedUser = {
  id: string;
  email?: string;
  phone?: string;
  app_metadata?: Record<string, unknown>;
};

export async function getAuthenticatedUser(accessToken: string): Promise<AuthenticatedUser | null> {
  const { url, key } = runtimeCredentials();
  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    return await response.json() as AuthenticatedUser;
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Não foi possível validar a autenticação." });
  }
}

async function request(path: string, init: RequestInit) {
  const { url, key } = runtimeCredentials();
  try {
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      if (response.status === 409) throw createError({ statusCode: 409, statusMessage: "Este telefone já está cadastrado para outro cliente." });
      throw new Error(`Supabase HTTP ${response.status}`);
    }
    return response;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "statusCode" in error) throw error;
    throw createError({ statusCode: 502, statusMessage: "Não foi possível salvar o cadastro." });
  }
}

export function createCadastro(payload: Record<string, unknown>) {
  return request("whatsapp_cadastros", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
}

export async function createServico(cadastroId: string) {
  return request("whatsapp_servicos", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ cadastro_id: cadastroId }) });
}

export async function findClienteComServicos(phone: string) {
  const response = await request(`whatsapp_cadastros?telefone=eq.${encodeURIComponent(phone)}&select=id,nome,telefone,whatsapp_servicos(id,nome,status,criado_em)`, { method: "GET" });
  return response.json();
}

export function cancelServico(serviceId: string, cadastroId: string, payload: Record<string, unknown>) {
  return request(`whatsapp_servicos?id=eq.${encodeURIComponent(serviceId)}&cadastro_id=eq.${encodeURIComponent(cadastroId)}&status=eq.ATIVO`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) });
}
