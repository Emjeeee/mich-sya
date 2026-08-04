-- Arcade Room v3: widens game_sessions' game_type to cover four more games
-- going online (Would You Rather, Truth or Dare, Tebak Angka, Adu Ketuk).
-- Never edit 0005_arcade_v2.sql's original constraint — replace it here instead.

alter table game_sessions drop constraint if exists game_sessions_game_type_check;
alter table game_sessions add constraint game_sessions_game_type_check
  check (game_type in (
    'tictactoe', 'connectfour', 'rps', 'hangman', 'dice', 'trivia',
    'wouldyourather', 'truthordare', 'numberguess', 'tapbattle'
  ));
