import { describe, expect, it } from "vitest";
import {
  CONSENT_VERSION,
  cadastroSchema,
  cancelamentoSchema,
  clientIdentifier,
} from "../../server/utils/subscription";

describe("contratos de inscrição do WhatsApp", () => {
  it("aceita um cadastro válido com consentimento versionado", () => {
    const result = cadastroSchema.safeParse({
      name: "Maria da Silva",
      phone: "11999999999",
      email: "maria@example.com",
      city: "São Paulo",
      birthdate: "1990-01-01",
      consent: true,
      consentVersion: CONSENT_VERSION,
      honeypot: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita cadastro sem consentimento", () => {
    const result = cadastroSchema.safeParse({
      name: "Maria",
      phone: "11999999999",
      consent: false,
      consentVersion: CONSENT_VERSION,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita telefone malformado e campos inesperados", () => {
    expect(cancelamentoSchema.safeParse({ phone: "123", admin: true }).success).toBe(false);
  });

  it("usa o primeiro IP encaminhado como identificador", () => {
    expect(clientIdentifier({ "x-forwarded-for": "203.0.113.1, 10.0.0.1" })).toBe("203.0.113.1");
  });
});
