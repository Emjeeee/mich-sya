-- Real-time chat between the couple. One implicit conversation per couple —
-- no threads/conversations table needed since there's only ever two people.

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  sender_id uuid references auth.users not null,
  type text not null check (type in ('text', 'image', 'audio', 'video', 'gif')),
  content text,
  media_path text,
  media_duration_ms integer,
  reply_to_id uuid references messages(id) on delete set null,
  read_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_couple_created_idx on messages (couple_id, created_at desc);

alter table messages enable row level security;

create policy "messages: members can select"
  on messages for select using (couple_id = my_couple_id());
create policy "messages: members can insert"
  on messages for insert with check (couple_id = my_couple_id() and sender_id = auth.uid());
-- Broad update (not sender-only) so either partner can mark read receipts and
-- soft-delete/"unsend" — same trust-based simplification as future_letters
-- and the local pass-and-play games elsewhere in this app.
create policy "messages: members can update"
  on messages for update using (couple_id = my_couple_id());

-- Realtime: this is the app's first genuinely real-time feature (everything
-- else syncs via react-query polling/refetch-on-focus). If this statement
-- errors on your project, enable it instead via the dashboard: Database →
-- Replication → toggle the `messages` table on.
alter publication supabase_realtime add table messages;

-- Storage bucket for chat media (images/audio/video). GIFs are stored as
-- external GIPHY URLs in `content`, not uploaded here.
insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', false)
on conflict (id) do nothing;

create policy "chat-media: members can read"
  on storage.objects for select
  using (bucket_id = 'chat-media' and (storage.foldername(name))[1] = (my_couple_id())::text);

create policy "chat-media: members can upload"
  on storage.objects for insert
  with check (bucket_id = 'chat-media' and (storage.foldername(name))[1] = (my_couple_id())::text);

create policy "chat-media: members can delete"
  on storage.objects for delete
  using (bucket_id = 'chat-media' and (storage.foldername(name))[1] = (my_couple_id())::text);
