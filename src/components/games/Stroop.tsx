"use client";

import { useRef, useState } from "react";
import { nowMs, rand } from "@/lib/format";
import { GameResult, StartButton, useReport } from "./ui";

const TRIALS = 15;
const COLORS = [
  { name: "แดง", hex: "#d23b2b" },
  { name: "น้ำเงิน", hex: "#2550d9" },
  { name: "เขียว", hex: "#1f8a3b" },
  { name: "ส้ม", hex: "#e07000" },
];

type Card = { word: number; ink: number };

function makeCard(): Card {
  const word = Math.floor(rand() * COLORS.length);
  let ink = Math.floor(rand() * COLORS.length);
  if (rand() < 0.7) while (ink === word) ink = Math.floor(rand() * COLORS.length);
  return { word, ink };
}

export function Stroop() {
  const [card, setCard] = useState<Card | null>(null);
  const [n, setN] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [rts, setRts] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const shownAt = useRef(0);
  const startedAt = useRef(0);
  const report = useReport();

  function show() {
    setCard(makeCard());
    shownAt.current = nowMs();
  }

  function start() {
    setN(0);
    setCorrect(0);
    setRts([]);
    setDone(false);
    startedAt.current = nowMs();
    show();
  }

  function answer(i: number) {
    if (!card) return;
    const rt = Math.round(nowMs() - shownAt.current);
    const ok = i === card.ink;
    if (ok) {
      setCorrect((c) => c + 1);
      setRts((r) => [...r, rt]);
    }
    if (n + 1 >= TRIALS) {
      const hits = correct + (ok ? 1 : 0);
      const all = ok ? [...rts, rt] : rts;
      report({ code: "stroop", level: 1, score: hits, accuracy: Math.round((hits / TRIALS) * 100), reaction_ms: all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : null, duration_s: Math.round((nowMs() - startedAt.current) / 1000) });
      setCard(null);
      setDone(true);
    } else {
      setN(n + 1);
      show();
    }
  }

  if (done) {
    const avg = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;
    return (
      <GameResult
        title={correct >= 13 ? "ตาไวใจนิ่งมาก!" : "ดีมาก ลองอีกรอบนะ"}
        stats={[["ตอบถูก", `${correct}/${TRIALS}`], ["ความไวเฉลี่ย", `${avg} ms`]]}
        onRetry={start}
      />
    );
  }
  if (!card) return <StartButton onClick={start} />;

  return (
    <div className="grid justify-items-center gap-5">
      <p className="hint">ข้อ {n + 1}/{TRIALS} · ตัวอักษรนี้เป็น “สี” อะไร</p>
      <div className="grid h-36 w-full max-w-[340px] place-items-center rounded-2xl bg-white shadow-inner">
        <span className="font-display text-6xl font-bold" style={{ color: COLORS[card.ink].hex }}>
          {COLORS[card.word].name}
        </span>
      </div>
      <div className="grid w-full max-w-[340px] grid-cols-2 gap-3">
        {COLORS.map((c, i) => (
          <button key={c.name} onClick={() => answer(i)} className="btn-ghost min-h-14 text-lg">
            <i className="inline-block size-4 rounded-full" style={{ background: c.hex }} aria-hidden="true" />
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
