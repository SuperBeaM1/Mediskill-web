-- Admin actions. Admins already read everything through the is_admin() RLS policies;
-- writes go through these checked functions instead of broad UPDATE policies.

-- Review a submitted slip. Approve: payment -> approved and its pending enrollments -> active.
create or replace function public.admin_review_payment(p_payment uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;

  update public.payments
  set status = case when p_approve then 'approved'::public.payment_status else 'rejected'::public.payment_status end,
      paid_at = case when p_approve then now() end
  where id = p_payment and status = 'submitted';
  if not found then raise exception 'Payment is not waiting for review'; end if;

  if p_approve then
    update public.enrollments set status = 'active' where payment_id = p_payment and status = 'pending';
  end if;
end $$;

-- Change a catalog price (THB). p_kind: 'course' (p_key = level 1-3) or 'package' (p_key = code).
create or replace function public.admin_set_price(p_kind text, p_key text, p_price int)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if p_price is null or p_price < 0 or p_price > 1000000 then raise exception 'Invalid price'; end if;

  if p_kind = 'course' then
    update public.courses set price = p_price where level = p_key::smallint;
  elsif p_kind = 'package' then
    update public.packages set price = p_price where code = p_key;
  else
    raise exception 'Unknown kind %', p_kind;
  end if;
  if not found then raise exception 'Item not found'; end if;
end $$;

revoke execute on function public.admin_review_payment(uuid, boolean) from public, anon;
revoke execute on function public.admin_set_price(text, text, int) from public, anon;
grant execute on function public.admin_review_payment(uuid, boolean) to authenticated;
grant execute on function public.admin_set_price(text, text, int) to authenticated;
