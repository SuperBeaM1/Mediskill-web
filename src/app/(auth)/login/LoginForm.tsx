"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "../actions";
import { FieldError } from "../AuthShell";
import { PasswordInput } from "../PasswordInput";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  const f = state?.fields ?? {};
  const v = state?.values ?? {};

  return (
    <form action={action} noValidate className="mt-6 grid gap-4">
      {state?.error && (
        <p role="alert" className="rounded-[10px] bg-coral-tint px-4 py-3 text-[15px] text-err">
          {state.error}
        </p>
      )}
      <div className="field">
        <label htmlFor="email">อีเมล</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" defaultValue={v.email} aria-invalid={!!f.email} aria-describedby="email-err" />
        <FieldError id="email-err" msg={f.email} />
      </div>
      <div className="field">
        <label htmlFor="password">รหัสผ่าน</label>
        <PasswordInput id="password" autoComplete="current-password" invalid={!!f.password} />
        <FieldError id="password-err" msg={f.password} />
      </div>
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>
      <p className="text-center text-sm text-soft">
        ยังไม่มีบัญชี? <Link href="/register" className="text-brand">สมัครสมาชิก</Link>
      </p>
    </form>
  );
}
