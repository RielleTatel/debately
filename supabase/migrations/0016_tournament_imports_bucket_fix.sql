drop policy if exists "tournament_imports_service_read" on storage.objects;
drop policy if exists "tournament_imports_service_write" on storage.objects;
drop policy if exists "tournament_imports_service_delete" on storage.objects;

create policy "tournament_imports_read"
on storage.objects for select
using (bucket_id = 'tournament-imports' and auth.role() = 'authenticated');

create policy "tournament_imports_write"
on storage.objects for insert
with check (bucket_id = 'tournament-imports' and auth.role() = 'authenticated');

create policy "tournament_imports_update"
on storage.objects for update
using (bucket_id = 'tournament-imports' and auth.role() = 'authenticated');

create policy "tournament_imports_delete"
on storage.objects for delete
using (bucket_id = 'tournament-imports' and auth.role() = 'authenticated');
