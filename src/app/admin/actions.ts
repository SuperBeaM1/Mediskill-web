"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;

/** Approve or reject a submitted slip. The RPC re-checks admin and status. */
export async function reviewPayment(formData: FormData) {
  const id = String(formData.get("payment_id") ?? "");
  if (!UUID.test(id)) throw new Error("Invalid payment");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("admin_review_payment", { p_payment: id, p_approve: formData.get("decision") === "approve" });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export type PriceState = { ok?: string; error?: string };

export async function setPrice(_: PriceState, formData: FormData): Promise<PriceState> {
  const kind = String(formData.get("kind"));
  const key = String(formData.get("key"));
  const price = Number(formData.get("price"));
  if (!["course", "package"].includes(kind) || !/^[a-z0-9_]{1,40}$/.test(key)) return { error: "ข้อมูลไม่ถูกต้อง" };
  if (!Number.isInteger(price) || price < 0 || price > 1_000_000) return { error: "ใส่ราคาเป็นจำนวนเต็ม 0–1,000,000 บาท" };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("admin_set_price", { p_kind: kind, p_key: key, p_price: price });
  if (error) return { error: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" };
  revalidatePath("/admin/prices");
  return { ok: "บันทึกแล้ว" };
}

export type ClassValues = { level: string; age_group: string; title: string; room: string; capacity: string; start: string; time: string; minutes: string; days: number[] };
export type ClassState = { error?: string; fields?: Record<string, string>; values?: ClassValues } | null;

const AGE_GROUPS = ["seed", "sprout", "tree", "teen", "adult", "senior"];

/** Creates a class and its sessions through admin_create_class, then opens the class list. */
export async function createClass(_: ClassState, formData: FormData): Promise<ClassState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const level = Number(get("level"));
  const ageGroup = get("age_group");
  const title = get("title");
  const room = get("room");
  const capacity = Number(get("capacity"));
  const start = get("start");
  const time = get("time");
  const minutes = Number(get("minutes"));
  const days = formData.getAll("days").map(Number);

  const values: ClassValues = { level: get("level"), age_group: ageGroup, title, room, capacity: get("capacity"), start, time, minutes: get("minutes"), days };
  const fields: Record<string, string> = {};
  if (![1, 2, 3].includes(level)) fields.level = "เลือกเลเวล";
  if (!AGE_GROUPS.includes(ageGroup)) fields.age_group = "เลือกกลุ่มวัย";
  if (!title || title.length > 120) fields.title = "ตั้งชื่อคลาส ไม่เกิน 120 ตัวอักษร";
  if (room.length > 60) fields.room = "ชื่อห้องไม่เกิน 60 ตัวอักษร";
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) fields.capacity = "ที่นั่ง 1–100";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) fields.start = "เลือกวันเริ่มเรียน";
  if (!/^\d{2}:\d{2}$/.test(time)) fields.time = "เลือกเวลาเริ่ม";
  if (!Number.isInteger(minutes) || minutes < 15 || minutes > 180) fields.minutes = "ความยาว 15–180 นาที";
  if (!days.length || days.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) fields.days = "เลือกอย่างน้อย 1 วัน";
  if (Object.keys(fields).length) return { fields, values };

  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("admin_create_class", {
    p_level: level,
    p_age_group: ageGroup,
    p_title: title,
    p_room: room,
    p_capacity: capacity,
    p_start: start,
    p_days: days,
    p_time: time,
    p_minutes: minutes,
  });
  if (error) {
    return { values, error: error.message.includes("past") ? "วันเริ่มเรียนต้องไม่ใช่วันที่ผ่านมาแล้ว" : "สร้างคลาสไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/classes");
}

const ROLES = ["parent", "teacher", "admin"];

/** Change a user's role (not your own). Demoting a teacher frees their classes. */
export async function setRole(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!UUID.test(userId) || !ROLES.includes(role)) throw new Error("Invalid input");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("admin_set_role", { p_user: userId, p_role: role });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

/** Assign (or clear, with an empty value) the teacher of a class. */
export async function assignTeacher(formData: FormData) {
  const classId = String(formData.get("class_id") ?? "");
  const teacher = String(formData.get("teacher_id") ?? "");
  if (!UUID.test(classId) || (teacher && !UUID.test(teacher))) throw new Error("Invalid input");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("admin_assign_teacher", { p_class: classId, p_teacher: teacher || null });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/classes");
}

export type SlotState = { ok?: string; error?: string } | null;

/** Opens a trial slot. Bangkok local date + time from the form. */
export async function createTrialSlot(_: SlotState, formData: FormData): Promise<SlotState> {
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const minutes = Number(formData.get("minutes"));
  const capacity = Number(formData.get("capacity"));
  const format = String(formData.get("format") ?? "");
  const group = String(formData.get("age_group") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return { error: "เลือกวันและเวลา" };
  if (!Number.isInteger(minutes) || minutes < 15 || minutes > 180) return { error: "ความยาว 15–180 นาที" };
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) return { error: "ที่นั่ง 1–100" };
  if (!["onsite", "online"].includes(format)) return { error: "เลือกรูปแบบ" };
  if (group && !AGE_GROUPS.includes(group)) return { error: "กลุ่มวัยไม่ถูกต้อง" };
  if (note.length > 200) return { error: "หมายเหตุไม่เกิน 200 ตัวอักษร" };
  const startsAt = new Date(`${date}T${time}:00+07:00`);
  if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() < Date.now()) return { error: "วันเวลาต้องเป็นอนาคต" };

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("trial_slots").insert({
    starts_at: startsAt.toISOString(),
    minutes,
    capacity,
    format,
    age_group: group || null,
    note: note || null,
  });
  if (error) return { error: "เปิดรอบไม่สำเร็จ ลองใหม่อีกครั้ง" };
  revalidatePath("/admin/trials");
  return { ok: "เปิดรอบแล้ว" };
}

export async function deleteTrialSlot(formData: FormData) {
  const id = String(formData.get("slot_id") ?? "");
  if (!UUID.test(id)) throw new Error("Invalid slot");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("trial_slots").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/trials");
}

export async function setTrialStatus(formData: FormData) {
  const id = String(formData.get("booking_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!UUID.test(id) || !["new", "confirmed", "attended", "cancelled"].includes(status)) throw new Error("Invalid input");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("trial_bookings").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}
