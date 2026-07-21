insert into storage.buckets (id, name, public) values ('tournament-rules', 'tournament-rules', true)
on conflict (id) do nothing;

create policy "tournament_rules_read_public" on storage.objects for select using (bucket_id = 'tournament-rules');
create policy "tournament_rules_write" on storage.objects for insert with check (
  bucket_id = 'tournament-rules' and auth.role() = 'authenticated'
);
create policy "tournament_rules_update" on storage.objects for update using (
  bucket_id = 'tournament-rules' and auth.role() = 'authenticated'
);
