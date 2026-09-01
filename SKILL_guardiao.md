---
name: liturgia-project-guardian
description: Audita e melhora o projeto Liturgia em seguranca, SEO tecnico, APIs e prontidao de release; use para diagnosticos, correcoes, revisoes no GitHub e deploys controlados na Vercel do dominio liturgia.anselmotech.online.
---

# Guardiao do Projeto Liturgia

Use `https://liturgia.anselmotech.online/` como URL publica padrao. O mapeamento verificado em 2026-09-01 e GitHub `anselmoaxo/daily-divine-word` (branch padrao `main`) e Vercel `daily-divine-word` (`prj_OVFD1WIzWxkYm1QzULQwvnNuw6rX`) na equipe `anselmo-techs-projects`. Revalide o dominio e o vinculo antes de qualquer mutacao porque o mapeamento pode mudar. Se houver mais de uma correspondencia plausivel, pare antes de qualquer mutacao e solicite a escolha do usuario.

## Escolher o modo

- **Auditoria** e o modo padrao: somente leitura, diagnostico e relatorio.
- **Correcao** exige pedido para alterar codigo. Trabalhe em branch/worktree quando possivel, preserve mudancas existentes e teste antes de propor publicacao.
- **Release** exige pedido explicito para publicar. Preview e producao sao autorizacoes distintas; nunca deduza permissao de producao a partir de um pedido de auditoria, correcao ou preview.

## Descobrir o contexto

1. Procure primeiro um repositorio local e leia as instrucoes `AGENTS.md` aplicaveis.
2. Se o codigo nao estiver local, use o conector GitHub para localizar repositorios acessiveis e confirme a correspondencia pelo dominio, configuracao Vercel ou documentacao do projeto.
3. Use o conector Vercel para inspecionar equipes, projetos, dominios, deployments, logs e erros. Operacoes de leitura podem apoiar o diagnostico; deploy e alteracoes exigem a autorizacao definida acima.
4. Registre framework, runtime, gerenciador de pacotes, rotas publicas, endpoints de API, autenticacao, banco e ambientes. Nao exponha valores de segredos.

## Executar a auditoria

Comece por DNS, TLS e disponibilidade. Um erro de transporte invalida conclusoes baseadas apenas em crawl. Para uma verificacao passiva e reproduzivel, execute `scripts/site_baseline.py --url https://liturgia.anselmotech.online/`; ele nao ignora certificados invalidos.

Depois, examine as tres frentes e leia somente a referencia necessaria:

- Para seguranca de codigo, dependencias, configuracao e runtime, leia [references/security.md](references/security.md).
- Para SEO tecnico e contratos/seguranca de API, leia [references/seo-api.md](references/seo-api.md).
- Para GitHub, Vercel, previews e producao, leia [references/release.md](references/release.md).

Auditoria ativa em producao deve permanecer nao destrutiva: nao fazer brute force, carga, fuzzing agressivo, exploracao, criacao massiva de dados ou testes que possam degradar o servico sem autorizacao explicita e janela acordada. Prefira verificacao estatica, logs, configuracao, requests idempotentes e ambiente de preview.

## Respeitar as camadas

- Frontend possui mascaras, feedback, estados de tela, acessibilidade e validacao rapida; nunca e fonte de autorizacao.
- API autentica, autoriza na fronteira, valida e normaliza contratos, aplica rate limit quando apropriado e oferece auditabilidade/idempotencia.
- Dominio concentra regras de negocio, calculos, invariantes e transicoes; repete permissoes quando a invariavel exigir.
- Banco reforca integridade e menor privilegio com PK, FK, UNIQUE, NOT NULL, CHECK, transacoes, indices, roles e RLS quando aplicavel.

Nao mova regra de apresentacao para dominio/banco nem trate validacao do frontend como defesa suficiente.

## Corrigir e verificar

Priorize causas raiz e vulnerabilidades exploraveis. Para cada mudanca, valide nas fronteiras relevantes: frontend, API, dominio e banco. Execute testes existentes, analise estatica, build e verificacoes de dependencia proporcionais ao risco. Nao enfraqueca testes, TLS, CSP, autenticacao ou validacao para obter um resultado verde.

## Entregar o resultado

Classifique achados como Critico, Alto, Medio, Baixo ou Informativo. Para cada achado, informe evidencia redigida, impacto, caminho seguro de reproducao, camada proprietaria, correcao e verificacao. Separe fato observado de hipotese e marque limitacoes de acesso.

Finalize sempre com:

- o que foi auditado ou alterado;
- o que foi verificado e os comandos/checks relevantes;
- riscos ainda abertos;
- se houve GitHub PR/commit ou Vercel preview/producao, com links e estado final.
