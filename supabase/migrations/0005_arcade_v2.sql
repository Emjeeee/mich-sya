-- Arcade Room v2: generalizes game_sessions from tic-tac-toe-only to any
-- online-capable game, and adds a scoreboard/leaderboard table.
-- Additive on top of 0003_arcade.sql (which may already be applied live) —
-- nothing here edits or drops existing data.

-- `board` was tic-tac-toe-specific; `state` holds whatever shape each game
-- needs (a 9-cell array, a 7x6 grid, a {scores} object, etc).
alter table game_sessions rename column board to state;

alter table game_sessions drop constraint if exists game_sessions_game_type_check;
alter table game_sessions add constraint game_sessions_game_type_check
  check (game_type in ('tictactoe', 'connectfour', 'rps', 'hangman', 'dice', 'trivia'));

alter table game_sessions alter column winner drop not null;
alter table game_sessions drop constraint if exists game_sessions_winner_check;
alter table game_sessions add constraint game_sessions_winner_check
  check (winner in ('x', 'o', 'draw', 'p1', 'p2'));

create table if not exists game_scores (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  game_key text not null,
  user_id uuid references auth.users,
  winner_user_id uuid references auth.users,
  score integer,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table game_scores enable row level security;

create policy "scores: members can select"
  on game_scores for select using (couple_id = my_couple_id());
create policy "scores: members can insert"
  on game_scores for insert with check (couple_id = my_couple_id());
create policy "scores: members can delete"
  on game_scores for delete using (couple_id = my_couple_id());
