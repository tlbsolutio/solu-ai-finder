-- RPC to get user emails for admin panel
-- Only returns data when called by the admin user
create or replace function admin_get_user_emails(user_ids uuid[])
returns table(id uuid, email text)
language sql
security definer
as $$
  select au.id, au.email::text
  from auth.users au
  where au.id = any(user_ids);
$$;
