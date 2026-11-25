-- Teacher area: a teacher sees only classes where classes.teacher_id = them,
-- the learners enrolled there, their leave requests, and records attendance.

-- ---------- helpers ----------
create or replace function public.is_class_teacher(p_class uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.classes where id = p_class and teacher_id = (select auth.uid()));
$$;

create or replace function public.is_session_teacher(p_session uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.class_sessions s join public.classes c on c.id = s.class_id
    where s.id = p_session and c.teacher_id = (select auth.uid())
  );
$$;

create or replace function public.teaches_child(p_child uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.enrollments e join public.classes c on c.id = e.class_id
    where e.child_id = p_child and e.status <> 'cancelled' and c.teacher_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_class_teacher(uuid) from public, anon;
revoke execute on function public.is_session_teacher(uuid) from public, anon;
revoke execute on function public.teaches_child(uuid) from public, anon;
grant execute on function public.is_class_teacher(uuid) to authenticated;
grant execute on function public.is_session_teacher(uuid) to authenticated;
grant execute on function public.teaches_child(uuid) to authenticated;


-- ---------- read access ----------
create policy "enrollments: teacher reads own classes" on public.enrollments for select to authenticated
  using ((select public.is_class_teacher(class_id)));
create policy "children: teacher reads own learners" on public.children for select to authenticated
  using ((select public.teaches_child(id)));
create policy "leave: teacher reads own sessions" on public.leave_requests for select to authenticated
  using ((select public.is_session_teacher(session_id)));
create policy "attendance: teacher reads own sessions" on public.attendance for select to authenticated
  using ((select public.is_session_teacher(session_id)));

-- ---------- attendance writes (insert + update so the app can upsert) ----------
create policy "attendance: teacher records" on public.attendance for insert to authenticated
  with check ((select public.is_session_teacher(session_id)) and (select public.teaches_child(child_id)));
create policy "attendance: teacher edits" on public.attendance for update to authenticated
  using ((select public.is_session_teacher(session_id)))
  with check ((select public.is_session_teacher(session_id)) and (select public.teaches_child(child_id)));

-- ---------- admin: roles and class teacher ----------
create or replace function public.admin_set_role(p_user uuid, p_role public.user_role)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if p_user = (select auth.uid()) then raise exception 'Cannot change your own role'; end if;
  update public.profiles set role = p_role where id = p_user;
  if not found then raise exception 'User not found'; end if;
  -- A demoted teacher no longer owns classes.
  if p_role = 'parent' then
    update public.classes set teacher_id = null where teacher_id = p_user;
  end if;
end $$;

create or replace function public.admin_assign_teacher(p_class uuid, p_teacher uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if p_teacher is not null and not exists (
    select 1 from public.profiles where id = p_teacher and role in ('teacher', 'admin')
  ) then
    raise exception 'Not a teacher';
  end if;
  update public.classes set teacher_id = p_teacher where id = p_class;
  if not found then raise exception 'Class not found'; end if;
end $$;

revoke execute on function public.admin_set_role(uuid, public.user_role) from public, anon;
revoke execute on function public.admin_assign_teacher(uuid, uuid) from public, anon;
grant execute on function public.admin_set_role(uuid, public.user_role) to authenticated;
grant execute on function public.admin_assign_teacher(uuid, uuid) to authenticated;
