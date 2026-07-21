insert into storage.buckets (id, name, public)
values ('institution-logos', 'institution-logos', true)
on conflict (id) do nothing;

create policy "institution_logos_read_public" on storage.objects for select
using (bucket_id = 'institution-logos');

create policy "institution_logos_authenticated_write" on storage.objects for insert
with check (bucket_id = 'institution-logos' and auth.role() = 'authenticated');

create policy "institution_logos_authenticated_update" on storage.objects for update
using (bucket_id = 'institution-logos' and auth.role() = 'authenticated');
