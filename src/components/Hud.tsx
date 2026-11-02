import { MAX_HEARTS, type HudState } from "../game/types";

export function Hud({ hud, onPause, onExit }: { hud: HudState; onPause: () => void; onExit: () => void }) {
  const low = hud.mode === "relaxed" && hud.timeLeft <= 10;
  if (hud.mode === "cove") {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
        <div className="flex items-center gap-2 rounded-full border-4 border-white bg-white/90 px-4 py-1.5 text-[#3b2f4a] shadow-[0_5px_0_rgba(59,47,74,0.15)]">
          <span className="text-2xl" aria-hidden="true">🍃</span>
          <div>
            <div className="text-lg font-bold leading-none sm:text-xl">Calm Cove</div>
            <div className="text-xs font-semibold text-[#6b6080] sm:text-sm">Tap, drag, explore</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onExit}
          aria-label="Finish Calm Cove and go home"
          className="btn-chunky pointer-events-auto flex h-14 cursor-pointer items-center gap-2 rounded-full border-4 border-white bg-[#3cc68a] px-5 text-xl font-bold text-white"
        >
          ✓ Done
        </button>
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4">
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2 rounded-full border-4 border-white bg-white/90 px-4 py-1.5 text-[#3b2f4a] shadow-[0_5px_0_rgba(59,47,74,0.15)]" aria-live="polite">
          <span className="text-2xl" aria-hidden="true">⭐</span>
          <span className="text-2xl font-bold tabular-nums sm:text-3xl" aria-label={`Score ${hud.score}`}>{hud.score}</span>
          {hud.multiplier > 1 && (
            <span key={hud.multiplier} className="anim-popin rounded-full bg-[#ff7a1a] px-2 py-0.5 text-sm font-bold text-white">
              x{hud.multiplier}
            </span>
          )}
        </div>
        <div className="rounded-full bg-white/70 px-3 py-0.5 text-xs font-semibold text-[#3b2f4a] sm:text-sm">📍 {hud.world}</div>
      </div>

      <div className="flex items-center gap-1 rounded-full border-4 border-white bg-white/90 px-3 py-1.5 shadow-[0_5px_0_rgba(59,47,74,0.15)]">
        {hud.mode === "adventure" ? (
          <div className="flex gap-0.5" aria-label={`${hud.hearts} hearts left`}>
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <span key={i} className={`text-2xl transition-all duration-300 sm:text-3xl ${i < hud.hearts ? "scale-100" : "scale-75 opacity-25 grayscale"}`}>
                💖
              </span>
            ))}
          </div>
        ) : (
          <div className={`flex items-center gap-1 text-2xl font-bold tabular-nums sm:text-3xl ${low ? "text-[#ff5a8a]" : "text-[#3b2f4a]"}`} aria-label={`${hud.timeLeft} seconds left`}>
            <span aria-hidden="true">⏰</span>
            {hud.timeLeft}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onPause}
        aria-label="Pause game"
        className="btn-chunky pointer-events-auto flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-[#7c5cff] text-2xl text-white"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
          <rect x="3" y="2" width="6" height="18" rx="2.5" fill="white" />
          <rect x="13" y="2" width="6" height="18" rx="2.5" fill="white" />
        </svg>
      </button>
    </div>
  );
}
