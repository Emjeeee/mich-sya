-- Adds a couple "cover photo" (shown on the public landing page, pre-login)
-- and a public bucket + narrow view to serve it to anonymous visitors.
-- Run this after 0001_init.sql.

alter table couple add column if not exists cover_photo_path text;

-- Public bucket: unlike couple-photos, this one is meant to be visible to
-- anyone hitting the landing page ("/") before they've logged in.
insert into storage.buckets (id, name, public)
values ('public-covers', 'public-covers', true)
on conflict (id) do nothing;

create policy "public-covers: members can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'public-covers'
    and (storage.foldername(name))[1] = (my_couple_id())::text
  );

create policy "public-covers: members can update"
  on storage.objects for update
  using (
    bucket_id = 'public-covers'
    and (storage.foldername(name))[1] = (my_couple_id())::text
  );

create policy "public-covers: members can delete"
  on storage.objects for delete
  using (
    bucket_id = 'public-covers'
    and (storage.foldername(name))[1] = (my_couple_id())::text
  );

create policy "public-covers: anyone can view"
  on storage.objects for select
  using (bucket_id = 'public-covers');

-- Narrow public view: exposes only the cover photo path (never partner IDs
-- or the anniversary date) to anonymous visitors of the landing page.
-- security_invoker is intentionally left at its default (off) here — the
-- opposite of future_letters_view — so it runs as the view owner and can
-- read past the base `couple` table's members-only RLS.
create or replace view couple_public_view as
select id, cover_photo_path
from couple
limit 1;

grant select on couple_public_view to anon, authenticated;
