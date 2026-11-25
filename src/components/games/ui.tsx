"use client";

import { createContext, useContext } from "react";

export type GameRun = {
  code: "memory_sequence" | "go_no_go" | "stroop" | "breathing_bubble";
  level: number;
  score: number;
  accuracy: number | null;
  reaction_ms: number | null;
  duration_s: number;
};

/** GameHub provides this; games call it once when a round ends. */
export const ReportContext = createContext<(run: GameRun) => void>(() => {});
export const useReport = () => useContext(ReportContext);

export function GameResult({ title, stats, onRetry }: { title: string; stats: [string, string][]; onRetry: () => void }) {
  return (
    <div className="grid justify-items-center gap-4 py-6 text-center">
      <b className="font-display text-2xl font-semibold">{title}</b>
      <div className="flex flex-wrap justify-center gap-6">
        {stats.map(([k, v]) => (
          <div key={k}>
            <b className="block font-display text-3xl font-semibold text-brand tabular-nums">{v}</b>
            <span className="hint">{k}</span>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={onRetry}>เล่นอีกครั้ง</button>
    </div>
  );
}

export function StartButton({ onClick, text = "เริ่มเล่น" }: { onClick: () => void; text?: string }) {
  return (
    <div className="grid place-items-center py-10">
      <button className="btn-primary min-h-14 px-8 text-lg" onClick={onClick}>{text}</button>
    </div>
  );
}
