alter table public.institution_claims        enable row level security;
alter table public.team_validation_flags     enable row level security;

create policy "institution_claims_owner_or_member_select"
on public.institution_claims for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = institution_claims.profile_id and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_institutions ti
    join public.tournaments t on t.id = ti.tournament_id
    join public.organization_members m on m.org_id = t.org_id
    join public.profiles p on p.id = m.profile_id
    where ti.id = institution_claims.tournament_institution_id
      and p.user_id = auth.uid()::text
  )
);

create policy "institution_claims_director_write"
on public.institution_claims for all
using (
  exists (
    select 1
    from public.tournament_institutions ti
    join public.tournaments t on t.id = ti.tournament_id
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where ti.id = institution_claims.tournament_institution_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_institutions ti
    join public.tournament_directors td on td.tournament_id = ti.tournament_id
    join public.profiles p on p.id = td.profile_id
    where ti.id = institution_claims.tournament_institution_id
      and p.user_id = auth.uid()::text
  )
)
with check (true);

create policy "institution_claims_self_insert"
on public.institution_claims for insert
with check (
  exists (
    select 1 from public.profiles p
    where p.id = institution_claims.profile_id and p.user_id = auth.uid()::text
  )
);

create policy "team_validation_flags_member_select"
on public.team_validation_flags for select
using (
  exists (
    select 1
    from public.teams t
    join public.tournament_institutions ti on ti.id = t.tournament_institution_id
    join public.tournaments tt on tt.id = ti.tournament_id
    join public.organization_members m on m.org_id = tt.org_id
    join public.profiles p on p.id = m.profile_id
    where t.id = team_validation_flags.team_id
      and p.user_id = auth.uid()::text
  )
);

create policy "team_validation_flags_director_write"
on public.team_validation_flags for all
using (
  exists (
    select 1
    from public.teams t
    join public.tournament_institutions ti on ti.id = t.tournament_institution_id
    join public.tournaments tt on tt.id = ti.tournament_id
    join public.organizations o on o.id = tt.org_id
    join public.profiles p on p.id = o.owner_id
    where t.id = team_validation_flags.team_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.teams t
    join public.tournament_institutions ti on ti.id = t.tournament_institution_id
    join public.tournament_directors td on td.tournament_id = ti.tournament_id
    join public.profiles p on p.id = td.profile_id
    where t.id = team_validation_flags.team_id
      and p.user_id = auth.uid()::text
  )
)
with check (true);

create policy "institution_portal_tokens_anon_select"
on public.institution_portal_tokens for select
to anon
using (active = true);
