-- "Delete for me" support: hidden_for tracks which users have hidden a
-- message from their own view without affecting the other partner (separate
-- from deleted_at, which is the existing "delete for everyone" tombstone).
alter table messages
  add column if not exists hidden_for uuid[] not null default '{}';

-- Shared chat wallpaper: one row per couple, either a preset key or a
-- custom uploaded photo. Both partners see the same background, matching
-- how everything else in this app is couple-scoped rather than per-user.
create table if not exists chat_background (
  couple_id uuid primary key references couple(id) on delete cascade,
  preset text,
  photo_path text,
  updated_by uuid references auth.users default auth.uid(),
  updated_at timestamptz not null default now()
);

alter table chat_background enable row level security;

create policy "chat_background: members can select"
  on chat_background for select using (couple_id = my_couple_id());
create policy "chat_background: members can insert"
  on chat_background for insert with check (couple_id = my_couple_id());
create policy "chat_background: members can update"
  on chat_background for update using (couple_id = my_couple_id());
create policy "chat_background: members can delete"
  on chat_background for delete using (couple_id = my_couple_id());

-- Reuses the chat-media bucket (already private, already scoped by
-- couple_id folder via my_couple_id() in 0006_chat.sql) — custom wallpaper
-- photos live under {couple_id}/backgrounds/... so no new bucket is needed.
