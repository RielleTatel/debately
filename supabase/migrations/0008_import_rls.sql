alter table public.tournament_institutions        enable row level security;
alter table public.institution_aliases            enable row level security;
alter table public.teams                          enable row level security;
alter table public.participants                   enable row level security;
alter table public.adjudicators                   enable row level security;
alter table public.csv_imports                    enable row level security;
alter table public.csv_import_rows                enable row level security;
alter table public.column_mappings                enable row level security;
alter table public.institution_portal_tokens      enable row level security;

create policy "tournament_institutions_member_select"
on public.tournament_institutions for select
using (
  exists (
    select 1
    from public.tournaments t
    join public.organization_members m on m.org_id = t.org_id
    join public.profiles p on p.id = m.profile_id
    where t.id = tournament_institutions.tournament_id
      and p.user_id = auth.uid()::text
  )
);

create policy "tournament_institutions_director_write"
on public.tournament_institutions for all
using (
  exists (
    select 1
    from public.tournaments t
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where t.id = tournament_institutions.tournament_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_directors td
    join public.profiles p on p.id = td.profile_id
    where td.tournament_id = tournament_institutions.tournament_id
      and p.user_id = auth.uid()::text
  )
)
with check (
  exists (
    select 1
    from public.tournaments t
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where t.id = tournament_institutions.tournament_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_directors td
    join public.profiles p on p.id = td.profile_id
    where td.tournament_id = tournament_institutions.tournament_id
      and p.user_id = auth.uid()::text
  )
);

create policy "teams_member_select"
on public.teams for select using (
  exists (
    select 1
    from public.tournament_institutions ti
    join public.tournaments t on t.id = ti.tournament_id
    join public.organization_members m on m.org_id = t.org_id
    join public.profiles p on p.id = m.profile_id
    where ti.id = teams.tournament_institution_id
      and p.user_id = auth.uid()::text
  )
);

create policy "teams_director_write"
on public.teams for all
using (
  exists (
    select 1
    from public.tournament_institutions ti
    join public.tournaments t on t.id = ti.tournament_id
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where ti.id = teams.tournament_institution_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_institutions ti
    join public.tournament_directors td on td.tournament_id = ti.tournament_id
    join public.profiles p on p.id = td.profile_id
    where ti.id = teams.tournament_institution_id
      and p.user_id = auth.uid()::text
  )
)
with check (true);

create policy "participants_member_select"
on public.participants for select using (
  exists (
    select 1
    from public.tournament_institutions ti
    join public.tournaments t on t.id = ti.tournament_id
    join public.organization_members m on m.org_id = t.org_id
    join public.profiles p on p.id = m.profile_id
    where ti.id = participants.tournament_institution_id
      and p.user_id = auth.uid()::text
  )
);

create policy "participants_director_write"
on public.participants for all
using (
  exists (
    select 1
    from public.tournament_institutions ti
    join public.tournaments t on t.id = ti.tournament_id
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where ti.id = participants.tournament_institution_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_institutions ti
    join public.tournament_directors td on td.tournament_id = ti.tournament_id
    join public.profiles p on p.id = td.profile_id
    where ti.id = participants.tournament_institution_id
      and p.user_id = auth.uid()::text
  )
)
with check (true);

create policy "adjudicators_member_select"
on public.adjudicators for select using (
  exists (
    select 1
    from public.tournaments t
    join public.organization_members m on m.org_id = t.org_id
    join public.profiles p on p.id = m.profile_id
    where t.id = adjudicators.tournament_id
      and p.user_id = auth.uid()::text
  )
);

create policy "adjudicators_director_write"
on public.adjudicators for all
using (
  exists (
    select 1
    from public.tournaments t
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where t.id = adjudicators.tournament_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_directors td
    join public.profiles p on p.id = td.profile_id
    where td.tournament_id = adjudicators.tournament_id
      and p.user_id = auth.uid()::text
  )
)
with check (true);

create policy "institution_aliases_director_all"
on public.institution_aliases for all
using (
  exists (
    select 1
    from public.tournaments t
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where t.id = institution_aliases.tournament_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_directors td
    join public.profiles p on p.id = td.profile_id
    where td.tournament_id = institution_aliases.tournament_id
      and p.user_id = auth.uid()::text
  )
)
with check (true);

create policy "csv_imports_director_all"
on public.csv_imports for all
using (
  exists (
    select 1
    from public.tournaments t
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where t.id = csv_imports.tournament_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_directors td
    join public.profiles p on p.id = td.profile_id
    where td.tournament_id = csv_imports.tournament_id
      and p.user_id = auth.uid()::text
  )
)
with check (true);

create policy "csv_import_rows_director_all"
on public.csv_import_rows for all
using (
  exists (
    select 1
    from public.csv_imports ci
    join public.tournaments t on t.id = ci.tournament_id
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where ci.id = csv_import_rows.import_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.csv_imports ci
    join public.tournament_directors td on td.tournament_id = ci.tournament_id
    join public.profiles p on p.id = td.profile_id
    where ci.id = csv_import_rows.import_id
      and p.user_id = auth.uid()::text
  )
)
with check (true);

create policy "column_mappings_member_select"
on public.column_mappings for select
using (
  exists (
    select 1
    from public.organization_members m
    join public.profiles p on p.id = m.profile_id
    where m.org_id = column_mappings.org_id
      and p.user_id = auth.uid()::text
  )
);

create policy "column_mappings_owner_or_director_write"
on public.column_mappings for all
using (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = column_mappings.org_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournaments t
    join public.tournament_directors td on td.tournament_id = t.id
    join public.profiles p on p.id = td.profile_id
    where t.org_id = column_mappings.org_id
      and p.user_id = auth.uid()::text
  )
)
with check (true);

create policy "institution_portal_tokens_director_all"
on public.institution_portal_tokens for all
using (
  exists (
    select 1
    from public.tournament_institutions ti
    join public.tournaments t on t.id = ti.tournament_id
    join public.organizations o on o.id = t.org_id
    join public.profiles p on p.id = o.owner_id
    where ti.id = institution_portal_tokens.tournament_institution_id
      and p.user_id = auth.uid()::text
  )
  or exists (
    select 1
    from public.tournament_institutions ti
    join public.tournament_directors td on td.tournament_id = ti.tournament_id
    join public.profiles p on p.id = td.profile_id
    where ti.id = institution_portal_tokens.tournament_institution_id
      and p.user_id = auth.uid()::text
  )
)
with check (true);
