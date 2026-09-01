import { describe, expect, it } from "vitest";
import { cancelamentoConfirmSchema, cancelamentoSchema, normalizePhone } from "../../server/utils/subscription";
import { cancellationActor, hasCancellationPermission, requireCancellationAdmin } from "../../server/utils/cancellation-auth";

describe("cadastro e cancelamento por telefone", () => {
  it("normaliza telefone com máscara, espaços e prefixo +55", () => {
    expect(normalizePhone("+55 (11) 99999-8888")).toBe("11999998888");
    expect(normalizePhone("(11) 99999-8888")).toBe("11999998888");
  });

  it("aceita telefone novo no contrato e rejeita prefixo não normalizado", () => {
    expect(cancelamentoSchema.safeParse({ phone: "11999998888" }).success).toBe(true);
    expect(cancelamentoSchema.safeParse({ phone: "5511999998888" }).success).toBe(false);
  });

  it("exige confirmação, motivo e serviço para cancelar", () => {
    const base = { phone: "11999998888", serviceId: "00000000-0000-4000-8000-000000000001", reason: "Solicitação do cliente" };
    expect(cancelamentoConfirmSchema.safeParse({ ...base, confirm: true }).success).toBe(true);
    expect(cancelamentoConfirmSchema.safeParse({ ...base, confirm: false }).success).toBe(false);
    expect(cancelamentoConfirmSchema.safeParse({ ...base, confirm: true, serviceId: "00000000" }).success).toBe(false);
  });

  it("autoriza somente papéis administrativos vindos de app_metadata", () => {
    expect(hasCancellationPermission({ id: "1", app_metadata: { role: "cancellation_admin" } })).toBe(true);
    expect(hasCancellationPermission({ id: "2", app_metadata: { roles: ["viewer", "admin"] } })).toBe(true);
    expect(hasCancellationPermission({ id: "3", app_metadata: { role: "authenticated" } })).toBe(false);
    expect(hasCancellationPermission({ id: "4" })).toBe(false);
  });

  it("rejeita chamadas sem credencial antes de acessar o Supabase", async () => {
    await expect(requireCancellationAdmin()).rejects.toMatchObject({ statusCode: 401 });
    await expect(requireCancellationAdmin("Basic credencial")).rejects.toMatchObject({ statusCode: 401 });
  });

  it("registra a identidade autenticada em vez de aceitar o responsável do corpo", () => {
    expect(cancellationActor({ id: "user-id", email: "admin@example.com" })).toBe("admin@example.com");
    expect(cancellationActor({ id: "user-id" })).toBe("user-id");
    expect(cancelamentoConfirmSchema.safeParse({
      phone: "11999998888",
      serviceId: "00000000-0000-4000-8000-000000000001",
      confirm: true,
      reason: "Solicitação do cliente",
      responsibleUser: "forjado",
    }).success).toBe(false);
  });
});
