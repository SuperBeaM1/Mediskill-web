"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = {
  error?: string;
  fields?: Record<string, string>;
  values?: Record<string, string>;
  done?: string;
} | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fields: Record<string, string> = {};
  if (!EMAIL.test(email)) fields.email = "กรอกอีเมลให้ถูกรูปแบบ เช่น name@email.com";
  if (password.length < 8) fields.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  const values = { email };
  if (Object.keys(fields).length) return { fields, values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      values,
      error:
        error.code === "email_not_confirmed"
          ? "ยังไม่ได้ยืนยันอีเมล เปิดลิงก์ในอีเมลที่เราส่งไปก่อน"
          : "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    };
  }
  redirect("/app");
}

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const fullName = get("full_name");
  const phone = get("phone");
  const email = get("email");
  const password = String(formData.get("password") ?? "");
  const consent = formData.get("consent") === "on";

  const fields: Record<string, string> = {};
  if (!fullName) fields.full_name = "กรอกชื่อ-นามสกุล";
  if (!/^0[0-9]{9}$/.test(phone)) fields.phone = "เบอร์โทร 10 หลัก ขึ้นต้นด้วย 0";
  if (!EMAIL.test(email)) fields.email = "กรอกอีเมลให้ถูกรูปแบบ เช่น name@email.com";
  if (password.length < 8) fields.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  if (!consent) fields.consent = "ต้องยินยอมก่อนสมัคร เพราะรายงานใช้ข้อมูลนี้";
  const values = { full_name: fullName, phone, email };
  if (Object.keys(fields).length) return { fields, values };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        full_name: fullName,
        phone,
        pdpa_consent: true,
      },
    },
  });
  if (error) {
    return {
      values,
      error:
        error.code === "user_already_exists"
          ? "อีเมลนี้สมัครไว้แล้ว ลองเข้าสู่ระบบแทน"
          : error.code === "weak_password"
            ? "รหัสผ่านง่ายเกินไป ลองผสมตัวอักษรและตัวเลข"
            : "สมัครไม่สำเร็จ ลองใหม่อีกครั้ง",
    };
  }
  if (data.session) redirect("/app");
  return { done: `ส่งลิงก์ยืนยันไปที่ ${email} แล้ว เปิดลิงก์ในอีเมลเพื่อเริ่มใช้งาน` };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
