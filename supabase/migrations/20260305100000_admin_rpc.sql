-- RPC to get user emails for admin panel
-- Secured: only returns data when caller is admin (tlb@solutio.work)
create or replace function admin_get_user_emails()
returns table(id uuid, email text)
language sql
security definer
as $$
  select au.id, au.email::text
  from auth.users au
  where (select email from auth.users where id = auth.uid()) = 'tlb@solutio.work';
$$;
