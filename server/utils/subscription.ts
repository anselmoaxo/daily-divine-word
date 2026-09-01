import { createError } from "nitro/h3";
import { z } from "zod";

export const CONSENT_VERSION = "2026-09-01";
const MAX_BODY_BYTES = 8_192;

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{10,11}$/, "Informe um telefone brasileiro com 10 ou 11 dígitos.");

export function normalizePhone(value: string): string {
  const digits = value.replace(/[^0-9]/g, "");
  return digits.startsWith("55") && (digits.length === 12 || digits.length === 13) ? digits.slice(2) : digits;
}

const optionalBirthdate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) && date <= new Date();
  }, "Informe uma data de nascimento válida.")
  .optional()
  .or(z.literal(""));

export const cadastroSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    phone: phoneSchema,
    email: z.string().trim().email().max(254).optional().or(z.literal("")),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    birthdate: optionalBirthdate,
    consent: z.literal(true),
    consentVersion: z.literal(CONSENT_VERSION),
    honeypot: z.string().max(200).optional().or(z.literal("")),
  })
  .strict();

export const cancelamentoSchema = z.object({ phone: phoneSchema }).strict();
export const cancelamentoConfirmSchema = z.object({
  phone: phoneSchema,
  serviceId: z.string().uuid(),
  confirm: z.literal(true),
  reason: z.string().trim().min(2).max(500),
}).strict();

type RequestHeaders = Record<string, string | undefined>;
type RateEntry = { count: number; resetAt: number };
const rateLimits = new Map<string, RateEntry>();

export function clientIdentifier(headers: RequestHeaders): string {
  const forwarded = headers["x-forwarded-for"]?.split(",")[0]?.trim();
  return forwarded || headers["x-real-ip"] || "unknown";
}

export function assertBodySize(contentLength?: string): void {
  const size = Number(contentLength || 0);
  if (Number.isFinite(size) && size > MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, statusMessage: "Corpo da requisição muito grande." });
  }
}

export function assertRateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    throw createError({ statusCode: 429, statusMessage: "Muitas solicitações. Tente novamente em instantes." });
  }
  current.count += 1;
}
