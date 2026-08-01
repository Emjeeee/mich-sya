-- Couple Tracker schema for Michael & Ruth
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).

-- ============================================================
-- couple: exactly one row, linking the two partners.
-- partner1_id / partner2_id are set manually after both partners
-- have signed up once — see README setup runbook.
-- ============================================================
create table if not exists couple (
  id uuid primary key default gen_random_uuid(),
  partner1_id uuid references auth.users not null,
  partner2_id uuid references auth.users,
  anniversary_date date,
  created_at timestamptz not null default now()
);

alter table couple enable row level security;

create policy "couple: members can select"
  on couple for select
  using (auth.uid() = partner1_id or auth.uid() = partner2_id);

create policy "couple: members can update"
  on couple for update
  using (auth.uid() = partner1_id or auth.uid() = partner2_id);

create policy "couple: self can insert as partner1"
  on couple for insert
  with check (auth.uid() = partner1_id);

-- Helper used by every feature table's RLS policy below.
-- Default (invoker) security is fine: it only ever returns a row the
-- caller can already SELECT via the policy above.
create or replace function my_couple_id()
returns uuid
language sql
stable
set search_path = public, pg_temp
as $$
  select id from couple
  where auth.uid() = partner1_id or auth.uid() = partner2_id
  limit 1;
$$;

-- ============================================================
-- wishlist_items
-- ============================================================
create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  title text not null,
  description text,
  image_url text,
  is_done boolean not null default false,
  created_by uuid references auth.users default auth.uid(),
  created_at timestamptz not null default now()
);

alter table wishlist_items enable row level security;

create policy "wishlist: members can select"
  on wishlist_items for select using (couple_id = my_couple_id());
create policy "wishlist: members can insert"
  on wishlist_items for insert with check (couple_id = my_couple_id() and created_by = auth.uid());
create policy "wishlist: members can update"
  on wishlist_items for update using (couple_id = my_couple_id());
create policy "wishlist: members can delete"
  on wishlist_items for delete using (couple_id = my_couple_id());

-- ============================================================
-- memories
-- ============================================================
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  title text not null,
  description text,
  photo_url text,
  location text,
  memory_date date not null default current_date,
  created_by uuid references auth.users default auth.uid(),
  created_at timestamptz not null default now()
);

alter table memories enable row level security;

create policy "memories: members can select"
  on memories for select using (couple_id = my_couple_id());
create policy "memories: members can insert"
  on memories for insert with check (couple_id = my_couple_id() and created_by = auth.uid());
create policy "memories: members can update"
  on memories for update using (couple_id = my_couple_id());
create policy "memories: members can delete"
  on memories for delete using (couple_id = my_couple_id());

-- ============================================================
-- schedules (date planning)
-- ============================================================
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  title text not null,
  description text,
  location text,
  scheduled_date date not null,
  scheduled_time time,
  status text not null default 'planned'
    check (status in ('planned', 'confirmed', 'completed', 'cancelled')),
  created_by uuid references auth.users default auth.uid(),
  created_at timestamptz not null default now()
);

alter table schedules enable row level security;

create policy "schedules: members can select"
  on schedules for select using (couple_id = my_couple_id());
create policy "schedules: members can insert"
  on schedules for insert with check (couple_id = my_couple_id() and created_by = auth.uid());
create policy "schedules: members can update"
  on schedules for update using (couple_id = my_couple_id());
create policy "schedules: members can delete"
  on schedules for delete using (couple_id = my_couple_id());

-- ============================================================
-- future_letters (time-capsule letters)
-- Base table RLS covers row visibility; the *content* column is
-- additionally masked via future_letters_view below so an unopened
-- letter's text never reaches the network before its unlock date.
-- ============================================================
create table if not exists future_letters (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  title text not null,
  content text not null,
  unlock_date date not null,
  is_opened boolean not null default false,
  opened_at timestamptz,
  created_by uuid references auth.users default auth.uid(),
  created_at timestamptz not null default now()
);

alter table future_letters enable row level security;

create policy "letters: members can select"
  on future_letters for select using (couple_id = my_couple_id());
create policy "letters: members can insert"
  on future_letters for insert with check (couple_id = my_couple_id() and created_by = auth.uid());
create policy "letters: members can update"
  on future_letters for update
  using (couple_id = my_couple_id())
  with check (couple_id = my_couple_id() and (is_opened = false or unlock_date <= current_date));
create policy "letters: members can delete"
  on future_letters for delete using (couple_id = my_couple_id());

create or replace view future_letters_view
  with (security_invoker = true) as
select
  id,
  couple_id,
  title,
  unlock_date,
  is_opened,
  opened_at,
  created_by,
  created_at,
  case when unlock_date <= current_date then content else null end as content
from future_letters;

-- Query future_letters_view (not future_letters directly) from the app
-- whenever you need to read a letter's content.

-- ============================================================
-- couple_goals
-- ============================================================
create table if not exists couple_goals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  title text not null,
  description text,
  target_date date,
  is_done boolean not null default false,
  created_by uuid references auth.users default auth.uid(),
  created_at timestamptz not null default now()
);

alter table couple_goals enable row level security;

create policy "goals: members can select"
  on couple_goals for select using (couple_id = my_couple_id());
create policy "goals: members can insert"
  on couple_goals for insert with check (couple_id = my_couple_id() and created_by = auth.uid());
create policy "goals: members can update"
  on couple_goals for update using (couple_id = my_couple_id());
create policy "goals: members can delete"
  on couple_goals for delete using (couple_id = my_couple_id());

-- ============================================================
-- journey_map (places visited together)
-- ============================================================
create table if not exists journey_map (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  place_name text not null,
  description text,
  photo_url text,
  lat double precision not null,
  lng double precision not null,
  visited_date date,
  created_by uuid references auth.users default auth.uid(),
  created_at timestamptz not null default now()
);

alter table journey_map enable row level security;

create policy "journey: members can select"
  on journey_map for select using (couple_id = my_couple_id());
create policy "journey: members can insert"
  on journey_map for insert with check (couple_id = my_couple_id() and created_by = auth.uid());
create policy "journey: members can update"
  on journey_map for update using (couple_id = my_couple_id());
create policy "journey: members can delete"
  on journey_map for delete using (couple_id = my_couple_id());

-- ============================================================
-- daily_vibes (mood tracker) — one entry per person per day
-- ============================================================
create table if not exists daily_vibes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  user_id uuid references auth.users not null default auth.uid(),
  mood text not null,
  note text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

alter table daily_vibes enable row level security;

create policy "vibes: members can select"
  on daily_vibes for select using (couple_id = my_couple_id());
create policy "vibes: members can insert"
  on daily_vibes for insert with check (couple_id = my_couple_id() and user_id = auth.uid());
create policy "vibes: members can update own entry"
  on daily_vibes for update using (couple_id = my_couple_id() and user_id = auth.uid());
create policy "vibes: members can delete own entry"
  on daily_vibes for delete using (couple_id = my_couple_id() and user_id = auth.uid());

-- ============================================================
-- Storage: private bucket for memory / journey photos,
-- folder-per-couple as {couple_id}/...
-- ============================================================
insert into storage.buckets (id, name, public)
values ('couple-photos', 'couple-photos', false)
on conflict (id) do nothing;

create policy "couple-photos: members can read"
  on storage.objects for select
  using (
    bucket_id = 'couple-photos'
    and (storage.foldername(name))[1] = (my_couple_id())::text
  );

create policy "couple-photos: members can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'couple-photos'
    and (storage.foldername(name))[1] = (my_couple_id())::text
  );

create policy "couple-photos: members can delete"
  on storage.objects for delete
  using (
    bucket_id = 'couple-photos'
    and (storage.foldername(name))[1] = (my_couple_id())::text
  );

-- ============================================================
-- One-time manual step (run AFTER both partners have signed up once
-- via the app's /signup page): link the couple row. See README.
-- ============================================================
-- insert into couple (partner1_id, partner2_id, anniversary_date)
-- select
--   (select id from auth.users where email = 'michael@example.com'),
--   (select id from auth.users where email = 'ruth@example.com'),
--   '2020-01-01';
