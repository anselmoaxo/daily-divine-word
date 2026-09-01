import { describe, expect, it } from "vitest";
import { cancelamentoConfirmSchema, cancelamentoSchema, normalizePhone } from "../../server/utils/subscription";

describe("cadastro e cancelamento por telefone", () => {
  it("normaliza telefone com máscara, espaços e prefixo +55", () => {
    expect(normalizePhone("+55 (11) 99999-8888")).toBe("11999998888");
    expect(normalizePhone("(11) 99999-8888")).toBe("11999998888");
  });

  it("aceita telefone novo no contrato e rejeita prefixo não normalizado", () => {
    expect(cancelamentoSchema.safeParse({ phone: "11999998888" }).success).toBe(true);
    expect(cancelamentoSchema.safeParse({ phone: "5511999998888" }).success).toBe(false);
  });

  it("exige confirmação, usuário, motivo e serviço para cancelar", () => {
    const base = { phone: "11999998888", lookupPhone: "11999998888", serviceId: "00000000-0000-4000-8000-000000000001", responsibleUser: "Atendente", reason: "Solicitação do cliente" };
    expect(cancelamentoConfirmSchema.safeParse({ ...base, confirm: true }).success).toBe(true);
    expect(cancelamentoConfirmSchema.safeParse({ ...base, confirm: false }).success).toBe(false);
    expect(cancelamentoConfirmSchema.safeParse({ ...base, confirm: true, serviceId: "00000000" }).success).toBe(false);
  });
});
