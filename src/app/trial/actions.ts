"use server";

import { createClient } from "@/lib/supabase/server";

export type TrialValues = { slot: string; full_name: string; phone: string; nickname: string; age: string; note: string };
export type TrialState = { done?: string; error?: string; fields?: Record<string, string>; values?: TrialValues } | null;

const UUID = /^[0-9a-f-]{36}$/i;

export async function bookTrial(_: TrialState, formData: FormData): Promise<TrialState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const values: TrialValues = { slot: get("slot"), full_name: get("full_name"), phone: get("phone").replace(/\D/g, ""), nickname: get("nickname"), age: get("age"), note: get("note") };
  const age = Number(values.age);

  const fields: Record<string, string> = {};
  if (!UUID.test(values.slot)) fields.slot = "เลือกรอบที่ต้องการ";
  if (!values.full_name || values.full_name.length > 120) fields.full_name = "กรอกชื่อผู้ติดต่อ";
  if (!/^0[0-9]{9}$/.test(values.phone)) fields.phone = "เบอร์โทร 10 หลัก ขึ้นต้นด้วย 0";
  if (!values.nickname || values.nickname.length > 40) fields.nickname = "กรอกชื่อเล่นผู้เรียน";
  if (!Number.isInteger(age) || age < 4 || age > 110) fields.age = "อายุ 4–110 ปี";
  if (values.note.length > 500) fields.note = "ไม่เกิน 500 ตัวอักษร";
  if (formData.get("consent") !== "on") fields.consent = "ต้องยินยอมก่อน เพื่อให้ทีมงานโทรยืนยันได้";
  if (Object.keys(fields).length) return { fields, values };

  const supabase = await createClient();
  const { error } = await supabase.rpc("book_trial", {
    p_slot: values.slot,
    p_full_name: values.full_name,
    p_phone: values.phone,
    p_nickname: values.nickname,
    p_age: age,
    p_note: values.note || null,
  });
  if (error) {
    const m = error.message;
    return {
      values,
      error: m.includes("full")
        ? "รอบนี้เต็มแล้ว เลือกรอบอื่นได้เลย"
        : m.includes("age")
          ? "รอบนี้สำหรับกลุ่มวัยอื่น เลือกรอบที่ตรงกับอายุผู้เรียน"
          : m.includes("Too many")
            ? "เบอร์นี้จองไว้หลายรอบแล้ว รอทีมงานโทรยืนยันก่อน"
            : m.includes("closed")
              ? "รอบนี้ปิดรับแล้ว เลือกรอบอื่นได้เลย"
              : "จองไม่สำเร็จ ลองใหม่อีกครั้ง",
    };
  }
  return { done: `จองรอบทดลองให้ ${values.nickname} แล้ว ทีมงานจะโทรยืนยันที่เบอร์ ${values.phone} ภายใน 1 วันทำการ` };
}
