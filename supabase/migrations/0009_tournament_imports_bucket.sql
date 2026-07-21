insert into storage.buckets (id, name, public)
values ('tournament-imports', 'tournament-imports', false)
on conflict (id) do nothing;

create policy "tournament_imports_service_read"
on storage.objects for select
using (bucket_id = 'tournament-imports' and auth.role() = 'service_role');

create policy "tournament_imports_service_write"
on storage.objects for insert
with check (bucket_id = 'tournament-imports' and auth.role() = 'service_role');

create policy "tournament_imports_service_delete"
on storage.objects for delete
using (bucket_id = 'tournament-imports' and auth.role() = 'service_role');
