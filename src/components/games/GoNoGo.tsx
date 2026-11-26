"use client";

import { useEffect, useRef, useState } from "react";
import { nowMs, rand } from "@/lib/format";
import { GameResult, StartButton, useReport } from "./ui";

const TRIALS = 20;
const GO = ["🍎", "🍌", "🍇", "🍊", "🍓"];
const NOGO = "💣";

type Stats = { hit: number; miss: number; falseAlarm: number; rts: number[] };
const EMPTY: Stats = { hit: 0, miss: 0, falseAlarm: 0, rts: [] };

export function GoNoGo() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [trial, setTrial] = useState(0);
  const [item, setItem] = useState<string | null>(null);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY);
  const shownAt = useRef(0);
  const startedAt = useRef(0);
  const final = useRef<Stats>(EMPTY);
  const report = useReport();
  const answered = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    final.current = stats;
  }, [stats]);

  function next(n: number) {
    if (n >= TRIALS) {
      const s = final.current;
      const avg = s.rts.length ? Math.round(s.rts.reduce((a, b) => a + b, 0) / s.rts.length) : null;
      report({ code: "go_no_go", level: 1, score: Math.max(s.hit - s.falseAlarm, 0), accuracy: Math.round(((TRIALS - s.miss - s.falseAlarm) / TRIALS) * 100), reaction_ms: avg, duration_s: Math.round((nowMs() - startedAt.current) / 1000) });
      setRunning(false);
      setDone(true);
      setItem(null);
      return;
    }
    setTrial(n);
    setItem(null);
    setFlash(null);
    timer.current = setTimeout(() => {
      const isGo = rand() < 0.75;
      const it = isGo ? GO[Math.floor(rand() * GO.length)] : NOGO;
      answered.current = false;
      shownAt.current = nowMs();
      setItem(it);
      timer.current = setTimeout(() => {
        if (!answered.current && it !== NOGO) setStats((s) => ({ ...s, miss: s.miss + 1 }));
        next(n + 1);
      }, 1000);
    }, 500 + rand() * 600);
  }

  function start() {
    setStats(EMPTY);
    final.current = EMPTY;
    startedAt.current = nowMs();
    setDone(false);
    setRunning(true);
    next(0);
  }

  function press() {
    if (!item || answered.current) return;
    answered.current = true;
    if (item === NOGO) {
      setStats((s) => ({ ...s, falseAlarm: s.falseAlarm + 1 }));
      setFlash("bad");
    } else {
      const rt = Math.round(nowMs() - shownAt.current);
      setStats((s) => ({ ...s, hit: s.hit + 1, rts: [...s.rts, rt] }));
      setFlash("ok");
    }
  }

  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        press();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (done) {
    const goCount = stats.hit + stats.miss;
    const avg = stats.rts.length ? Math.round(stats.rts.reduce((a, b) => a + b, 0) / stats.rts.length) : 0;
    return (
      <GameResult
        title={stats.falseAlarm === 0 ? "ใจนิ่งมาก ไม่โดนระเบิดเลย!" : "ดีมาก ลองอีกรอบนะ"}
        stats={[["กดผลไม้ทัน", `${stats.hit}/${goCount}`], ["กดโดนระเบิด", `${stats.falseAlarm}`], ["ความไวเฉลี่ย", `${avg} ms`]]}
        onRetry={start}
      />
    );
  }
  if (!running) return <StartButton onClick={start} />;

  return (
    <div className="grid justify-items-center gap-4">
      <p className="hint">รอบ {trial + 1}/{TRIALS} · กดปุ่มหรือ Spacebar</p>
      <button
        onClick={press}
        aria-label="กด"
        className={`grid aspect-square w-full max-w-[260px] cursor-pointer place-items-center rounded-full border-4 text-[96px] transition ${flash === "ok" ? "border-brand bg-brand-tint" : flash === "bad" ? "border-coral bg-coral-tint" : "border-line bg-mute"}`}
      >
        <span aria-hidden="true">{item ?? ""}</span>
      </button>
    </div>
  );
}
