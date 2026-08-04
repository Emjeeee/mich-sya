-- Date session foundation: start/end a date, capture duration + location +
-- summary. The web UI only uses a couple of geolocation reads (start/end),
-- but the schema is built for a future, separate mobile app to push
-- periodic GPS breadcrumbs into `date_session_locations` — same Supabase
-- project, same RLS, no changes needed on either side when that app exists.

create table if not exists date_sessions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  title text,
  summary text,
  start_lat double precision,
  start_lng double precision,
  end_lat double precision,
  end_lng double precision,
  created_by uuid references auth.users default auth.uid(),
  created_at timestamptz not null default now()
);

alter table date_sessions enable row level security;

create policy "date_sessions: members can select"
  on date_sessions for select using (couple_id = my_couple_id());
create policy "date_sessions: members can insert"
  on date_sessions for insert with check (couple_id = my_couple_id() and created_by = auth.uid());
create policy "date_sessions: members can update"
  on date_sessions for update using (couple_id = my_couple_id());
create policy "date_sessions: members can delete"
  on date_sessions for delete using (couple_id = my_couple_id());

-- Periodic location breadcrumbs for a session — mostly unused by the web UI
-- today, this is the table the future mobile app writes into.
create table if not exists date_session_locations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references date_sessions(id) on delete cascade not null,
  couple_id uuid references couple(id) not null,
  lat double precision not null,
  lng double precision not null,
  recorded_at timestamptz not null default now()
);

alter table date_session_locations enable row level security;

create policy "date_session_locations: members can select"
  on date_session_locations for select using (couple_id = my_couple_id());
create policy "date_session_locations: members can insert"
  on date_session_locations for insert with check (couple_id = my_couple_id());

-- "Wishlist item becomes a couple-goal to-do" — a standalone link, not tied
-- to date sessions specifically.
alter table couple_goals
  add column if not exists linked_wishlist_item_id uuid references wishlist_items(id) on delete set null;
