import { createError } from "nitro/h3";
import { getAuthenticatedUser, type AuthenticatedUser } from "./supabase";

const ALLOWED_ROLES = new Set(["admin", "cancellation_admin"]);

export function hasCancellationPermission(user: AuthenticatedUser): boolean {
  const metadata = user.app_metadata;
  const role = typeof metadata?.role === "string" ? metadata.role : "";
  const roles = Array.isArray(metadata?.roles)
    ? metadata.roles.filter((value): value is string => typeof value === "string")
    : [];
  return ALLOWED_ROLES.has(role) || roles.some((value) => ALLOWED_ROLES.has(value));
}

export async function requireCancellationAdmin(authorization?: string): Promise<AuthenticatedUser> {
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    throw createError({ statusCode: 401, statusMessage: "Autenticação obrigatória." });
  }

  const user = await getAuthenticatedUser(match[1]);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Sessão inválida ou expirada." });
  }
  if (!hasCancellationPermission(user)) {
    throw createError({ statusCode: 403, statusMessage: "Sem permissão para cancelar serviços." });
  }
  return user;
}

export function cancellationActor(user: AuthenticatedUser): string {
  return user.email || user.phone || user.id;
}
