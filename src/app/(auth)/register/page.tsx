import type { Metadata } from "next";
import { AuthShell } from "../AuthShell";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "สมัครสมาชิก" };

export default function RegisterPage() {
  return (
    <AuthShell
      active="register"
      title="เริ่มต้นใน 3 ขั้น"
      text="บัญชีเดียวใช้ได้ทั้งครอบครัว เพิ่มผู้เรียนได้ทุกวัย ทั้งตัวเองและคนในบ้าน แต่ละคนมีรายงานของตัวเอง"
      steps={["สร้างบัญชีด้วยอีเมล", "เพิ่มผู้เรียนในแอป ระบบจัดกลุ่มตามวัยจากปีเกิด", "เลือกรอบเรียน Level 1 และชำระเงิน"]}
      note="เราเก็บข้อมูลผู้เรียนแค่ชื่อเล่นกับปีเกิด และขอลบข้อมูลได้ทุกเมื่อ ตาม PDPA"
    >
      <h1 className="text-3xl font-semibold">สมัครสมาชิก</h1>
      <p className="mt-1.5 text-soft">ใช้เวลาไม่ถึง 1 นาที</p>
      <RegisterForm />
    </AuthShell>
  );
}
