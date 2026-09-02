# Liturgia Diária – Anselmo Tech

Aplicação web moderna e responsiva para acompanhamento da Liturgia Diária da Igreja Católica Apostólica Romana. Os cadastros e cancelamentos são gravados no Supabase; uma automação do n8n apenas lê esses registros e envia a mensagem pelo WhatsApp.

## Tecnologias Utilizadas
- React 18 com Vite e TypeScript
- Tailwind CSS para estilização litúrgica
- Framer Motion para transições suaves
- Supabase para armazenar cadastros com RLS
- Camada Nitro para validar os dados e manter a chave `service_role` fora do navegador

## Configuração local

Use Node.js 24 e pnpm 10. Copie `.env.example` para `.env` e preencha a URL e a chave privada do Supabase. O arquivo `.env` é ignorado pelo Git. Nunca use o prefixo `VITE_` para segredos.

```bash
corepack pnpm install
corepack pnpm dev
```

No n8n, conecte-se ao Supabase usando uma credencial segura e faça leitura periódica da tabela `public.whatsapp_cadastros` e dos serviços em `public.whatsapp_servicos`. O n8n não grava nem altera dados do sistema: apenas lê os registros pendentes e envia a mensagem pelo WhatsApp.

## Autorização de cancelamentos

`POST /api/cancelamento` exige um access token válido do Supabase Auth no cabeçalho
`Authorization: Bearer <token>`. Além da autenticação, o usuário precisa ter `admin`
ou `cancellation_admin` em `app_metadata.role`/`app_metadata.roles`. Metadados de
usuário (`user_metadata`) e o nome do responsável enviado no corpo nunca são usados
para autorização ou auditoria. O serviço também precisa pertencer ao telefone consultado.
