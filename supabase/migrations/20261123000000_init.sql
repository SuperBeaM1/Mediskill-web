-- MeditSkill core schema (phase 1: parent web app)
-- PDPA: children store nickname + birth year only.

-- ---------- types ----------
create type public.user_role as enum ('parent', 'teacher', 'admin');
create type public.age_group as enum ('seed', 'sprout', 'tree');
create type public.enrollment_status as enum ('pending', 'active', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'submitted', 'approved', 'rejected');

-- ---------- tables ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'parent',
  full_name text not null check (char_length(full_name) between 1 and 120),
  phone text check (phone ~ '^0[0-9]{9}$'),
  pdpa_consent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 40),
  birth_year int not null check (birth_year between 2000 and 2100), -- Gregorian year
  age_group public.age_group not null default 'sprout',              -- set by trigger
  daily_limit_min int not null default 20 check (daily_limit_min between 10 and 60),
  pin_hash text,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  level smallint not null unique check (level between 1 and 3),
  name text not null,
  hours int not null check (hours > 0),
  sessions int not null check (sessions > 0),
  price int not null check (price >= 0), -- THB
  description text
);

-- Other priced products: bundle, monthly app, school package
create table public.packages (
  code text primary key,
  name text not null,
  price int not null check (price >= 0), -- THB
  unit text not null check (unit in ('one_time', 'month', 'classroom')),
  description text
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete restrict,
  teacher_id uuid references public.profiles (id) on delete set null,
  age_group public.age_group not null,
  title text not null,
  room text,
  capacity int not null default 10 check (capacity > 0)
);

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  session_no smallint not null check (session_no > 0),
  topic text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  unique (class_id, session_no)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  amount int not null check (amount > 0), -- THB
  description text not null,
  status public.payment_status not null default 'pending',
  slip_path text,
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete restrict,
  payment_id uuid references public.payments (id) on delete set null,
  is_bundle boolean not null default false, -- covered by a Bundle L1–L3 payment
  status public.enrollment_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (child_id, class_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.class_sessions (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  present boolean not null,
  focus_score smallint check (focus_score between 0 and 100),
  behavior_note text,
  created_at timestamptz not null default now(),
  unique (session_id, child_id)
);

create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.class_sessions (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, child_id)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  iq smallint check (iq between 0 and 100),
  ef smallint check (ef between 0 and 100),
  eq smallint check (eq between 0 and 100),
  aq smallint check (aq between 0 and 100),
  mq smallint check (mq between 0 and 100),
  sq smallint check (sq between 0 and 100),
  teacher_note text,
  unique (child_id, month)
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  skill text not null,
  min_age smallint not null default 5
);

create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete restrict,
  level smallint not null default 1,
  score int not null default 0,
  accuracy numeric(5, 2),
  reaction_ms int,
  duration_s int not null check (duration_s >= 0),
  created_at timestamptz not null default now()
);

-- FK indexes
create index on public.children (parent_id);
create index on public.classes (course_id);
create index on public.classes (teacher_id);
create index on public.class_sessions (starts_at);
create index on public.payments (parent_id);
create index on public.enrollments (class_id);
create index on public.enrollments (payment_id);
create index on public.attendance (child_id);
create index on public.leave_requests (child_id);
create index on public.game_sessions (child_id, created_at);
create index on public.game_sessions (game_id);

-- ---------- helpers ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create or replace function public.is_my_child(p_child uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.children where id = p_child and parent_id = (select auth.uid()));
$$;

create or replace function public.set_age_group()
returns trigger language plpgsql set search_path = '' as $$
declare a int := extract(year from now())::int - new.birth_year;
begin
  if a < 4 or a > 13 then
    raise exception 'Child age must be 5-12 (got %)', a;
  end if;
  new.age_group := case when a <= 7 then 'seed' when a <= 10 then 'sprout' else 'tree' end;
  return new;
end $$;

create trigger children_age_group before insert or update of birth_year on public.children
  for each row execute function public.set_age_group();

-- Signup: create profile (+ first child) from auth metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, full_name, phone, pdpa_consent_at)
  values (
    new.id,
    coalesce(nullif(m->>'full_name', ''), split_part(new.email, '@', 1)),
    nullif(m->>'phone', ''),
    case when (m->>'pdpa_consent')::boolean then now() end
  );
  if nullif(m->>'child_nickname', '') is not null and (m->>'child_birth_year') ~ '^[0-9]{4}$' then
    insert into public.children (parent_id, nickname, birth_year)
    values (new.id, m->>'child_nickname', (m->>'child_birth_year')::int);
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enroll a child. Prices come from the catalog, never from the client:
--  * p_bundle = true (Level 1 class only): one payment at the Bundle L1–L3 price
--  * child already holds a bundle: Level 2/3 enrollment reuses that payment, no new bill
--  * otherwise: one payment at the course price
create or replace function public.enroll_child(p_child uuid, p_class uuid, p_bundle boolean default false)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_course public.courses;
  v_child public.children;
  v_bundle_payment uuid;
  v_payment uuid;
  v_price int;
begin
  select * into v_child from public.children where id = p_child and parent_id = (select auth.uid());
  if not found then raise exception 'Child not found'; end if;
  select co.* into v_course from public.classes cl join public.courses co on co.id = cl.course_id where cl.id = p_class;
  if not found then raise exception 'Class not found'; end if;

  select payment_id into v_bundle_payment from public.enrollments
  where child_id = p_child and is_bundle and status <> 'cancelled' and payment_id is not null
  limit 1;

  if v_bundle_payment is not null then
    insert into public.enrollments (child_id, class_id, payment_id, is_bundle)
    values (p_child, p_class, v_bundle_payment, true);
    return v_bundle_payment;
  end if;

  if p_bundle then
    if v_course.level <> 1 then raise exception 'Bundle starts at Level 1'; end if;
    select price into v_price from public.packages where code = 'bundle_l1_l3';
    if not found then raise exception 'Bundle not available'; end if;
    insert into public.payments (parent_id, amount, description, due_date)
    values (v_child.parent_id, v_price, 'Bundle Level 1–3 · ' || v_child.nickname, current_date + 7)
    returning id into v_payment;
  else
    insert into public.payments (parent_id, amount, description, due_date)
    values (v_child.parent_id, v_course.price, v_course.name || ' · ' || v_child.nickname, current_date + 7)
    returning id into v_payment;
  end if;

  insert into public.enrollments (child_id, class_id, payment_id, is_bundle) values (p_child, p_class, v_payment, p_bundle);
  return v_payment;
end $$;

revoke execute on function public.enroll_child(uuid, uuid, boolean) from public, anon;
grant execute on function public.enroll_child(uuid, uuid, boolean) to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.courses enable row level security;
alter table public.packages enable row level security;
alter table public.classes enable row level security;
alter table public.class_sessions enable row level security;
alter table public.payments enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance enable row level security;
alter table public.leave_requests enable row level security;
alter table public.assessments enable row level security;
alter table public.games enable row level security;
alter table public.game_sessions enable row level security;

-- profiles: own row; only name/phone editable
create policy "profiles: read own" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- children: parent owns
create policy "children: read own" on public.children for select to authenticated
  using (parent_id = (select auth.uid()) or (select public.is_admin()));
create policy "children: insert own" on public.children for insert to authenticated
  with check (parent_id = (select auth.uid()));
create policy "children: update own" on public.children for update to authenticated
  using (parent_id = (select auth.uid())) with check (parent_id = (select auth.uid()));
create policy "children: delete own" on public.children for delete to authenticated
  using (parent_id = (select auth.uid()));

-- catalog: readable by everyone signed in (courses also public for landing)
create policy "courses: read" on public.courses for select to anon, authenticated using (true);
create policy "packages: read" on public.packages for select to anon, authenticated using (true);
create policy "classes: read" on public.classes for select to authenticated using (true);
create policy "class_sessions: read" on public.class_sessions for select to authenticated using (true);
create policy "games: read" on public.games for select to authenticated using (true);

-- payments: parent reads own, attaches slip while pending
create policy "payments: read own" on public.payments for select to authenticated
  using (parent_id = (select auth.uid()) or (select public.is_admin()));
create policy "payments: submit slip" on public.payments for update to authenticated
  using (parent_id = (select auth.uid()) and status in ('pending', 'rejected'))
  with check (parent_id = (select auth.uid()) and status = 'submitted');
revoke update on public.payments from authenticated;
grant update (slip_path, status) on public.payments to authenticated;

-- enrollments / attendance / assessments: parent reads own child's rows
create policy "enrollments: read own" on public.enrollments for select to authenticated
  using ((select public.is_my_child(child_id)) or (select public.is_admin()));
create policy "attendance: read own" on public.attendance for select to authenticated
  using ((select public.is_my_child(child_id)) or (select public.is_admin()));
create policy "assessments: read own" on public.assessments for select to authenticated
  using ((select public.is_my_child(child_id)) or (select public.is_admin()));

-- leave requests: at least 24h before the session
create policy "leave: read own" on public.leave_requests for select to authenticated
  using ((select public.is_my_child(child_id)) or (select public.is_admin()));
create policy "leave: create own" on public.leave_requests for insert to authenticated
  with check (
    (select public.is_my_child(child_id))
    and exists (select 1 from public.class_sessions s where s.id = session_id and s.starts_at > now() + interval '24 hours')
  );
create policy "leave: cancel own" on public.leave_requests for delete to authenticated
  using (
    (select public.is_my_child(child_id))
    and exists (select 1 from public.class_sessions s where s.id = session_id and s.starts_at > now() + interval '24 hours')
  );

-- game sessions: parent reads; child play inserts (via parent session for now)
create policy "game_sessions: read own" on public.game_sessions for select to authenticated
  using ((select public.is_my_child(child_id)) or (select public.is_admin()));
create policy "game_sessions: insert own" on public.game_sessions for insert to authenticated
  with check ((select public.is_my_child(child_id)));

-- ---------- storage: payment slips ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('slips', 'slips', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "slips: upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'slips' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "slips: read own folder" on storage.objects for select to authenticated
  using (bucket_id = 'slips' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin())));
