-- ---------------------------------------------------------------------------
-- WEDDING MAP - Supabase schema
--
-- Run this once in Supabase Dashboard -> SQL Editor (or via `supabase db push`)
-- after creating your project.
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

create table if not exists public.wedding_halls (
  id                     uuid primary key default gen_random_uuid(),

  name                   text not null,

  region                 text not null check (region in ('seoul', 'gyeonggi', 'incheon')),
  district               text not null default '',
  address                text not null,
  detail_address         text,
  latitude               double precision not null,
  longitude              double precision not null,

  main_image             text,
  images                 text[] not null default '{}',

  homepage               text,
  phone                  text,

  open_until             text,
  tags                   text[] not null default '{}',

  minimum_guests         integer,
  sunday_evening_guests  integer,

  rental_fee             integer, -- KRW, numeric (원)
  meal_price             integer, -- KRW, numeric (원, per person)

  negotiable             boolean default false,
  negotiable_memo        text,

  ceremony_type          text check (ceremony_type in ('분리예식', '동시예식')),
  hall_count             integer,

  -- Parking fields are stored and shown in the detail view ONLY.
  -- They are intentionally NEVER used for filtering or sorting (see README).
  parking_capacity       integer,
  parking_info           text,

  subway_info            text,
  shuttle_info           text,

  description            text,
  memo                   text,

  rating                 numeric(2, 1),
  review_count           integer default 0,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists idx_wedding_halls_region on public.wedding_halls (region);
create index if not exists idx_wedding_halls_district on public.wedding_halls (district);
create index if not exists idx_wedding_halls_created_at on public.wedding_halls (created_at desc);

-- keep updated_at current on every update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_wedding_halls_updated_at on public.wedding_halls;
create trigger trg_wedding_halls_updated_at
  before update on public.wedding_halls
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- MVP policy: anyone can read; anyone can write. This matches the current
-- app (no user accounts / admin login yet - spec section 34). Before going
-- to production, replace the write policies with `using (auth.uid() = ...)`
-- checks once an admin/auth system exists.
-- ---------------------------------------------------------------------------

alter table public.wedding_halls enable row level security;

drop policy if exists "Public read access" on public.wedding_halls;
create policy "Public read access"
  on public.wedding_halls for select
  using (true);

drop policy if exists "Public insert access" on public.wedding_halls;
create policy "Public insert access"
  on public.wedding_halls for insert
  with check (true);

drop policy if exists "Public update access" on public.wedding_halls;
create policy "Public update access"
  on public.wedding_halls for update
  using (true);

drop policy if exists "Public delete access" on public.wedding_halls;
create policy "Public delete access"
  on public.wedding_halls for delete
  using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for wedding hall images (create via Dashboard -> Storage,
-- or run this block once storage schema is available in your project)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('wedding-halls', 'wedding-halls', true)
on conflict (id) do nothing;

drop policy if exists "Public read wedding-halls bucket" on storage.objects;
create policy "Public read wedding-halls bucket"
  on storage.objects for select
  using (bucket_id = 'wedding-halls');

drop policy if exists "Public upload wedding-halls bucket" on storage.objects;
create policy "Public upload wedding-halls bucket"
  on storage.objects for insert
  with check (bucket_id = 'wedding-halls');
