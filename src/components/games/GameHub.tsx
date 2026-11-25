"use client";

import { useEffect, useRef, useState } from "react";
import { nowMs } from "@/lib/format";
import { BreathCircle } from "@/components/BreathCircle";
import { GoNoGo } from "./GoNoGo";
import { MemorySequence } from "./MemorySequence";
import { Stroop } from "./Stroop";
import { ReportContext, type GameRun } from "./ui";

const GAMES = [
  { id: "breath", name: "Breathing Bubble", skill: "EQ · Art of Focus", age: "5+", how: "มองลูกบอล หายใจเข้าตอนขยาย หายใจออกตอนหด 4 วินาทีเท่ากัน" },
  { id: "memory", name: "Memory Sequence", skill: "IQ · EF ความจำใช้งาน", age: "5+", how: "ดูช่องสีที่กระพริบ แล้วกดตามลำดับ ลำดับจะยาวขึ้นทุกด่าน" },
  { id: "gonogo", name: "Go/No-Go", skill: "EF การยับยั้ง · AQ", age: "5+", how: "เห็นผลไม้ให้กดเร็ว ๆ เห็นระเบิดห้ามกด" },
  { id: "stroop", name: "Color-Word Stroop", skill: "EF ต้านสิ่งรบกวน", age: "8+", how: "ตอบสีของตัวอักษรที่เห็น ไม่ใช่คำที่อ่านได้" },
] as const;

type Id = (typeof GAMES)[number]["id"];

type Props = {
  /** Saves a finished round and returns a status line. Omit for the public demo. */
  onSave?: (run: GameRun) => Promise<string>;
  /** Shown instead of the game, e.g. when today's time limit is used up. */
  locked?: string | null;
};

export function GameHub({ onSave, locked }: Props) {
  const [id, setId] = useState<Id>("memory");
  const [status, setStatus] = useState<string | null>(null);
  const game = GAMES.find((g) => g.id === id)!;

  function report(run: GameRun) {
    if (!onSave) return;
    setStatus("กำลังบันทึกคะแนน…");
    onSave(run).then(setStatus, () => setStatus("บันทึกคะแนนไม่สำเร็จ ลองใหม่อีกครั้ง"));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div role="tablist" aria-label="เลือกเกม" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {GAMES.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={g.id === id}
            onClick={() => {
              setId(g.id);
              setStatus(null);
            }}
            className={`min-w-[180px] cursor-pointer rounded-xl border p-4 text-left transition lg:min-w-0 ${g.id === id ? "border-brand bg-brand-tint" : "border-line bg-surface hover:border-brand"}`}
          >
            <b className="block font-display text-[17px] font-semibold">{g.name}</b>
            <span className="text-[13px] text-soft">{g.skill} · {g.age} ปี</span>
          </button>
        ))}
      </div>
      <section className="panel" aria-live="polite">
        <div>
          <h2 className="text-2xl font-semibold">{game.name}</h2>
          <p className="mt-1 text-soft">{game.how}</p>
        </div>
        {locked ? (
          <p className="rounded-xl bg-sun-tint px-4 py-6 text-center font-medium text-sun">{locked}</p>
        ) : (
          <ReportContext value={report}>
            {id === "breath" && <BreathCircle />}
            {id === "breath" && onSave && <BreathDone />}
            {id === "memory" && <MemorySequence />}
            {id === "gonogo" && <GoNoGo />}
            {id === "stroop" && <Stroop />}
          </ReportContext>
        )}
        {status && <p className="hint text-center" role="status">{status}</p>}
      </section>
    </div>
  );
}

/** Breathing has no win state: the child presses "done" after at least 2 breaths (16 s). */
function BreathDone() {
  const startedAt = useRef(0);
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    startedAt.current = nowMs();
    const t = setTimeout(() => setReady(true), 16000);
    return () => clearTimeout(t);
  }, []);

  return (
    <ReportContext.Consumer>
      {(report) => (
        <button
          className="btn-ghost justify-self-center"
          disabled={!ready || sent}
          onClick={() => {
            const sec = Math.round((nowMs() - startedAt.current) / 1000);
            setSent(true);
            report({ code: "breathing_bubble", level: 1, score: Math.floor(sec / 8), accuracy: null, reaction_ms: null, duration_s: sec });
          }}
        >
          {sent ? "บันทึกแล้ว" : ready ? "ฝึกเสร็จแล้ว บันทึกเลย" : "หายใจตามอย่างน้อย 2 รอบ…"}
        </button>
      )}
    </ReportContext.Consumer>
  );
}
