"use server";

import { revalidatePath } from "next/cache";
import type { GameRun } from "@/components/games/ui";
import { requireUser } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;
const CODES = new Set<GameRun["code"]>(["memory_sequence", "go_no_go", "stroop", "breathing_bubble"]);
const int = (v: unknown, min: number, max: number) => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

/** Saves one finished round. RLS only lets a parent insert rows for their own child. */
export async function saveGameSession(childId: string, run: GameRun): Promise<string> {
  if (
    !UUID.test(childId) ||
    !CODES.has(run.code) ||
    !int(run.level, 1, 50) ||
    !int(run.score, 0, 10000) ||
    !int(run.duration_s, 0, 3600) ||
    (run.accuracy != null && !int(run.accuracy, 0, 100)) ||
    (run.reaction_ms != null && !int(run.reaction_ms, 0, 60000))
  ) {
    return "ข้อมูลคะแนนไม่ถูกต้อง";
  }

  const { supabase } = await requireUser();
  const { data: game } = await supabase.from("games").select("id").eq("code", run.code).maybeSingle();
  if (!game) return "ไม่พบเกมนี้ในระบบ";

  const { error } = await supabase.from("game_sessions").insert({
    child_id: childId,
    game_id: game.id,
    level: run.level,
    score: run.score,
    accuracy: run.accuracy,
    reaction_ms: run.reaction_ms,
    duration_s: run.duration_s,
  });
  if (error) return "บันทึกคะแนนไม่สำเร็จ ลองใหม่อีกครั้ง";

  revalidatePath("/app/games");
  return "บันทึกคะแนนแล้ว ดูประวัติได้ด้านล่าง";
}
