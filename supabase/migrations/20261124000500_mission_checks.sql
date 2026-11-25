-- Daily off-screen missions a learner marks as done (game missions are read from game_sessions).
-- Days are Bangkok calendar days. Learners may tick today or yesterday, and untick only today.
create table public.mission_checks (
  child_id uuid not null references public.children (id) on delete cascade,
  day date not null,
  code text not null check (char_length(code) between 1 and 40),
  created_at timestamptz not null default now(),
  primary key (child_id, day, code)
);

alter table public.mission_checks enable row level security;

create policy "missions: read" on public.mission_checks for select to authenticated
  using ((select public.is_my_child(child_id)) or (select public.teaches_child(child_id)) or (select public.is_admin()));
create policy "missions: tick own" on public.mission_checks for insert to authenticated
  with check (
    (select public.is_my_child(child_id))
    and day between (now() at time zone 'Asia/Bangkok')::date - 1 and (now() at time zone 'Asia/Bangkok')::date
  );
create policy "missions: untick today" on public.mission_checks for delete to authenticated
  using ((select public.is_my_child(child_id)) and day = (now() at time zone 'Asia/Bangkok')::date);
