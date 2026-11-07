import { useState } from "react";
import type { Settings } from "../game/types";

const COLORS = [
  { name: "RED", hex: "#f15b69", emoji: "🍎" },
  { name: "BLUE", hex: "#448cf0", emoji: "🦋" },
  { name: "YELLOW", hex: "#f6c63c", emoji: "🌻" },
  { name: "GREEN", hex: "#56b975", emoji: "🍀" },
  { name: "PURPLE", hex: "#aa80e7", emoji: "🍇" },
  { name: "ORANGE", hex: "#f49a45", emoji: "🍊" },
];
const TARGETS = [0, 1, 2, 3, 4, 5, 1, 3, 0, 2];

export function ColorMatchWorld({ settings, onFinish, onHome, onHearLaury }: {
  settings: Settings; onFinish: (score: number) => void; onHome: () => void; onHearLaury: () => void;
}) {
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const target = COLORS[TARGETS[step]];
  const choices = [TARGETS[step], (TARGETS[step] + 2) % 6, (TARGETS[step] + 4) % 6].map(i => COLORS[i]);
  function choose(name: string) {
    if (busy) return;
    if (name !== target.name) { setFeedback("Good try! Find " + target.name.toLowerCase() + "."); return; }
    setBusy(true);
    setFeedback("Wonderful! That's " + target.name.toLowerCase() + "! ⭐");
    setCorrect(c => c + 1);
    window.setTimeout(() => {
      if (step === TARGETS.length - 1) onFinish((correct + 1) * 100);
      else { setStep(v => v + 1); setFeedback(""); setBusy(false); }
    }, settings.calm ? 450 : 800);
  }
  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-gradient-to-b from-[#c9ecff] via-[#e9f7d9] to-[#bde9a6] px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-center text-[#3b2f4a]">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center gap-3 py-2">
        <div className="flex w-full items-center justify-between gap-2">
          <button type="button" className="min-h-12 rounded-full bg-white px-3 font-bold" onClick={() => confirmExit ? onHome() : setConfirmExit(true)}>{confirmExit ? "Tap again to exit" : "🏠 Home"}</button>
          <span className="rounded-full bg-white px-3 py-2 text-sm font-bold">🌼 World 1 · {step + 1}/10</span>
          <button type="button" className="min-h-12 rounded-full bg-[#7750f7] px-3 font-bold text-white" onClick={onHearLaury}>🔊 Laury</button>
        </div>
        <div className="w-full rounded-[2rem] border-4 border-white bg-white/90 p-4 shadow-lg sm:p-7">
          <div className="text-4xl" aria-hidden="true">🐱 🌷 🦋</div>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-4xl">Find the matching color!</h2>
          <p className="mt-2 font-semibold">Tap the color that matches:</p>
          <div className="mx-auto mt-3 max-w-xs rounded-3xl border-4 border-white px-5 py-4 shadow-inner" style={{ backgroundColor: target.hex }}>
            <span className="text-3xl font-black text-[#222] drop-shadow-[0_1px_1px_white]">{target.name}</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-5">
            {choices.map(color => <button key={color.name} type="button" disabled={busy} onClick={() => choose(color.name)} aria-label={color.name + " color"} className="flex min-h-28 touch-manipulation flex-col items-center justify-center gap-2 rounded-3xl border-4 border-white bg-[#f8f6ff] p-2 shadow-md sm:min-h-40">
              <span className="text-4xl sm:text-6xl" aria-hidden="true">{color.emoji}</span>
              <span className="h-7 w-14 rounded-full border-2 border-white sm:h-10 sm:w-20" style={{ backgroundColor: color.hex }} />
              <span className="text-xs font-extrabold sm:text-base">{color.name}</span>
            </button>)}
          </div>
          <p role="status" aria-live="polite" className="mt-4 min-h-8 text-base font-bold text-[#5d4787]">{feedback || "Take your time. No timer!"}</p>
          <div className="mt-2 flex justify-center gap-1" aria-label={correct + " colors matched"}>{Array.from({ length: 10 }, (_, i) => <span key={i} className="text-lg sm:text-2xl">{i < correct ? "⭐" : "☆"}</span>)}</div>
        </div>
        <p className="text-sm font-bold text-[#4e6851]">No losing, no rush. Every color is a discovery.</p>
      </div>
    </div>
  );
}
