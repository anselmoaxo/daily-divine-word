-- Cadastros para o envio da Liturgia Diária via n8n/WhatsApp.
-- A tabela fica protegida por RLS e deve ser acessada pelo n8n com a
-- chave service_role (nunca pelo navegador).

create table if not exists public.whatsapp_cadastros (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) between 2 and 100),
  telefone text not null unique check (telefone ~ '^[0-9]{10,11}$'),
  email text check (email is null or char_length(email) <= 254),
  cidade text check (cidade is null or char_length(cidade) <= 100),
  data_nascimento date check (data_nascimento is null or data_nascimento <= current_date),
  consentimento boolean not null default false check (consentimento = true),
  versao_consentimento text not null,
  consentimento_em timestamptz not null default now(),
  status text not null default 'ativo' check (status in ('ativo', 'cancelado')),
  origem text not null default 'liturgia.anselmotech.online',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  cancelado_em timestamptz
);

comment on table public.whatsapp_cadastros is 'Destinatários que consentiram receber a Liturgia Diária pelo WhatsApp.';
comment on column public.whatsapp_cadastros.telefone is 'Somente dígitos, DDD + número, sem código do país.';

create index if not exists whatsapp_cadastros_status_idx
  on public.whatsapp_cadastros (status);

alter table public.whatsapp_cadastros enable row level security;

-- Não há políticas para anon/authenticated de propósito: os dados pessoais
-- são gravados e consultados exclusivamente pelo n8n usando service_role.
revoke all on table public.whatsapp_cadastros from anon, authenticated;
grant all on table public.whatsapp_cadastros to service_role;
