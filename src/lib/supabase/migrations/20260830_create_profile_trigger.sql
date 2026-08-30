-- Auto-create a profiles row whenever a new auth.users row is inserted.
--
-- This replaces the old client-side "insert into profiles" call made
-- right after supabase.auth.signUp(). That call was failing with:
--   "new row violates row-level security policy for table 'profiles'"
-- because signUp() has no active session until the user confirms their
-- email — so the insert request had no auth.uid(), and RLS rejected it.
--
-- SECURITY DEFINER makes this function run with the permissions of
-- whoever created it (the project owner), bypassing RLS deliberately
-- and safely for this one narrow purpose: creating the profile row the
-- instant the auth user exists, regardless of confirmation state.
--
-- NOTE: this file was already run manually in the Supabase Dashboard
-- SQL Editor. It's checked in here for version-control history and so
-- it can be re-applied to a fresh Supabase project if needed.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();