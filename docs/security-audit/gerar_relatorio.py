from pathlib import Path
from datetime import date
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether

ROOT = Path(__file__).resolve().parent
PDF = ROOT / "relatorio-auditoria-seguranca.pdf"
CRITICAL, HIGH, MEDIUM, LOW, STRONG = "#B91C1C", "#EA580C", "#D97706", "#2563EB", "#059669"

findings = [
    {"sev": "Alta", "color": HIGH, "cat": "Banco / função SECURITY DEFINER", "loc": "Supabase remoto: public.rls_auto_enable() (linha não aplicável)", "desc": "O advisor de segurança do projeto detecta uma função SECURITY DEFINER no schema public executável por anon e authenticated via RPC. Não há arquivo local correspondente para revisar sua implementação.", "evidence": "Função public.rls_auto_enable(), SECURITY DEFINER, EXECUTE público (advisor Supabase)", "impact": "A função pode operar com privilégios do criador e está exposta a papéis não autenticados; o impacto exato depende do corpo da função.", "fix": "Inspecionar o corpo, mover para schema não exposto ou trocar para SECURITY INVOKER quando possível e revogar EXECUTE de anon/authenticated."},
    {"sev": "Alta", "color": HIGH, "cat": "Banco sem tranca / isolamento", "loc": "server/routes/api/cancelamento.ts:13-40", "desc": "A rota de cancelamento é pública (não há autenticação, tenant ou dono) e altera serviços usando credenciais service_role no servidor. O RLS do Supabase bloqueia anon/authenticated, mas é bypassado pela service_role.", "evidence": 'if (event.method !== "POST") ...; await cancelServico(parsed.data.serviceId, {...})', "impact": "Qualquer pessoa que conheça ou tente IDs pode cancelar dados de outros clientes e forjar os metadados de auditoria.", "fix": "Adicionar autenticação de atendente, autorização por organização e executar a operação em transação/RPC com contexto autorizado."},
    {"sev": "Alta", "color": HIGH, "cat": "Permissão definida no navegador", "loc": "server/routes/api/cancelamento.ts:38; src/components/liturgy/WhatsAppRegistration.tsx:364-369", "desc": "O navegador coleta responsibleUser, reason e confirm, mas o servidor não valida identidade, papel ou vínculo do usuário responsável; aceita qualquer texto enviado por um cliente não autenticado.", "evidence": 'cancelado_por: parsed.data.responsibleUser; motivo_cancelamento: parsed.data.reason', "impact": "Um atacante pode executar a operação privilegiada e atribuí-la a qualquer atendente, sem trilha confiável.", "fix": "Autenticar o atendente no backend e derivar o usuário a partir da sessão; rejeitar responsibleUser arbitrário."},
    {"sev": "Alta", "color": HIGH, "cat": "IDOR", "loc": "server/utils/supabase.ts:50-51; server/routes/api/cancelamento.ts:31-38", "desc": "serviceId vem do body e é interpolado diretamente na query PATCH. Não existe verificação server-side de que o serviço pertence ao telefone consultado, ao cliente ou ao tenant do chamador.", "evidence": 'whatsapp_servicos?id=eq.${encodeURIComponent(serviceId)}&status=eq.ATIVO', "impact": "Com um UUID de outro serviço, é possível cancelar o registro de terceiro; o filtro status=ATIVO só evita recancelamento, não impede acesso indevido.", "fix": "Consultar o serviço por id + cliente/tenant autorizado e aplicar a alteração em uma operação atômica com ownership."},
    {"sev": "Crítica", "color": CRITICAL, "cat": "Chaves expostas", "loc": ".env:3; histórico Git; GitHub main/.env", "desc": "O arquivo .env está rastreado localmente e contém uma chave service_role JWT. O mesmo caminho está presente no histórico Git; o arquivo remoto do branch main respondeu HTTP 200.", "evidence": "NITRO_SUPABASE_SERVICE_ROLE_KEY=<segredo redigido>", "impact": "A chave concede acesso privilegiado ao banco e deve ser considerada comprometida.", "fix": "Revogar/rotacionar a chave, remover .env de todo o histórico, fazer force-with-lease controlado e usar somente secrets da Vercel/ambiente."},
]

def chart_paths():
    sev_counts = {"Crítica": 1, "Alta": 4, "Média": 0, "Baixa": 0}
    cat_counts = {"Banco": 2, "Permissão": 1, "IDOR": 1, "Chaves": 1, "XSS": 0}
    donut = ROOT / "grafico-severidade.png"
    fig, ax = plt.subplots(figsize=(5.2, 3.4), dpi=180)
    vals = [v for v in sev_counts.values() if v]
    labels = [k for k, v in sev_counts.items() if v]
    ax.pie(vals, labels=labels, colors=[CRITICAL, HIGH], startangle=90, wedgeprops={"width": .38, "edgecolor": "white"}, textprops={"fontsize": 9})
    ax.set_title("Achados por severidade", fontsize=12, weight="bold")
    fig.tight_layout(); fig.savefig(donut, transparent=True); plt.close(fig)
    bars = ROOT / "grafico-categorias.png"
    fig, ax = plt.subplots(figsize=(6.3, 3.4), dpi=180)
    ax.bar(list(cat_counts), list(cat_counts.values()), color=[HIGH, HIGH, HIGH, CRITICAL, STRONG])
    ax.set_title("Achados por categoria", fontsize=12, weight="bold"); ax.set_ylabel("Quantidade"); ax.set_ylim(0, 1.3); ax.grid(axis="y", alpha=.2)
    fig.tight_layout(); fig.savefig(bars, transparent=True); plt.close(fig)
    return donut, bars

def footer(canvas, doc):
    canvas.saveState(); canvas.setStrokeColor(colors.HexColor("#D1D5DB")); canvas.line(2*cm, 1.45*cm, A4[0]-2*cm, 1.45*cm)
    canvas.setFont("Helvetica", 8); canvas.setFillColor(colors.HexColor("#6B7280")); canvas.drawString(2*cm, 0.9*cm, "Relatório de Auditoria de Segurança — daily-divine-word")
    canvas.drawRightString(A4[0]-2*cm, 0.9*cm, f"Página {doc.page}"); canvas.restoreState()

def p(text, style): return Paragraph(text.replace("&", "&amp;"), style)

def build():
    donut, bars = chart_paths()
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TitleBlue", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=25, leading=30, textColor=colors.HexColor("#123653"), alignment=TA_CENTER, spaceAfter=18))
    styles.add(ParagraphStyle(name="Sub", parent=styles["Normal"], fontSize=10, leading=15, textColor=colors.HexColor("#4B5563"), alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="H", parent=styles["Heading2"], fontSize=16, leading=20, textColor=colors.HexColor("#123653"), spaceBefore=10, spaceAfter=8))
    styles.add(ParagraphStyle(name="Body2", parent=styles["BodyText"], fontSize=9.3, leading=14, spaceAfter=6))
    styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"], fontSize=8, leading=11))
    styles.add(ParagraphStyle(name="Issue", parent=styles["Code"], fontName="Courier", fontSize=7.3, leading=9.5, backColor=colors.HexColor("#F3F4F6"), borderPadding=7))
    story = [Spacer(1, 2.2*cm), Paragraph("Relatório de Auditoria de Segurança", styles["TitleBlue"]), Paragraph("daily-divine-word", styles["TitleBlue"]), Spacer(1, .5*cm), Paragraph(date.today().strftime("%d/%m/%Y"), styles["Sub"]), Spacer(1, 1.2*cm), Paragraph("Escopo: frontend React/Vite/TypeScript, backend Nitro, acesso PostgREST do Supabase, migrations, configuração Vercel, histórico Git e bundle de produção.", styles["Sub"]), Spacer(1, .5*cm), Paragraph("Nota metodológica: as cinco categorias foram mapeadas para a stack detectada. RLS foi tratado como mecanismo de isolamento do banco; como não há autenticação de usuário/tenant, as rotas Nitro foram auditadas como fronteira de autorização. Não foram considerados achados hipotéticos.", styles["Sub"]), PageBreak()]
    story += [Paragraph("Resumo executivo", styles["H"]), Paragraph("Foram verificados 4 achados de segurança: 1 crítico e 3 altos. A categoria XSS não apresentou ocorrência verificável no código auditado.", styles["Body2"]), Table([[Image(str(donut), width=8.2*cm, height=5.3*cm), Image(str(bars), width=10.2*cm, height=5.3*cm)]], colWidths=[9*cm, 10.5*cm], style=TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE")])), Spacer(1,.3*cm), Paragraph("Stack detectada", styles["H"]), Paragraph("React 18 + Vite + TypeScript; Nitro server routes; Supabase via REST/PostgREST com fetch; sem ORM/query builder; sem autenticação implementada; RLS nas tabelas; Vercel via vercel.json; sem Docker, Helm, Terraform ou CI configurados.", styles["Body2"]), PageBreak()]
    story += [Paragraph("Pontos fortes", styles["H"]), Paragraph("• RLS está habilitado em whatsapp_cadastros e whatsapp_servicos, com políticas deny para anon/authenticated e sem chave service_role no bundle frontend. <br/>• A validação Zod é estrita, há limite de corpo, rate limit por IP, normalização de telefone e filtro atômico status=ATIVO para evitar recancelamento. <br/>• Não foram encontrados innerHTML, dangerouslySetInnerHTML, v-html, eval, new Function, markdown/HTML sem sanitização ou URLs javascript: no frontend/backend auditados. <br/>• .env.example não contém valor secreto e .gitignore inclui .env; o problema é o arquivo histórico já rastreado.", styles["Body2"]), Paragraph("Pontos fracos centrais", styles["H"]), Paragraph("A ausência de autenticação de atendente torna a API de cancelamento pública e faz com que dados enviados pelo navegador sejam tratados como identidade e autorização. A service_role concentra privilégio no servidor, mas não existe uma fronteira de usuário/tenant para limitar a operação. A exposição histórica da chave exige rotação antes de qualquer publicação.", styles["Body2"]), PageBreak()]
    story += [Paragraph("Achados detalhados", styles["H"])]
    rows = [[p("Severidade", styles["Small"]), p("Arquivo:linha", styles["Small"]), p("Descrição", styles["Small"])]]
    for f in findings:
        chip = Table([[p(f["sev"], styles["Small"])]], style=TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor(f["color"])),("TEXTCOLOR",(0,0),(-1,-1),colors.white),("ROUNDEDCORNERS",[4,4,4,4]),("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5)]))
        rows.append([chip, p(f["loc"], styles["Small"]), p(f"<b>{f['cat']}</b><br/>{f['desc']}<br/><b>Trecho:</b> {f['evidence']}<br/><b>Impacto:</b> {f['impact']}", styles["Small"])])
    t = Table(rows, colWidths=[2.2*cm, 4.1*cm, 11.6*cm], repeatRows=1); t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.HexColor("#123653")),("TEXTCOLOR",(0,0),(-1,0),colors.white),("GRID",(0,0),(-1,-1),.3,colors.HexColor("#D1D5DB")),("VALIGN",(0,0),(-1,-1),"TOP"),("BACKGROUND",(0,1),(-1,-1),colors.HexColor("#FAFAF9")),("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6)])); story += [t, PageBreak(), Paragraph("Recomendações priorizadas", styles["H"])]
    recs = [("P1", "Revogar e rotacionar a service_role exposta; remover .env de todo o histórico Git antes de qualquer push/deploy."), ("P2", "Implementar autenticação de atendentes e autorização server-side por organização/tenant; nunca aceitar responsibleUser como identidade."), ("P3", "Trocar o PATCH por operação transacional/RPC que valide service_id + cliente + escopo autorizado, preservando concorrência."), ("P4", "Adicionar testes de autorização negativa, IDOR, concorrência e verificação do bundle/histórico no CI."), ("P5", "Configurar secrets na Vercel em Production/Preview e revisar logs para garantir que nenhum segredo seja impresso.")]
    story += [Table([[p(f"<b>{a}</b>", styles["Body2"]), p(b, styles["Body2"])] for a,b in recs], colWidths=[1.4*cm, 16.5*cm], style=TableStyle([("GRID",(0,0),(-1,-1),.3,colors.HexColor("#D1D5DB")),("VALIGN",(0,0),(-1,-1),"TOP"),("BACKGROUND",(0,0),(0,-1),colors.HexColor("#FEF3C7"))]))]
    story += [Paragraph("ISSUES PARA O GITHUB", styles["H"]), Paragraph("As issues abaixo estão prontas para copiar e colar. O achado XSS não gera issue porque não foi verificado.", styles["Body2"])]
    for i,f in enumerate(findings, 1):
        issue = f"--- ISSUE {i} ---\nTítulo: [Segurança] {f['cat']}\nLabels sugeridas: security, {f['sev'].lower()}\n\n## Descrição\n{f['desc']}\n\n## Evidência\n- {f['loc']}\n- Trecho: `{f['evidence']}`\n\n## Impacto\n{f['impact']}\n\n## Sugestão de correção\n{f['fix']}\n\n## Critérios de aceite\n- [ ] A operação exige autenticação e autorização server-side.\n- [ ] Teste negativo impede acesso fora do escopo.\n- [ ] Logs não registram segredos.\n- [ ] Testes automatizados e build passam.\n--- FIM ISSUE {i} ---"
        story += [Spacer(1,.2*cm), Paragraph(issue.replace("\n", "<br/>"), styles["Issue"])]
    doc = SimpleDocTemplate(str(PDF), pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=1.8*cm, bottomMargin=2*cm, title="Relatório de Auditoria de Segurança — daily-divine-word", author="Codex")
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(PDF)

if __name__ == "__main__": build()
