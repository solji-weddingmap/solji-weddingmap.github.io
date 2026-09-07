-- ---------------------------------------------------------------------------
-- WEDDING MAP - Admin-only wedding hall management
--
-- Run this once in Supabase Dashboard -> SQL Editor, AFTER auth_schema.sql
-- has already been run. Changes:
--   1. profiles.is_admin - a simple boolean flag (default false)
--   2. wedding_halls insert/update/delete - now require is_admin = true
--      (previously anyone, even logged out, could write - see schema.sql).
--      Read access stays public.
--   3. the `wedding-halls` Storage bucket's upload policy - now also
--      requires is_admin = true, to match (uploading an orphaned image
--      nobody can attach to a hall isn't useful otherwise).
--
-- IMPORTANT: after running this, anonymous / non-admin visitors can no
-- longer register, edit, or delete wedding halls - only an account with
-- is_admin = true can. To make an account an admin, run:
--
--   update public.profiles set is_admin = true where id = '<user-uuid>';
--
-- (find the uuid in Authentication -> Users, or:
--   select id from auth.users where email = 'someone@example.com';)
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 1. wedding_halls: restrict write access to admins -----------------------

drop policy if exists "Public insert access" on public.wedding_halls;
drop policy if exists "Public update access" on public.wedding_halls;
drop policy if exists "Public delete access" on public.wedding_halls;

create policy "Admins insert wedding halls"
  on public.wedding_halls for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Admins update wedding halls"
  on public.wedding_halls for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Admins delete wedding halls"
  on public.wedding_halls for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- "Public read access" policy from schema.sql is untouched - anyone can
-- still browse/search wedding halls, only writing is restricted.

-- 2. wedding-halls bucket: restrict uploads to admins ----------------------

drop policy if exists "Public upload wedding-halls bucket" on storage.objects;
create policy "Admins upload wedding-halls bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'wedding-halls'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );
