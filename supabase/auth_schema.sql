-- ---------------------------------------------------------------------------
-- WEDDING MAP - Auth / Login feature schema
--
-- Run this once in Supabase Dashboard -> SQL Editor, AFTER schema.sql has
-- already been run. Adds:
--   1. public.profiles       - nickname + profile photo per logged-in user
--   2. public.view_history   - server-side "최근 본 웨딩홀" per logged-in user
--   3. wedding_halls.created_by - so "내가 등록한 웨딩홀" can be queried
--      server-side for a logged-in user (works across devices)
--   4. an `avatars` Storage bucket for profile photos
--
-- NOTE on existing wedding_halls RLS: this migration does NOT tighten the
-- existing "Public insert/update/delete" policies in schema.sql. Anonymous
-- (logged-out) visitors can still register/edit/delete wedding halls, same
-- as before login existed - only now, if a user happens to be logged in
-- when they register one, it also gets tagged with their user id. Ask if
-- you'd like write access restricted to logged-in users only later.
-- ---------------------------------------------------------------------------

-- 1. profiles ----------------------------------------------------------------

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  nickname     text not null default '',
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles"
  on public.profiles for select
  using (true);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row the moment someone signs up, seeded from the
-- nickname passed in `supabase.auth.signUp({ options: { data: { nickname }}})`.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. view_history --------------------------------------------------------------

create table if not exists public.view_history (
  user_id     uuid not null references auth.users (id) on delete cascade,
  hall_id     uuid not null references public.wedding_halls (id) on delete cascade,
  viewed_at   timestamptz not null default now(),
  primary key (user_id, hall_id)
);

create index if not exists idx_view_history_user_viewed on public.view_history (user_id, viewed_at desc);

alter table public.view_history enable row level security;

drop policy if exists "Users select own view history" on public.view_history;
create policy "Users select own view history"
  on public.view_history for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own view history" on public.view_history;
create policy "Users insert own view history"
  on public.view_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own view history" on public.view_history;
create policy "Users update own view history"
  on public.view_history for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own view history" on public.view_history;
create policy "Users delete own view history"
  on public.view_history for delete
  using (auth.uid() = user_id);

-- 3. wedding_halls.created_by --------------------------------------------------

alter table public.wedding_halls
  add column if not exists created_by uuid references auth.users (id) on delete set null;

create index if not exists idx_wedding_halls_created_by on public.wedding_halls (created_by);

-- 4. avatars storage bucket -----------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Public read avatars bucket" on storage.objects;
create policy "Public read avatars bucket"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Authenticated upload avatars bucket" on storage.objects;
create policy "Authenticated upload avatars bucket"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "Authenticated update avatars bucket" on storage.objects;
create policy "Authenticated update avatars bucket"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');
