-- Initial schema for CaseKo: case_digests + profiles tables.
--
-- This file documents the schema as it currently exists in the live
-- Supabase project (confirmed via Table Editor schema view). It is
-- checked in for version-control history and so the schema can be
-- reproduced on a fresh Supabase project if needed.
--
-- Run supabase/migrations/*_create_profile_trigger.sql AFTER this file,
-- since that trigger references the profiles table created here.

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Note: this SELECT policy is intentionally public (using (true)) —
-- any authenticated user can view any profile's username/avatar_url.
-- This is the Supabase starter-template default. If you want profiles
-- to be private instead, change this to `using (auth.uid() = id)`.
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile."
  on public.profiles for update
  using (auth.uid() = id);

-- Note: there is intentionally no DELETE policy on profiles. Row
-- deletion during account deletion is handled by the admin (service
-- role) client in app/api/account/delete/route.ts, which bypasses RLS.
-- A user can never delete a profiles row directly through the app.

-- ============================================================
-- case_digests
-- ============================================================
create table if not exists public.case_digests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_title text not null,
  gr_number text not null,
  legal_classification text not null,
  subcategory text,
  doctrine text,
  facts text not null,
  issues text not null,
  ruling text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.case_digests enable row level security;

create policy "Users can view own digests"
  on public.case_digests for select
  using (auth.uid() = user_id);

create policy "Users can insert own digests"
  on public.case_digests for insert
  with check (auth.uid() = user_id);

create policy "Users can update own digests"
  on public.case_digests for update
  using (auth.uid() = user_id);

create policy "Users can delete own digests"
  on public.case_digests for delete
  using (auth.uid() = user_id);

-- Speeds up per-user dashboard/library queries, which always filter
-- or order by these columns.
create index if not exists case_digests_user_id_idx
  on public.case_digests (user_id);

create index if not exists case_digests_user_created_idx
  on public.case_digests (user_id, created_at desc);

-- Note: gr_number is not unique at the database level. Duplicate
-- detection is currently handled in the Create Digest UI (a pre-insert
-- check scoped to the current user), not enforced by a constraint here.
-- Consider adding:
--   alter table public.case_digests
--     add constraint case_digests_user_gr_number_unique
--     unique (user_id, gr_number);
-- if you want this enforced at the database level as well.

-- ============================================================
-- Storage: avatars bucket (used by Profile page avatar upload)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );