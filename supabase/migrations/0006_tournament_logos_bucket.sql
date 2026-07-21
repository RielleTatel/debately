insert into storage.buckets (id, name, public) values ('tournament-logos', 'tournament-logos', true)
on conflict (id) do nothing;

create policy "tournament_logos_read_public" on storage.objects for select using (bucket_id = 'tournament-logos');
create policy "tournament_logos_write" on storage.objects for insert with check (
  bucket_id = 'tournament-logos' and auth.role() = 'authenticated'
);
create policy "tournament_logos_update" on storage.objects for update using (
  bucket_id = 'tournament-logos' and auth.role() = 'authenticated'
);
