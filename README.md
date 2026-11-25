# MeditSkill Web

เว็บแอปของศูนย์พัฒนาทักษะสมาธิ MeditSkill (หลักสูตร PAC'C) สำหรับผู้เรียนทุกวัย
มีหน้าเว็บสาธารณะ, แอปผู้เรียน, หน้าครู และหน้าแอดมิน อยู่ใน repo เดียว

> แนวคิดหลักของแบรนด์: **"สมาธิ คือ นวัตกรรมของชีวิต"**
> ธีมสีตามโลโก้: น้ำเงินกรม (`--brand`), ส้ม (`--orange`), เหลืองอำพัน (`--sun`)

---

## Stack

| ส่วน | เวอร์ชัน / หมายเหตุ |
|---|---|
| Next.js | 16.4.6 App Router · `cacheComponents: true` · ใช้ `src/proxy.ts` แทน middleware |
| React | 19.3 (`useActionState`, Server Actions) |
| Tailwind CSS | 4.3 (token ใน `src/app/globals.css` ผ่าน `@theme inline`, utility ทำด้วย `@utility`) |
| Supabase | `@supabase/ssr` + `@supabase/supabase-js` · Postgres + Auth + Storage + RLS |
| อื่น ๆ | `qrcode` (สร้าง QR PromptPay ฝั่ง server) |

**อ่านก่อนเขียนโค้ด:** Next.js เวอร์ชันนี้ต่างจากที่หลายคนคุ้น ดู `AGENTS.md` และคู่มือใน `node_modules/next/dist/docs/`

---

## เริ่มรันในเครื่อง

```bash
npm install
cp .env.example .env.local   # แล้วใส่ค่าตามหัวข้อ Env vars
npm run dev                  # http://localhost:3000
```

Windows PowerShell ถ้าเจอ `npx.ps1 cannot be loaded` ให้ใช้ `npx.cmd` แทน `npx`

คำสั่งตรวจก่อนส่งงานทุกครั้ง:

```bash
npm run lint
npm run build
```

### Env vars

| ชื่อ | ใช้ทำอะไร | หาได้ที่ |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL ของ Supabase project | ขอจากบีม หรือ Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable (anon) key | ที่เดียวกัน |
| `PROMPTPAY_ID` | (ไม่บังคับ) เบอร์ 10 หลัก หรือเลขผู้เสียภาษี 13 หลักของศูนย์ ใส่แล้วหน้าชำระเงินจะมี QR | บีม |

ห้ามใส่ `service_role` key หรือ secret ใด ๆ ในตัวแปร `NEXT_PUBLIC_*` หรือในโค้ดฝั่ง client
`.env.local` ไม่ขึ้น git (อยู่ใน `.gitignore`)

---

## บทบาทผู้ใช้ (role)

เก็บใน `profiles.role`

| role | เข้าที่ | ทำอะไรได้ |
|---|---|---|
| `parent` (ผู้ใช้ทั่วไป) | `/app` | เพิ่มผู้เรียน (ตัวเองหรือคนในครอบครัว), ลงทะเบียน, จ่ายเงิน, ภารกิจ, เกม, รายงาน 6-I |
| `teacher` | `/teacher` | ดูคลาสที่ได้รับมอบหมาย, เช็กชื่อ, ให้คะแนนจดจ่อ, บันทึกพฤติกรรม |
| `admin` | `/admin` | ทุกอย่างในระบบหลังบ้าน |

- ผู้สมัครใหม่เป็น `parent` เสมอ
- ตั้งครู/แอดมิน: แอดมิน → เมนู "ทีมงาน" → เปลี่ยนบทบาท (เปลี่ยนบทบาทตัวเองไม่ได้)
- แอดมินคนแรกต้องตั้งด้วย SQL:
  ```sql
  update public.profiles set role = 'admin'
  where id = (select id from auth.users where email = '<email>');
  ```

> ในโค้ดและฐานข้อมูล ผู้เรียนยังใช้ชื่อตาราง `children` และคำว่า child (ตั้งแต่ตอนเป็นคอร์สเด็กอย่างเดียว) แต่ตอนนี้รองรับทุกวัย 4–110 ปีแล้ว

---

## หน้าในระบบ

### สาธารณะ
| path | หน้า |
|---|---|
| `/` | หน้าแรก |
| `/courses` | หลักสูตร PAC'C 3 เลเวล, คาบ 60 นาที, Hybrid |
| `/games` | ลองเล่นเกมฟรี (ไม่บันทึกคะแนน) |
| `/report-6i` | อธิบายรายงาน 6-I |
| `/about` | เกี่ยวกับเรา, ครู ดร.อธิวัฒน์ ธนพัฒน์ธัญโชติ, ที่ปรึกษา |
| `/trial` | จองคลาสทดลอง (ไม่ต้องล็อกอิน) |
| `/login`, `/register` | เข้าสู่ระบบ / สมัคร (สมัครแค่ชื่อ เบอร์ อีเมล รหัสผ่าน) |

### ผู้เรียน `/app` (ต้องล็อกอิน)
| path | หน้า |
|---|---|
| `/app` | ภาพรวม · เพิ่มผู้เรียนครั้งแรก (ชื่อเล่น + อายุ) · เลือกรอบเรียน |
| `/app/schedule` | ตารางเรียน, แจ้งลา (ล่วงหน้า 24 ชม.) |
| `/app/missions` | ภารกิจประจำวัน 3 อย่าง, ดาว, streak, เหรียญ |
| `/app/games` | เล่นเกมและบันทึกคะแนน, จำกัดเวลาเล่นต่อวัน |
| `/app/report` | รายงาน 6-I อัตโนมัติ (เรดาร์, ที่มาคะแนน, แนวโน้ม 6 เดือน) |
| `/app/billing` | บิล, QR PromptPay, อัปโหลดสลิป |

ทุกหน้าใช้ `?child=<id>` เลือกผู้เรียน

### ครู `/teacher`
| path | หน้า |
|---|---|
| `/teacher` | คาบวันนี้ / 7 วัน / คลาสของฉัน |
| `/teacher/sessions/[id]` | เช็กชื่อ มา/ขาด/ลา, คะแนนจดจ่อ 0–100, บันทึกพฤติกรรม |

### แอดมิน `/admin`
| path | หน้า |
|---|---|
| `/admin` | KPI, สลิปรอตรวจ, คาบ 7 วัน |
| `/admin/payments` | ตรวจสลิป อนุมัติ/ไม่ผ่าน (อนุมัติแล้วการลงทะเบียนเป็น active) |
| `/admin/trials` | เปิดรอบทดลอง, รายชื่อคนจอง, สถานะการโทร |
| `/admin/students` | ผู้ใช้และผู้เรียน |
| `/admin/staff` | ตั้งบทบาทครู/แอดมิน |
| `/admin/classes`, `/admin/classes/new` | คลาส, ที่นั่ง, มอบหมายครู, สร้างคลาส + คาบอัตโนมัติ |
| `/admin/prices` | แก้ราคาคอร์สและแพ็กเกจ |

---

## โครงโฟลเดอร์

```
src/
  app/
    (auth)/            login, register, server actions ของ auth
    app/               แอปผู้เรียน (layout + actions.ts)
    teacher/           หน้าครู
    admin/             หน้าแอดมิน (actions.ts รวม action ของแอดมิน)
    trial/             จองคลาสทดลอง
    auth/confirm/      route รับลิงก์ยืนยันอีเมล
    globals.css        สี/ฟอนต์/utility ทั้งหมด
  components/          ส่วนกลาง: Logo, SiteHeader, SixIBars, SixIRadar, PromptPayQR, games/*
  lib/
    supabase/server.ts createClient, requireUser, requireTeacher, requireAdmin
    data.ts            query ที่ใช้ซ้ำ (getFamily, getEnrollment, getSessions)
    format.ts          วันที่/เวลาไทย, กลุ่มวัย, nowMs(), rand()
    sixI.ts            สูตรคำนวณ 6-I
    missions.ts        ภารกิจ ดาว streak เหรียญ
    promptpay.ts       สร้าง payload PromptPay + CRC16
  proxy.ts             รีเฟรช session, กัน /app /admin /teacher ถ้ายังไม่ล็อกอิน
supabase/migrations/   SQL ทั้งหมด เรียงตามเวลา
```

---

## ฐานข้อมูล (Supabase)

- ทุกตารางเปิด **RLS** แล้ว สิทธิ์เช็กด้วยฟังก์ชัน `is_admin()`, `is_my_child()`, `is_class_teacher()`, `is_session_teacher()`, `teaches_child()`
- การเขียนที่ต้องตรวจหลายเงื่อนไขทำผ่าน RPC (`security definer`) เช่น `enroll_child`, `admin_review_payment`, `admin_set_price`, `admin_create_class`, `admin_set_role`, `admin_assign_teacher`, `book_trial`, `trial_slots_open`
- ราคาอยู่ในตาราง `courses` และ `packages` แก้ได้ที่ `/admin/prices` (ราคาตอนนี้เป็นค่าชั่วคราว)

Migration ทั้งหมด **รันบน Supabase แล้ว** ตามลำดับนี้:

| ไฟล์ | เนื้อหา |
|---|---|
| `20261123000000_init.sql` | ตารางหลัก, RLS, trigger, `enroll_child`, bucket `slips` |
| `20261123000100_seed_catalog.sql` | คอร์ส, แพ็กเกจ, เกม, คลาส L1 ตัวอย่าง |
| `20261124000000_revoke_anon_rls_helpers.sql` | ปิดไม่ให้ anon เรียก helper |
| `20261124000100_admin_rpcs.sql` | ตรวจสลิป, แก้ราคา |
| `20261124000200_all_ages.sql` | กลุ่มวัย teen/adult/senior, อายุ 4–110 |
| `20261124000300_admin_create_class.sql` | สร้างคลาส + คาบอัตโนมัติ |
| `20261124000400_teacher.sql` | สิทธิ์ครู, ตั้งบทบาท, มอบหมายครู |
| `20261124000500_mission_checks.sql` | ภารกิจนอกจอ |
| `20261124000600_trials.sql` | คลาสทดลอง |

**กติกา:** ถ้าจะแก้ schema ให้สร้างไฟล์ migration ใหม่ (อย่าแก้ไฟล์เก่าที่รันไปแล้ว) และคุยกับบีมก่อนรันบน production ทุกครั้ง

---

## สูตรที่ควรรู้

**รายงาน 6-I** (`src/lib/sixI.ts`) คำนวณสดจาก `game_sessions` + `attendance` ไม่ได้เก็บลงตาราง

| ด้าน | มาจาก |
|---|---|
| IQ | Memory Sequence เฉลี่ย 3 รอบที่จำได้ยาวสุด (9 ช่อง = 100) |
| EF | ความแม่นยำ Go/No-Go + Stroop |
| EQ | คะแนนจดจ่อจากครู + เวลาฝึกหายใจ |
| AQ | ทำได้ต่ำกว่าสถิติแล้วเล่นซ้ำในวันเดียวกัน |
| MQ | จำนวนวันที่ฝึก (20 วัน = 100) |
| SQ | อัตราการมาเรียน (ชั่วคราว ยังไม่มีคะแนนกิจกรรมกลุ่มจากครู) |

เกณฑ์เต็ม 100 เป็นค่าตั้งต้น รอฝ่ายวิชาการยืนยัน

**ภารกิจ** (`src/lib/missions.ts`) วันละ 3 อย่าง: ฝึกหายใจ + เกม 2 รอบ (นับจากเกมอัตโนมัติ) + ภารกิจนอกจอ (กด "ทำแล้ว") · 1 ดาว/ภารกิจ, ครบ 3 ได้โบนัส +2 · streak = วันต่อเนื่องที่ทำอย่างน้อย 1 อย่าง

---

## ข้อควรระวังตอนเขียนโค้ด

- **เวลา/สุ่มใน component:** lint (`react-hooks/purity`) ห้ามเรียก `Date.now()` / `Math.random()` ตรง ๆ ตอน render ให้ใช้ `nowMs()` และ `rand()` จาก `src/lib/format.ts`
- **`cacheComponents`:** หน้าที่อ่าน cookies/ข้อมูลผู้ใช้ต้องอยู่ใต้ `<Suspense>` หรือมี `loading.tsx` · `createClient()` เรียก `connection()` ให้แล้ว
- **ฝั่ง server ใช้ `supabase.auth.getUser()`** ไม่ใช่ `getSession()`
- **ฟอร์มหลัง action:** React 19 รีเซ็ตฟอร์ม ให้ action คืน `values` แล้วใช้ `defaultValue` (ดูตัวอย่างใน `RegisterForm`, `ClassForm`)
- **วันที่/เวลา** ใช้เวลาไทย (`Asia/Bangkok`) ผ่าน helper ใน `format.ts`
- เพิ่มไลบรารีใหม่ให้บอกบีมก่อน

---

## Deploy (ยังไม่ได้ทำ)

1. Import repo นี้ใน Vercel (Framework: Next.js)
2. ตั้ง Env vars ตามตารางด้านบนใน Vercel
3. Supabase Dashboard → Authentication → URL Configuration
   - **Site URL** = โดเมนจริง เช่น `https://meditskill.vercel.app`
   - **Redirect URLs** เพิ่ม `https://<โดเมน>/auth/confirm` และ `http://localhost:3000/auth/confirm`
   - ถ้าไม่ตั้ง ลิงก์ยืนยันอีเมลจะพาไป `localhost`
4. แนะนำ: ตั้ง SMTP ของศูนย์ใน Supabase (ตัวฟรีส่งอีเมลได้น้อยต่อชั่วโมง) และเปิด Leaked Password Protection

---

## งานที่เหลือ

- [ ] Deploy ขึ้น Vercel + ตั้ง Auth URL ใน Supabase
- [ ] ราคาคอร์สจริง (แก้ใน `/admin/prices` และหน้าแรก `src/app/page.tsx` ที่ยังเขียนราคาตายตัว)
- [ ] ใส่ `PROMPTPAY_ID` จริง แล้วทดสอบสแกนด้วยแอปธนาคาร
- [ ] หน้านโยบายความเป็นส่วนตัว (PDPA) และเงื่อนไขการใช้งาน
- [ ] อีเมลยืนยันภาษาไทย + SMTP ของศูนย์
- [ ] Premium ID LINE `@meditskill` (ตอนนี้ลิงก์ชี้ไป `@meditskill` แต่บัญชียังใช้ `@631uttba`)
- [ ] คะแนนกิจกรรมกลุ่มจากครูสำหรับ SQ
- [ ] หัวข้อคาบ Level 2–3 (ตอนนี้เป็น "คาบที่ N")
- [ ] เกมที่ยังไม่ทำ: Tidy Room, Focus Fish, Pattern Next, Code a Robot
