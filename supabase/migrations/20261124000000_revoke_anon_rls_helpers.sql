-- RLS helpers are only needed by signed-in users; block anon RPC calls.
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_my_child(uuid) from public, anon;
