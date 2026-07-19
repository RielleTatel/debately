-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Self select
create policy "profiles_self_select"
on public.profiles for select
using (auth.uid()::text = user_id);

-- Self insert (first profile row created on registration)
create policy "profiles_self_insert"
on public.profiles for insert
with check (auth.uid()::text = user_id);

-- Self update
create policy "profiles_self_update"
on public.profiles for update
using (auth.uid()::text = user_id)
with check (auth.uid()::text = user_id);

-- No delete policy — profiles are only removed via account deletion (out of scope Phase 1)
