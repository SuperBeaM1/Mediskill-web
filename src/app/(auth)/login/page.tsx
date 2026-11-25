import type { Metadata } from "next";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <AuthShell
      active="login"
      title="ยินดีต้อนรับกลับ"
      text="ดูความคืบหน้าของผู้เรียนทุกคนในบ้าน ตั้งเวลาเล่นเกม และอ่านรายงาน 6-I ได้ในที่เดียว"
      steps={["เช็กตารางเรียนและการเข้าเรียนรายคาบ", "ตั้งเวลาเล่นเกมวันละ 15–20 นาที", "อ่านรายงาน 6-I ทุกต้นเดือน"]}
      note="บัญชีเดียวใช้ได้ทั้งครอบครัว ผู้เรียนแต่ละคนมีโปรไฟล์และรายงานของตัวเอง"
    >
      <h1 className="text-3xl font-semibold">เข้าสู่ระบบ</h1>
      <p className="mt-1.5 text-soft">ใช้อีเมลและรหัสผ่านที่สมัครไว้</p>
      <LoginForm />
    </AuthShell>
  );
}
