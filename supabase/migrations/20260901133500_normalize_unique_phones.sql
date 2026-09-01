-- Normaliza registros sem conflito. Duplicidades ficam preservadas no relatório
-- whatsapp_telefones_duplicados para decisão manual; nenhum registro é apagado.
update public.whatsapp_cadastros
set telefone = case
  when length(regexp_replace(telefone, '[^0-9]', '', 'g')) in (12, 13)
    and regexp_replace(telefone, '[^0-9]', '', 'g') like '55%' then right(regexp_replace(telefone, '[^0-9]', '', 'g'), 11)
  else regexp_replace(telefone, '[^0-9]', '', 'g')
end,
atualizado_em = now()
where telefone !~ '^[0-9]{10,11}$'
  and not exists (
    select 1 from public.whatsapp_cadastros other
    where other.id <> whatsapp_cadastros.id
      and (case when length(regexp_replace(other.telefone, '[^0-9]', '', 'g')) in (12,13) and regexp_replace(other.telefone, '[^0-9]', '', 'g') like '55%' then right(regexp_replace(other.telefone, '[^0-9]', '', 'g'), 11) else regexp_replace(other.telefone, '[^0-9]', '', 'g') end)
      = (case when length(regexp_replace(whatsapp_cadastros.telefone, '[^0-9]', '', 'g')) in (12,13) and regexp_replace(whatsapp_cadastros.telefone, '[^0-9]', '', 'g') like '55%' then right(regexp_replace(whatsapp_cadastros.telefone, '[^0-9]', '', 'g'), 11) else regexp_replace(whatsapp_cadastros.telefone, '[^0-9]', '', 'g') end)
  );
