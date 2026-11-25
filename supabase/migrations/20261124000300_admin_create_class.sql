-- Admin: create a class and generate all its sessions in one step.
-- p_days: weekdays to meet, 0 = Sunday ... 6 = Saturday. Times are Asia/Bangkok.
-- Session count comes from the course (L1 10, L2 30, L3 50).
create or replace function public.admin_create_class(
  p_level smallint,
  p_age_group public.age_group,
  p_title text,
  p_room text,
  p_capacity int,
  p_start date,
  p_days int[],
  p_time time,
  p_minutes int default 60
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_course public.courses;
  v_class uuid;
  v_day date := p_start;
  v_n int := 0;
  v_l1 text[] := array[
    'สมองของฉันทำงานยังไง', 'ลมหายใจลูกโป่ง', 'ดูให้ดี จำให้ได้', 'หูไว ใจนิ่ง', 'จัดโต๊ะ จัดใจ',
    'สีหลอกตา', 'หยุดก่อนคิด', 'วาดอย่างจดจ่อ', 'ช่วยเพื่อนจดจ่อ', 'สรุปและฉลองจบ'
  ];
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if char_length(coalesce(trim(p_title), '')) not between 1 and 120 then raise exception 'Invalid title'; end if;
  if p_capacity not between 1 and 100 then raise exception 'Invalid capacity'; end if;
  if p_minutes not between 15 and 180 then raise exception 'Invalid duration'; end if;
  if coalesce(array_length(p_days, 1), 0) = 0 or exists (select 1 from unnest(p_days) d where d not between 0 and 6) then
    raise exception 'Invalid weekdays';
  end if;
  if p_start < current_date then raise exception 'Start date is in the past'; end if;

  select * into v_course from public.courses where level = p_level;
  if not found then raise exception 'Course not found'; end if;

  insert into public.classes (course_id, age_group, title, room, capacity)
  values (v_course.id, p_age_group, trim(p_title), nullif(trim(p_room), ''), p_capacity)
  returning id into v_class;

  while v_n < v_course.sessions loop
    if extract(dow from v_day)::int = any (p_days) then
      v_n := v_n + 1;
      insert into public.class_sessions (class_id, session_no, topic, starts_at, ends_at)
      values (
        v_class,
        v_n,
        case when p_level = 1 and v_n <= 10 then v_l1[v_n] else 'คาบที่ ' || v_n end,
        (v_day + p_time) at time zone 'Asia/Bangkok',
        (v_day + p_time + make_interval(mins => p_minutes)) at time zone 'Asia/Bangkok'
      );
    end if;
    v_day := v_day + 1;
  end loop;

  return v_class;
end $$;

revoke execute on function public.admin_create_class(smallint, public.age_group, text, text, int, date, int[], time, int) from public, anon;
grant execute on function public.admin_create_class(smallint, public.age_group, text, text, int, date, int[], time, int) to authenticated;
