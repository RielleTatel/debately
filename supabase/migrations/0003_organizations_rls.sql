-- Enable RLS
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_slug_aliases enable row level security;
alter table public.organization_invitations enable row level security;

-- Helper: profile id for the current auth user
-- Rely on inline lookups against public.profiles.user_id = auth.uid()::text.

-- organizations: members can read
create policy "organizations_member_select"
on public.organizations for select
using (
  exists (
    select 1
    from public.organization_members m
    join public.profiles p on p.id = m.profile_id
    where m.org_id = organizations.id
      and p.user_id = auth.uid()::text
  )
);

-- organizations: any verified authenticated user can insert (must be their own ownerId)
create policy "organizations_authenticated_insert"
on public.organizations for insert
with check (
  exists (
    select 1 from public.profiles p
    where p.id = organizations.owner_id
      and p.user_id = auth.uid()::text
  )
);

-- organizations: only owner can update
create policy "organizations_owner_update"
on public.organizations for update
using (
  exists (
    select 1 from public.profiles p
    where p.id = organizations.owner_id
      and p.user_id = auth.uid()::text
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = organizations.owner_id
      and p.user_id = auth.uid()::text
  )
);

-- organizations: only owner can delete
create policy "organizations_owner_delete"
on public.organizations for delete
using (
  exists (
    select 1 from public.profiles p
    where p.id = organizations.owner_id
      and p.user_id = auth.uid()::text
  )
);

-- organization_members: members of the same org can read
create policy "organization_members_member_select"
on public.organization_members for select
using (
  exists (
    select 1
    from public.organization_members m
    join public.profiles p on p.id = m.profile_id
    where m.org_id = organization_members.org_id
      and p.user_id = auth.uid()::text
  )
);

-- organization_members: owner can insert / update / delete
create policy "organization_members_owner_insert"
on public.organization_members for insert
with check (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = organization_members.org_id
      and p.user_id = auth.uid()::text
  )
);

create policy "organization_members_owner_update"
on public.organization_members for update
using (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = organization_members.org_id
      and p.user_id = auth.uid()::text
  )
);

create policy "organization_members_owner_delete"
on public.organization_members for delete
using (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = organization_members.org_id
      and p.user_id = auth.uid()::text
  )
);

-- organization_slug_aliases: publicly readable (needed for unauthenticated slug redirects)
create policy "organization_slug_aliases_public_select"
on public.organization_slug_aliases for select
using (true);

create policy "organization_slug_aliases_owner_write"
on public.organization_slug_aliases for all
using (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = organization_slug_aliases.org_id
      and p.user_id = auth.uid()::text
  )
)
with check (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = organization_slug_aliases.org_id
      and p.user_id = auth.uid()::text
  )
);

-- organization_invitations: owner sees all
create policy "organization_invitations_owner_select"
on public.organization_invitations for select
using (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = organization_invitations.org_id
      and p.user_id = auth.uid()::text
  )
);

-- organization_invitations: invitee can read own invitation by matching email on their auth user
create policy "organization_invitations_invitee_select"
on public.organization_invitations for select
using (
  organization_invitations.email = (auth.jwt() ->> 'email')
);

-- organization_invitations: owner can insert / update / delete
create policy "organization_invitations_owner_write"
on public.organization_invitations for all
using (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = organization_invitations.org_id
      and p.user_id = auth.uid()::text
  )
)
with check (
  exists (
    select 1
    from public.organizations o
    join public.profiles p on p.id = o.owner_id
    where o.id = organization_invitations.org_id
      and p.user_id = auth.uid()::text
  )
);
