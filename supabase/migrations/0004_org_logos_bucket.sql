insert into storage.buckets (id, name, public) values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

create policy "org_logos_read_public" on storage.objects for select using (bucket_id = 'org-logos');
create policy "org_logos_write" on storage.objects for insert with check (bucket_id = 'org-logos');
create policy "org_logos_update" on storage.objects for update using (bucket_id = 'org-logos');
