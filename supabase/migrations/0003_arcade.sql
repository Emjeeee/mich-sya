-- Arcade Room: turn-based mini games shared by the couple.
-- Run this after 0001_init.sql and 0002_cover_photo.sql.
--
-- Online play uses short-interval polling (react-query refetchInterval) on
-- this table rather than Supabase Realtime — consistent with the rest of the
-- app's "sync, not instant" model, and avoids the extra setup/complexity of
-- enabling a realtime publication for a single-table, low-frequency use case.

create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  game_type text not null default 'tictactoe' check (game_type in ('tictactoe')),
  board jsonb not null default '["","","","","","","","",""]'::jsonb,
  turn uuid references auth.users,
  player_x uuid references auth.users,
  player_o uuid references auth.users,
  winner text check (winner in ('x', 'o', 'draw')),
  status text not null default 'active' check (status in ('active', 'finished')),
  created_by uuid references auth.users default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table game_sessions enable row level security;

create policy "games: members can select"
  on game_sessions for select using (couple_id = my_couple_id());
create policy "games: members can insert"
  on game_sessions for insert with check (couple_id = my_couple_id() and created_by = auth.uid());
create policy "games: members can update"
  on game_sessions for update using (couple_id = my_couple_id());
create policy "games: members can delete"
  on game_sessions for delete using (couple_id = my_couple_id());
