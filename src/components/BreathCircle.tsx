"use client";

import { useEffect, useState } from "react";

/** Balloon breathing 4-4: 4s in, 4s out, synced with the CSS scale animation. */
export function BreathCircle() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 8), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[320px] place-items-center md:max-w-[420px]" aria-label="วงกลมฝึกหายใจ 4-4">
      <div className="absolute inset-0 rounded-full border border-line bg-surface" />
      <div className="absolute inset-[12%] animate-[breathe_8s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_50%_50%,#FFE9D2_0%,#FDA85A_45%,#F27A12_100%)] shadow-[0_20px_50px_-20px_rgba(242,122,18,.55)]" />
      <div className="relative text-center text-[#2a1600]">
        <div className="font-display text-[28px] font-semibold">{tick < 4 ? "หายใจเข้า" : "หายใจออก"}</div>
        <div className="font-display text-[56px] leading-none font-bold tabular-nums">{(tick % 4) + 1}</div>
        <small className="mt-1.5 block text-[13px] font-medium">หายใจลูกโป่ง 4-4 ลองทำตามได้เลย</small>
      </div>
      <style>{`@keyframes breathe{0%,100%{transform:scale(.82)}50%{transform:scale(1)}}`}</style>
    </div>
  );
}
