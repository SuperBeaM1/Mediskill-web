"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "../actions";
import { FieldError } from "../AuthShell";
import { PasswordInput } from "../PasswordInput";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, null);
  const f = state?.fields ?? {};
  const v = state?.values ?? {};

  if (state?.done) {
    return (
      <div role="status" className="mt-6 grid gap-3 rounded-xl bg-brand-tint p-5">
        <b className="font-display text-lg">เกือบเสร็จแล้ว</b>
        <p>{state.done}</p>
        <Link href="/login" className="btn-primary justify-self-start">ไปหน้าเข้าสู่ระบบ</Link>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="mt-6 grid gap-4">
      {state?.error && (
        <p role="alert" className="rounded-[10px] bg-coral-tint px-4 py-3 text-[15px] text-err">
          {state.error}
        </p>
      )}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="full_name">ชื่อ-นามสกุล</label>
          <input id="full_name" name="full_name" autoComplete="name" required className="input" defaultValue={v.full_name} aria-invalid={!!f.full_name} />
          <FieldError id="full_name-err" msg={f.full_name} />
        </div>
        <div className="field">
          <label htmlFor="phone">เบอร์โทร</label>
          <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" pattern="0[0-9]{9}" required className="input" defaultValue={v.phone} aria-invalid={!!f.phone} />
          <FieldError id="phone-err" msg={f.phone} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="email">อีเมล</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" defaultValue={v.email} aria-invalid={!!f.email} />
        <FieldError id="email-err" msg={f.email} />
      </div>
      <div className="field">
        <label htmlFor="password">ตั้งรหัสผ่าน</label>
        <PasswordInput id="password" autoComplete="new-password" invalid={!!f.password} />
        {f.password ? <FieldError id="password-err" msg={f.password} /> : <span className="hint">อย่างน้อย 8 ตัวอักษร</span>}
      </div>


      <div className="grid gap-1">
        <label htmlFor="consent" className="flex items-start gap-2.5 text-sm text-soft">
          <input id="consent" name="consent" type="checkbox" required className="mt-0.5 size-5 flex-none accent-brand" />
          ยินยอมให้ MeditSkill เก็บข้อมูลบัญชี และข้อมูลผู้เรียนที่เพิ่มภายหลัง (ชื่อเล่น ปีเกิด คะแนนเกม) เพื่อทำรายงานพัฒนาการ ตามนโยบายความเป็นส่วนตัว
        </label>
        <FieldError id="consent-err" msg={f.consent} />
      </div>
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending ? "กำลังสร้างบัญชี…" : "สร้างบัญชี"}
      </button>
      <p className="text-center text-sm text-soft">
        มีบัญชีแล้ว? <Link href="/login" className="text-brand">เข้าสู่ระบบ</Link>
      </p>
    </form>
  );
}
