"use client";

import { useEffect, useRef, useState } from "react";
import { nowMs, rand as rnd } from "@/lib/format";
import { GameResult, StartButton, useReport } from "./ui";

const PADS = [
  { name: "น้ำเงิน", base: "bg-[#2b3f9e]", lit: "bg-[#7d93ff]" },
  { name: "ส้ม", base: "bg-[#c4570a]", lit: "bg-[#ffb070]" },
  { name: "เหลือง", base: "bg-[#b88a00]", lit: "bg-[#ffd95a]" },
  { name: "เขียว", base: "bg-[#1f7a45]", lit: "bg-[#6ee09c]" },
];

type Phase = "idle" | "show" | "input" | "over";

export function MemorySequence() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seq, setSeq] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [pos, setPos] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedAt = useRef(0);
  const report = useReport();

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function play(next: number[]) {
    setSeq(next);
    setPos(0);
    setPhase("show");
    timers.current.forEach(clearTimeout);
    timers.current = [];
    next.forEach((p, i) => {
      timers.current.push(setTimeout(() => setLit(p), 700 + i * 700));
      timers.current.push(setTimeout(() => setLit(null), 700 + i * 700 + 450));
    });
    timers.current.push(setTimeout(() => setPhase("input"), 700 + next.length * 700));
  }

  function rand() {
    return Math.floor(rnd() * PADS.length);
  }

  function press(p: number) {
    if (phase !== "input") return;
    setLit(p);
    timers.current.push(setTimeout(() => setLit(null), 200));
    if (p !== seq[pos]) {
      setPhase("over");
      const span = seq.length - 1;
      report({ code: "memory_sequence", level: Math.max(span, 1), score: span, accuracy: null, reaction_ms: null, duration_s: Math.round((nowMs() - startedAt.current) / 1000) });
      return;
    }
    if (pos + 1 === seq.length) {
      setPhase("show");
      timers.current.push(setTimeout(() => play([...seq, rand()]), 500));
    } else {
      setPos(pos + 1);
    }
  }

  function start() {
    startedAt.current = nowMs();
    play([rand(), rand()]);
  }

  if (phase === "idle") return <StartButton onClick={start} />;
  if (phase === "over") {
    const span = seq.length - 1;
    return <GameResult title={span >= 5 ? "เก่งมาก!" : "ดีมาก ลองอีกรอบนะ"} stats={[["จำได้ยาวสุด", `${span} ช่อง`]]} onRetry={start} />;
  }

  return (
    <div className="grid justify-items-center gap-4">
      <p className="font-display text-lg font-medium">
        {phase === "show" ? "ดูให้ดีนะ…" : `ถึงตาเรา กดตามลำดับ (${pos + 1}/${seq.length})`}
      </p>
      <div className="grid w-full max-w-[340px] grid-cols-2 gap-3">
        {PADS.map((p, i) => (
          <button
            key={p.name}
            aria-label={p.name}
            disabled={phase !== "input"}
            onClick={() => press(i)}
            className={`aspect-square cursor-pointer rounded-2xl transition duration-150 disabled:cursor-default ${lit === i ? `${p.lit} scale-105 shadow-lg` : p.base}`}
          />
        ))}
      </div>
      <p className="hint">ด่าน {seq.length - 1} · ลำดับยาว {seq.length} ช่อง</p>
    </div>
  );
}
