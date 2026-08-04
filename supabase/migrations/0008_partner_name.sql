-- Expose the current user's partner's display name (chat header, unread
-- notifications, etc.) without granting broad client access to auth.users.
-- security definer runs as the function owner, who can read auth.users;
-- the function itself only ever returns the caller's own partner's name
-- (scoped through my_couple_id(), excluding the caller), so no cross-couple
-- data can leak through it.
create or replace function partner_display_name()
returns text
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  result text;
begin
  select coalesce(u.raw_user_meta_data ->> 'display_name', split_part(u.email, '@', 1))
  into result
  from auth.users u
  join couple c on u.id = c.partner1_id or u.id = c.partner2_id
  where c.id = my_couple_id()
    and u.id <> auth.uid()
  limit 1;

  return result;
end;
$$;

grant execute on function partner_display_name() to authenticated;
