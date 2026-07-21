-- Enable RLS
alter table public.tournaments enable row level security;
alter table public.tournament_directors enable row level security;
alter table public.tournament_schedule_entries enable row level security;

-- tournaments: any org member can read
create policy "tournaments_member_select"
on public.tournaments for select
using (
  exists (
    select 1
    from public.organization_members m
    join public.profiles p on p.id = m.profile_id
    where m.org_id = tournaments.org_id
      and p.user_id = auth.uid()::text
  )
);

-- tournaments: org owner can insert
create policy "tournaments_director_insert"
on public.tournaments for insert
with check (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = tournaments.org_id
      and p.user_id = auth.uid()::text
  )
);

-- tournaments: org owner or director can update
create policy "tournaments_director_update"
on public.tournaments for update
using (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = tournaments.org_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_directors td
    join public.profiles p on p.id = td.profile_id
    where td.tournament_id = tournaments.id
      and p.user_id = auth.uid()::text
  )
);

-- tournaments: only org owner can delete
create policy "tournaments_owner_delete"
on public.tournaments for delete
using (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = tournaments.org_id
      and p.user_id = auth.uid()::text
  )
);

-- tournament_directors: org members can read
create policy "tournament_directors_member_select"
on public.tournament_directors for select
using (
  exists (
    select 1
    from public.tournaments t
    join public.organization_members m on m.org_id = t.org_id
    join public.profiles p on p.id = m.profile_id
    where t.id = tournament_directors.tournament_id
      and p.user_id = auth.uid()::text
  )
);

-- tournament_directors: only org owner can write
create policy "tournament_directors_owner_write"
on public.tournament_directors for all
using (
  exists (
    select 1
    from public.tournaments t
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where t.id = tournament_directors.tournament_id
      and p.user_id = auth.uid()::text
  )
)
with check (
  exists (
    select 1
    from public.tournaments t
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where t.id = tournament_directors.tournament_id
      and p.user_id = auth.uid()::text
  )
);

-- tournament_schedule_entries: org members can read
create policy "tournament_schedule_entries_member_select"
on public.tournament_schedule_entries for select
using (
  exists (
    select 1
    from public.tournaments t
    join public.organization_members m on m.org_id = t.org_id
    join public.profiles p on p.id = m.profile_id
    where t.id = tournament_schedule_entries.tournament_id
      and p.user_id = auth.uid()::text
  )
);

-- tournament_schedule_entries: directors and org owners can write
create policy "tournament_schedule_entries_director_write"
on public.tournament_schedule_entries for all
using (
  exists (
    select 1
    from public.tournaments t
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where t.id = tournament_schedule_entries.tournament_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_directors td
    join public.profiles p on p.id = td.profile_id
    where td.tournament_id = tournament_schedule_entries.tournament_id
      and p.user_id = auth.uid()::text
  )
)
with check (
  exists (
    select 1
    from public.tournaments t
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where t.id = tournament_schedule_entries.tournament_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_directors td
    join public.profiles p on p.id = td.profile_id
    where td.tournament_id = tournament_schedule_entries.tournament_id
      and p.user_id = auth.uid()::text
  )
);
