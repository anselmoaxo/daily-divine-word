-- Mantém o bloqueio explícito para os papéis expostos pela Data API.
create policy "whatsapp_cadastros_sem_acesso_anon"
  on public.whatsapp_cadastros
  for all to anon
  using (false)
  with check (false);

create policy "whatsapp_cadastros_sem_acesso_authenticated"
  on public.whatsapp_cadastros
  for all to authenticated
  using (false)
  with check (false);
