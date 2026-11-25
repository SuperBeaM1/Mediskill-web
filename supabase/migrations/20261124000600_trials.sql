-- Trial classes: admins open slots, anyone (signed in or not) books through book_trial().
create table public.trial_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  minutes int not null default 60 check (minutes between 15 and 180),
  format text not null check (format in ('onsite', 'online')),
  age_group public.age_group,            -- null = any age
  capacity int not null default 6 check (capacity between 1 and 100),
  note text check (char_length(note) <= 200),
  created_at timestamptz not null default now()
);

create table public.trial_bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.trial_slots (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  phone text not null check (phone ~ '^0[0-9]{9}$'),
  learner_nickname text not null check (char_length(learner_nickname) between 1 and 40),
  learner_age int not null check (learner_age between 4 and 110),
  note text check (char_length(note) <= 500),
  status text not null default 'new' check (status in ('new', 'confirmed', 'attended', 'cancelled')),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index on public.trial_slots (starts_at);
create index on public.trial_bookings (slot_id);
create index on public.trial_bookings (user_id);
create index on public.trial_bookings (phone);

alter table public.trial_slots enable row level security;
alter table public.trial_bookings enable row level security;

-- Slots: admins manage; the public reads open slots through trial_slots_open().
create policy "trial_slots: admin read" on public.trial_slots for select to authenticated using ((select public.is_admin()));
create policy "trial_slots: admin insert" on public.trial_slots for insert to authenticated with check ((select public.is_admin()));
create policy "trial_slots: admin update" on public.trial_slots for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "trial_slots: admin delete" on public.trial_slots for delete to authenticated using ((select public.is_admin()));

-- Bookings: admins read and update status; nobody inserts directly (book_trial does).
create policy "trial_bookings: admin read" on public.trial_bookings for select to authenticated using ((select public.is_admin()));
create policy "trial_bookings: admin update" on public.trial_bookings for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Upcoming slots with seats left (no personal data).
create or replace function public.trial_slots_open()
returns table (id uuid, starts_at timestamptz, minutes int, format text, age_group public.age_group, note text, seats_left int)
language sql stable security definer set search_path = '' as $$
  select s.id, s.starts_at, s.minutes, s.format, s.age_group, s.note,
         s.capacity - (select count(*)::int from public.trial_bookings b where b.slot_id = s.id and b.status <> 'cancelled')
  from public.trial_slots s
  where s.starts_at > now() + interval '2 hours'
  order by s.starts_at
  limit 60;
$$;

-- Book a seat. Checks seats, the slot's age group, and limits one phone to 3 open bookings.
create or replace function public.book_trial(
  p_slot uuid, p_full_name text, p_phone text, p_nickname text, p_age int, p_note text default null
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_slot public.trial_slots;
  v_id uuid;
  v_group public.age_group := case
    when p_age <= 7 then 'seed' when p_age <= 10 then 'sprout' when p_age <= 12 then 'tree'
    when p_age <= 19 then 'teen' when p_age <= 59 then 'adult' else 'senior' end;
begin
  select * into v_slot from public.trial_slots where id = p_slot for update;
  if not found or v_slot.starts_at <= now() + interval '2 hours' then raise exception 'Slot closed'; end if;
  if v_slot.age_group is not null and v_slot.age_group <> v_group then raise exception 'Wrong age group'; end if;
  if (select count(*) from public.trial_bookings where slot_id = p_slot and status <> 'cancelled') >= v_slot.capacity then
    raise exception 'Slot full';
  end if;
  if (select count(*) from public.trial_bookings b join public.trial_slots s on s.id = b.slot_id
      where b.phone = p_phone and b.status in ('new', 'confirmed') and s.starts_at > now()) >= 3 then
    raise exception 'Too many bookings';
  end if;

  insert into public.trial_bookings (slot_id, full_name, phone, learner_nickname, learner_age, note, user_id)
  values (p_slot, trim(p_full_name), p_phone, trim(p_nickname), p_age, nullif(trim(p_note), ''), (select auth.uid()))
  returning id into v_id;
  return v_id;
end $$;

revoke execute on function public.trial_slots_open() from public;
revoke execute on function public.book_trial(uuid, text, text, text, int, text) from public;
grant execute on function public.trial_slots_open() to anon, authenticated;
grant execute on function public.book_trial(uuid, text, text, text, int, text) to anon, authenticated;
