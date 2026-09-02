-- Modelo de serviços e auditoria de cancelamentos.
create table if not exists public.whatsapp_servicos (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references public.whatsapp_cadastros(id) on delete restrict,
  nome text not null default 'Liturgia Diária via WhatsApp',
  status text not null default 'ATIVO' check (status in ('ATIVO', 'CANCELADO')),
  criado_em timestamptz not null default now(),
  cancelado_em timestamptz,
  cancelado_por text,
  motivo_cancelamento text,
  telefone_consulta text,
  atualizado_em timestamptz not null default now()
);

create index if not exists whatsapp_servicos_cadastro_status_idx
  on public.whatsapp_servicos (cadastro_id, status);

alter table public.whatsapp_servicos enable row level security;
revoke all on table public.whatsapp_servicos from anon, authenticated;
grant all on table public.whatsapp_servicos to service_role;

create policy "whatsapp_servicos_sem_acesso_anon"
  on public.whatsapp_servicos for all to anon using (false) with check (false);
create policy "whatsapp_servicos_sem_acesso_authenticated"
  on public.whatsapp_servicos for all to authenticated using (false) with check (false);

-- Relatório preservado para inspeção manual antes de qualquer saneamento.
create table if not exists public.whatsapp_telefones_duplicados (
  telefone_normalizado text not null,
  quantidade integer not null,
  ids uuid[] not null,
  identificado_em timestamptz not null default now()
);

insert into public.whatsapp_telefones_duplicados (telefone_normalizado, quantidade, ids)
select regexp_replace(regexp_replace(regexp_replace(trim(telefone), '[^0-9]', '', 'g'), '^55', ''), '^0+', ''), count(*)::integer, array_agg(id)
from public.whatsapp_cadastros
group by 1
having count(*) > 1;

alter table public.whatsapp_telefones_duplicados enable row level security;
revoke all on table public.whatsapp_telefones_duplicados from anon, authenticated;
grant all on table public.whatsapp_telefones_duplicados to service_role;
