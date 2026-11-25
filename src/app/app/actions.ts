"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bkkParts } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;
const id = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "");
  if (!UUID.test(v)) throw new Error(`Invalid ${k}`);
  return v;
};

export async function setDailyLimit(formData: FormData) {
  const childId = id(formData, "child_id");
  const minutes = Number(formData.get("minutes"));
  if (!Number.isInteger(minutes) || minutes < 10 || minutes > 30) throw new Error("Invalid limit");
  const { supabase } = await requireUser();
  const { error } = await supabase.from("children").update({ daily_limit_min: minutes }).eq("id", childId);
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function enroll(formData: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("enroll_child", {
    p_child: id(formData, "child_id"),
    p_class: id(formData, "class_id"),
    p_bundle: formData.get("bundle") === "1",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app", "layout");
  redirect("/app/billing");
}

export async function requestLeave(formData: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("leave_requests")
    .insert({ session_id: id(formData, "session_id"), child_id: id(formData, "child_id") });
  if (error) throw new Error("แจ้งลาไม่สำเร็จ ต้องแจ้งก่อนเรียนอย่างน้อย 24 ชั่วโมง");
  revalidatePath("/app", "layout");
}

export async function cancelLeave(formData: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("leave_requests")
    .delete()
    .eq("session_id", id(formData, "session_id"))
    .eq("child_id", id(formData, "child_id"));
  if (error) throw new Error(error.message);
  revalidatePath("/app", "layout");
}

export type SlipState = { error?: string; ok?: boolean } | null;
const SLIP_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function submitSlip(_: SlipState, formData: FormData): Promise<SlipState> {
  const paymentId = id(formData, "payment_id");
  const file = formData.get("slip");
  if (!(file instanceof File) || file.size === 0) return { error: "แนบรูปสลิปก่อนแจ้งชำระเงิน" };
  const ext = SLIP_TYPES[file.type];
  if (!ext) return { error: "ใช้ไฟล์ JPG, PNG หรือ WEBP" };
  if (file.size > 5 * 1024 * 1024) return { error: "ไฟล์ใหญ่เกิน 5 MB" };

  const { supabase, user } = await requireUser();
  const path = `${user.id}/${paymentId}-${Date.now()}.${ext}`;
  const up = await supabase.storage.from("slips").upload(path, file, { contentType: file.type });
  if (up.error) return { error: "อัปโหลดสลิปไม่สำเร็จ ลองใหม่อีกครั้ง" };

  const { error } = await supabase
    .from("payments")
    .update({ slip_path: path, status: "submitted" })
    .eq("id", paymentId);
  if (error) return { error: "บันทึกการชำระไม่สำเร็จ ลองใหม่อีกครั้ง" };
  revalidatePath("/app/billing");
  return { ok: true };
}

export type LearnerState = { error?: string; fields?: Record<string, string>; values?: { nickname: string; age: string } } | null;

/** Adds a learner (the account holder or a family member, any age 4+) under this account. */
export async function addLearner(_: LearnerState, formData: FormData): Promise<LearnerState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const age = Number(formData.get("age"));
  const birthYear = new Date().getFullYear() - age;
  const fields: Record<string, string> = {};
  if (!nickname || nickname.length > 40) fields.nickname = "กรอกชื่อเล่น ไม่เกิน 40 ตัวอักษร";
  if (!Number.isInteger(age) || age < 4 || age > 110) fields.age = "ใส่อายุเป็นตัวเลข 4–110 ปี";
  const values = { nickname, age: String(formData.get("age") ?? "") };
  if (Object.keys(fields).length) return { fields, values };

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("children")
    .insert({ parent_id: user.id, nickname, birth_year: birthYear })
    .select("id")
    .single();
  if (error) return { error: "เพิ่มผู้เรียนไม่สำเร็จ ลองใหม่อีกครั้ง", values };
  revalidatePath("/app", "layout");
  redirect(`/app?child=${data.id}`);
}

/** Tick or untick today's off-screen mission (Bangkok day). RLS checks ownership and the day. */
export async function toggleMission(formData: FormData) {
  const childId = String(formData.get("child_id") ?? "");
  const code = String(formData.get("code") ?? "");
  if (!UUID.test(childId) || !/^[a-z_]{1,40}$/.test(code)) throw new Error("Invalid input");
  const day = bkkParts(new Date()).key;
  const { supabase } = await requireUser();
  const { error } =
    formData.get("done") === "1"
      ? await supabase.from("mission_checks").delete().eq("child_id", childId).eq("day", day).eq("code", code)
      : await supabase.from("mission_checks").upsert({ child_id: childId, day, code }, { onConflict: "child_id,day,code", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
  revalidatePath("/app/missions");
}
