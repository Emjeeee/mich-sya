-- Gallery: bulk photo uploads, shown as an auto-looping card on the dashboard.
-- Uses the existing private couple-photos bucket (folder "gallery"), same as
-- memories/journey — this is authenticated-only content, not public like the
-- landing-page cover photo. Run after 0001_init.sql.

create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couple(id) not null,
  photo_path text not null,
  created_by uuid references auth.users default auth.uid(),
  created_at timestamptz not null default now()
);

alter table gallery_photos enable row level security;

create policy "gallery: members can select"
  on gallery_photos for select using (couple_id = my_couple_id());
create policy "gallery: members can insert"
  on gallery_photos for insert with check (couple_id = my_couple_id() and created_by = auth.uid());
create policy "gallery: members can delete"
  on gallery_photos for delete using (couple_id = my_couple_id());
