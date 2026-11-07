import { useEffect, useRef, useState } from "react";
import type { Settings } from "../game/types";

const SHAPES = [
  { name: "CIRCLE", path: "M50 12 A38 38 0 1 1 49.99 12 Z", color: "#ff7597" },
  { name: "SQUARE", path: "M15 15 H85 V85 H15 Z", color: "#5a9bf3" },
  { name: "TRIANGLE", path: "M50 10 L92 86 H8 Z", color: "#ffbd4f" },
  { name: "RECTANGLE", path: "M5 25 H95 V75 H5 Z", color: "#6dc78d" },
  { name: "STAR", path: "M50 6 L62 36 L95 38 L69 59 L78 91 L50 73 L22 91 L31 59 L5 38 L38 36 Z", color: "#b58cf1" },
] as const;
const TARGETS = [0, 1, 2, 3, 4, 2, 0, 4, 1, 3];
function Shape({ index, size = 84 }: { index: number; size?: number }) {
  const shape = SHAPES[index];
  return <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={shape.name.toLowerCase()}><path d={shape.path} fill={shape.color} stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" /></svg>;
}
export function ShapeFinderWorld({ settings, onFinish, onHome, onHearLaury }: {
  settings: Settings; onFinish: (score: number) => void; onHome: () => void; onHearLaury: () => void;
}) {
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);
  const target = TARGETS[step];
  const choices = [target, (target + 1) % 5, (target + 3) % 5];
  const ordered = step % 3 === 0 ? choices : step % 3 === 1 ? [choices[1], choices[0], choices[2]] : [choices[2], choices[1], choices[0]];
  function choose(index: number) {
    if (busy) return;
    if (index !== target) { setFeedback("Good try! Look for the " + SHAPES[target].name.toLowerCase() + "."); return; }
    setBusy(true);
    setCorrect(v => v + 1);
    setFeedback("You found the " + SHAPES[target].name.toLowerCase() + "! ⭐");
    timer.current = window.setTimeout(() => {
      if (step === TARGETS.length - 1) onFinish((correct + 1) * 100);
      else { setStep(v => v + 1); setFeedback(""); setBusy(false); }
    }, settings.calm ? 450 : 800);
  }
  return <div className="absolute inset-0 z-20 overflow-y-auto bg-gradient-to-b from-[#a5e8fa] via-[#c9f5f1] to-[#7acbd8] px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-center text-[#23415b]">
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center gap-3 py-2">
      <div className="flex w-full items-center justify-between gap-2">
        <button type="button" className="min-h-12 rounded-full bg-white px-3 font-bold" onClick={() => confirmExit ? onHome() : setConfirmExit(true)}>{confirmExit ? "Tap again to exit" : "🏠 Home"}</button>
        <span className="rounded-full bg-white px-3 py-2 text-sm font-bold">🐠 Ocean World · {step + 1}/10</span>
        <button type="button" className="min-h-12 rounded-full bg-[#7750f7] px-3 font-bold text-white" onClick={onHearLaury}>🔊 Laury</button>
      </div>
      <div className="w-full rounded-[2rem] border-4 border-white bg-white/90 p-4 shadow-lg sm:p-7">
        <div className="text-4xl" aria-hidden="true">🐠 🐢 🪸</div>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-4xl">Shape Finder!</h2>
        <p className="mt-2 font-semibold">Find the shape that matches this picture:</p>
        <div className="mx-auto mt-3 flex max-w-xs flex-col items-center gap-1 rounded-3xl border-4 border-white bg-[#e8f9ff] px-5 py-3 shadow-inner">
          <Shape index={target} size={78}/>
          <span className="text-xl font-black">{SHAPES[target].name}</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-5">
          {ordered.map(index => <button key={index} type="button" disabled={busy} onClick={() => choose(index)} aria-label={SHAPES[index].name.toLowerCase()} className="flex min-h-28 touch-manipulation flex-col items-center justify-center gap-2 rounded-3xl border-4 border-white bg-[#f5fcff] p-2 shadow-md sm:min-h-40">
            <Shape index={index} size={68}/>
            <span className="text-xs font-extrabold sm:text-base">{SHAPES[index].name}</span>
          </button>)}
        </div>
        <p role="status" aria-live="polite" className="mt-4 min-h-8 text-base font-bold text-[#5d4787]">{feedback || "Take your time. No timer!"}</p>
        <div className="mt-2 flex justify-center gap-1" aria-label={correct + " shapes matched"}>{Array.from({ length: 10 }, (_, i) => <span key={i} className="text-lg sm:text-2xl" aria-hidden="true">{i < correct ? "⭐" : "☆"}</span>)}</div>
      </div>
      <p className="text-sm font-bold text-[#28586b]">No losing, no rush. Explore every shape!</p>
    </div>
  </div>;
}
