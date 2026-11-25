-- Open MeditSkill to learners of every age (account holder or family members).
-- Kids keep seed/sprout/tree; new groups for teens, working age and seniors.
alter type public.age_group add value if not exists 'teen';
alter type public.age_group add value if not exists 'adult';
alter type public.age_group add value if not exists 'senior';

alter table public.children drop constraint if exists children_birth_year_check;
alter table public.children add constraint children_birth_year_check check (birth_year between 1900 and 2100);

create or replace function public.set_age_group()
returns trigger language plpgsql set search_path = '' as $$
declare a int := extract(year from now())::int - new.birth_year;
begin
  if a < 4 or a > 110 then
    raise exception 'Learner age must be 4-110 (got %)', a;
  end if;
  new.age_group := case
    when a <= 7 then 'seed'
    when a <= 10 then 'sprout'
    when a <= 12 then 'tree'
    when a <= 19 then 'teen'
    when a <= 59 then 'adult'
    else 'senior'
  end::public.age_group;
  return new;
end $$;
