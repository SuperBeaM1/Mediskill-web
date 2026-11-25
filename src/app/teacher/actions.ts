"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;

export type AttendanceState = { ok?: string; error?: string } | null;

/** Saves the whole roster of one session. RLS only allows the class's own teacher. */
export async function saveAttendance(_: AttendanceState, formData: FormData): Promise<AttendanceState> {
  const sessionId = String(formData.get("session_id") ?? "");
  if (!UUID.test(sessionId)) return { error: "ข้อมูลคาบไม่ถูกต้อง" };

  const rows = formData
    .getAll("child")
    .map(String)
    .filter((id) => UUID.test(id))
    .flatMap((id) => {
      const status = String(formData.get(`status_${id}`) ?? "");
      if (!["present", "absent"].includes(status)) return [];
      const focusRaw = String(formData.get(`focus_${id}`) ?? "");
      const focus = status === "present" && focusRaw !== "" ? Math.round(Number(focusRaw)) : null;
      const note = String(formData.get(`note_${id}`) ?? "").trim().slice(0, 500);
      return [{
        session_id: sessionId,
        child_id: id,
        present: status === "present",
        focus_score: focus != null && focus >= 0 && focus <= 100 ? focus : null,
        behavior_note: note || null,
      }];
    });
  if (!rows.length) return { error: "เลือก มา หรือ ขาด อย่างน้อย 1 คน" };

  const { supabase } = await requireTeacher();
  const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "session_id,child_id" });
  if (error) return { error: "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" };
  revalidatePath(`/teacher/sessions/${sessionId}`);
  return { ok: `บันทึก ${rows.length} คนแล้ว` };
}
