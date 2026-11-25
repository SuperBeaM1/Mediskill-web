-- Catalog seed: courses, games, Level 1 classes with 10 sessions each (Sat + Wed)
insert into public.courses (level, name, hours, sessions, price, description) values
  (1, 'Level 1 Awareness', 10, 10, 590, 'รู้จักสมองตัวเอง และสัมผัสความนิ่งครั้งแรก'),
  (2, 'Level 2 Skill Building', 30, 30, 1090, 'ขยายความจำใช้งาน และดึงสมาธิกลับเมื่อถูกรบกวน'),
  (3, 'Level 3 Habit & Mastery', 50, 50, 1590, 'สมาธิเป็นนิสัย และเป็นพี่เลี้ยงเพื่อน');

insert into public.packages (code, name, price, unit, description) values
  ('bundle_l1_l3', 'Bundle Level 1–3', 2590, 'one_time', '90 ชม. ครบ 3 เลเวล จ่ายครั้งเดียว'),
  ('app_monthly', 'แอปรายเดือน (เกมและรายงาน)', 59, 'month', 'ต่อลูก 1 คน'),
  ('school_class', 'แพ็กเกจโรงเรียน', 7900, 'classroom', '10 ชม. ต่อห้อง ไม่เกิน 30 คน');

insert into public.games (code, name, skill, min_age) values
  ('memory_sequence', 'Memory Sequence', 'IQ', 5),
  ('breathing_bubble', 'Breathing Bubble', 'EQ', 5),
  ('sound_match', 'Sound Match', 'AQ', 5),
  ('tidy_room', 'Tidy Room', 'EF', 5),
  ('stroop', 'Color-Word Stroop', 'EF', 8),
  ('go_no_go', 'Go/No-Go', 'EF', 5);

with c as (select id from public.courses where level = 1)
insert into public.classes (course_id, age_group, title, room, capacity)
select c.id, g.ag::public.age_group, g.title, g.room, 10
from c, (values
  ('seed', 'Level 1 · Seed (5–7 ปี)', 'ห้อง Seed 1'),
  ('sprout', 'Level 1 · Sprout (8–10 ปี)', 'ห้อง Focus 2'),
  ('tree', 'Level 1 · Tree (11–12 ปี)', 'ห้อง Focus 3')
) as g(ag, title, room);

-- 10 sessions: Sat 28 Nov 2026 onward, Sat 10:00 + Wed 17:00 (Asia/Bangkok), 60 min
with topics(n, topic) as (values
  (1, 'สมองของฉันทำงานยังไง'), (2, 'ลมหายใจลูกโป่ง'), (3, 'ดูให้ดี จำให้ได้'),
  (4, 'หูไว ใจนิ่ง'), (5, 'จัดโต๊ะ จัดใจ'), (6, 'สีหลอกตา'), (7, 'หยุดก่อนคิด'),
  (8, 'วาดอย่างจดจ่อ'), (9, 'ช่วยเพื่อนจดจ่อ'), (10, 'สรุปและฉลองจบ')
), slots as (
  select n, topic,
    case when n % 2 = 1
      then (date '2026-11-28' + ((n - 1) / 2) * 7) + time '10:00'
      else (date '2026-12-02' + ((n - 2) / 2) * 7) + time '17:00'
    end as local_start
  from topics
)
insert into public.class_sessions (class_id, session_no, topic, starts_at, ends_at)
select cl.id, s.n, s.topic,
  s.local_start at time zone 'Asia/Bangkok',
  (s.local_start + interval '60 minutes') at time zone 'Asia/Bangkok'
from public.classes cl cross join slots s;
