import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { audio } from "../game/audio";
import { drawFindScene } from "../game/draw";
import { FIND_SCENES, SCENE_BY_KEY, THINGS, labelFor, type FindThing } from "../game/findData";
import { FRIENDS, type Settings } from "../game/types";
import { FriendPreview } from "./FriendPreview";
import { ItemPreview, type CountItem } from "./ItemPreview";
import { BigButton } from "./ui";

type TimerChoice = "calm" | "relaxed" | "buster";

const TIMERS: Record<TimerChoice, { label: string; icon: string; seconds: number; blurb: string }> = {
  calm: { label: "No timer", icon: "🍃", seconds: 0, blurb: "Just find them all, in your own time." },
  relaxed: { label: "Gentle", icon: "⏳", seconds: 90, blurb: "90 seconds. Running out is completely fine." },
  buster: { label: "Challenge", icon: "🚀", seconds: 60, blurb: "60 seconds. Still no losing — just a number to beat." },
};

const FOUND_PER_ROUND = 3;
const ROUNDS_PER_SCENE = 2;

interface Target {
  id: string;
  kind: FindThing["kind"];
}

function makeTargets(sceneKey: string, seed: number): Target[] {
  const things = THINGS.filter((t) => t.id.startsWith(sceneKey[0]) && (sceneKey !== "party" || t.id.startsWith("p")));
  const shuffled = [...things].sort((a, b) => {
    const ha = Math.sin(seed * 7 + a.x * 31 + a.y * 17);
    const hb = Math.sin(seed * 7 + b.x * 31 + b.y * 17);
    return ha - hb;
  });
  // prefer a mix of object types and avoid asking for two identical things in a row
  const chosen: Target[] = [];
  for (const t of shuffled) {
    if (chosen.length >= FOUND_PER_ROUND) break;
    // never ask for the same kind twice in one round: there are plenty of kinds in each scene
    if (chosen.some((c) => c.kind === t.kind)) continue;
    chosen.push({ id: t.id, kind: t.kind });
  }
  if (chosen.length < FOUND_PER_ROUND) {
    for (const t of shuffled) {
      if (chosen.length >= FOUND_PER_ROUND) break;
      if (!chosen.some((c) => c.id === t.id)) chosen.push({ id: t.id, kind: t.kind });
    }
  }
  return chosen;
}

export function FindAFriend({ settings, onHome }: { settings: Settings; onHome: () => void }) {
  const [sceneKey, setSceneKey] = useState(FIND_SCENES[0].key);
  const [timer, setTimer] = useState<TimerChoice>("calm");
  const [roundSeed, setRoundSeed] = useState(1);
  const [round, setRound] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState<{ x: number; y: number; key: number } | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<{ id: string; kind: string; x: number; y: number; r: number }[]>([]);
  const timeRef = useRef(0);
  const runningRef = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const calcRef = useRef<{ targets: Target[]; round: number; finished: boolean }>({ targets: [], round: 0, finished: false });
  const timersRef = useRef({ hint: 0, celebrate: 0 });

  const timerInfo = TIMERS[timer];
  const scene = SCENE_BY_KEY[sceneKey] ?? FIND_SCENES[0];
  const targets = useMemo(() => makeTargets(sceneKey, roundSeed + round * 13), [sceneKey, roundSeed, round]);
  const current = targets[found.length] ?? targets[targets.length - 1];
  const currentLabel = current ? labelFor(current.kind) : "";
  const isPhrase = current?.kind === "bunny" || current?.kind === "kitty" || current?.kind === "bear" || current?.kind === "frog" || current?.kind === "niko";
  const canvasThings = useMemo(() => THINGS.filter((t) => t.id.startsWith(sceneKey[0])), [sceneKey]);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  const friendMap = useMemo(() => {
    const map: Record<string, (typeof FRIENDS)[number]> = {};
    for (const f of FRIENDS) map[f.kind] = f;
    return map;
  }, []);

  calcRef.current = { targets, round, finished };

  // ---- sizing
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // ---- draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0 || size.h === 0) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(size.w * dpr) || canvas.height !== Math.round(size.h * dpr)) {
      canvas.width = Math.round(size.w * dpr);
      canvas.height = Math.round(size.h * dpr);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let start = performance.now();
    const t0 = (start / 1000) % 1000;
    const loop = (now: number) => {
      const t = (now - start) / 1000 + t0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFindScene(ctx, sceneKey, size.w, size.h, t, new Set(found), canvasThings, friendMap, settings.calm, celebratingId);
      const u = Math.min(size.w, size.h);
      hitRef.current = canvasThings.map((thing) => {
        const s = Math.max(u * 0.068, thing.size * Math.min(size.w, size.h * 1.15));
        const x = Math.min(size.w - s, Math.max(s, thing.x * size.w));
        const y = Math.min(size.h - s, Math.max(s, thing.y * size.h));
        return { id: thing.id, kind: thing.kind, x, y, r: Math.max(28, s * 0.55) };
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      start = 0;
    };
  }, [size, sceneKey, found, canvasThings, friendMap, settings.calm, celebratingId]);

  // ---- round clock
  useEffect(() => {
    timeRef.current = timerInfo.seconds;
    setTimeLeft(timerInfo.seconds);
    runningRef.current = true;
    return () => {
      runningRef.current = false;
    };
  }, [timerInfo.seconds, round, sceneKey, roundSeed]);

  useEffect(() => {
    if (finished || timerInfo.seconds === 0) return;
    const id = window.setInterval(() => {
      if (!runningRef.current) return;
      timeRef.current = Math.max(0, timeRef.current - 1);
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        runningRef.current = false;
        audio.tada();
        setFinished(true);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [finished, timerInfo.seconds, round, sceneKey, roundSeed]);

  useEffect(() => () => {
    window.clearTimeout(timersRef.current.hint);
    window.clearTimeout(timersRef.current.celebrate);
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!canSpeak) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.85;
        u.pitch = 1.1;
        u.volume = 0.9;
        window.speechSynthesis.speak(u);
      } catch {
        /* no voice on this device */
      }
    },
    [canSpeak],
  );

  const ask = () => {
    audio.unlock();
    if (finished) return;
    if (!current) return;
    speak(isPhrase ? `Can you find ${currentLabel}?` : `Can you find the ${currentLabel}?`);
  };

  const showHint = () => {
    if (!current || finished) return;
    audio.bloom(3);
    setHint(current.id);
    window.clearTimeout(timersRef.current.hint);
    timersRef.current.hint = window.setTimeout(() => setHint(null), 2200);
  };

  const pickAt = (clientX: number, clientY: number) => {
    if (finished) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const candidates = hitRef.current
      .filter((h) => Math.hypot(h.x - px, h.y - py) <= h.r + 14)
      .sort((a, b) => Math.hypot(a.x - px, a.y - py) - Math.hypot(b.x - px, b.y - py));
    const hit = candidates[0];
    if (!hit) {
      setWrongFlash({ x: px, y: py, key: Date.now() });
      return;
    }
    if (found.includes(hit.id)) {
      setWrongFlash({ x: px, y: py, key: Date.now() });
      return;
    }
    // Any instance of the requested kind counts — identical berries are interchangeable to a child.
    const alreadyFoundKind = found.some((id) => canvasThings.find((t) => t.id === id)?.kind === current.kind);
    if (hit.kind === current.kind && !alreadyFoundKind) {
      audio.catch(found.length * 3 + 2);
      const nextFound = [...found, hit.id];
      setFound(nextFound);
      setHint(null);
      setCelebratingId(hit.id);
      window.clearTimeout(timersRef.current.celebrate);
      timersRef.current.celebrate = window.setTimeout(() => setCelebratingId(null), 700);
      if (nextFound.length >= FOUND_PER_ROUND) {
        audio.cheer();
        window.setTimeout(() => {
          const roundNow = calcRef.current.round;
          if (roundNow + 1 >= ROUNDS_PER_SCENE) {
            setFinished(true);
            runningRef.current = false;
            audio.tada();
          } else {
            setRound(roundNow + 1);
            setFound([]);
          }
        }, 900);
      }
    } else {
      setWrongFlash({ x: px, y: py, key: Date.now() });
      audio.miss();
    }
  };

  useEffect(() => {
    if (!wrongFlash) return;
    const id = window.setTimeout(() => setWrongFlash(null), 600);
    return () => window.clearTimeout(id);
  }, [wrongFlash]);

  const resetTo = (nextScene: string, nextTimer: TimerChoice, seedBump = false) => {
    audio.click();
    setSceneKey(nextScene as typeof sceneKey);
    setTimer(nextTimer);
    setRound(0);
    setFound([]);
    setFinished(false);
    setHint(null);
    setRoundSeed((s) => (seedBump ? s + 1 : s));
  };

  const restart = () => {
    setRound(0);
    setFound([]);
    setFinished(false);
    setHint(null);
    setRoundSeed((s) => s + 1);
    audio.click();
    runningRef.current = true;
    timeRef.current = timerInfo.seconds;
    setTimeLeft(timerInfo.seconds);
  };

  const promptColor = current && found.length < FOUND_PER_ROUND ? "text-[#3b2f4a]" : "text-[#3b2f4a]";
  const allFoundNow = found.length >= FOUND_PER_ROUND;

  return (
    <div className={`absolute inset-0 z-20 flex flex-col overflow-hidden bg-[linear-gradient(#f3f0ff_0%,#e8fbf1_100%)] ${settings.calm ? "calm" : ""}`}>
      {/* header */}
      <div className="relative z-10 flex items-center gap-2 px-3 pb-1.5 pt-[max(0.6rem,env(safe-area-inset-top))] sm:px-4">
        <button
          type="button"
          onClick={onHome}
          aria-label="Back to Niko's Games home"
          className="btn-chunky flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-white/95 text-2xl text-[#3b2f4a]"
        >
          🏠
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold leading-none text-[#3b2f4a] sm:text-2xl">
            <span className="rounded-lg bg-[#7c5cff] px-1.5 py-0.5 text-white">Find</span> a Friend
          </h1>
          <p className="text-xs font-semibold text-[#8a809a] sm:text-sm">Niko&apos;s Games · look closely, take your time</p>
        </div>
        {timerInfo.seconds > 0 && !finished && (
          <div
            className={`flex shrink-0 items-center gap-1 rounded-full border-4 border-white px-3 py-1 text-xl font-bold tabular-nums ${
              timeLeft <= 10 ? "bg-[#ffe4e0] text-[#c2410c]" : "bg-white/90 text-[#3b2f4a]"
            }`}
            aria-label={`${timeLeft} seconds left, gentle timer`}
          >
            <span aria-hidden="true">⏳</span>
            {timeLeft}
          </div>
        )}
      </div>

      {/* scene picker + timers */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 px-2 pb-1.5">
        {FIND_SCENES.map((sc) => (
          <button
            key={sc.key}
            type="button"
            onClick={() => resetTo(sc.key, timer)}
            aria-pressed={sceneKey === sc.key}
            className={`flex cursor-pointer items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-bold transition-colors sm:text-sm ${
              sceneKey === sc.key ? "border-[#7c5cff] bg-[#efeaff] text-[#4b2fbd]" : "border-white bg-white/80 text-[#6b6080] hover:bg-white"
            }`}
          >
            <span aria-hidden="true">{sc.icon}</span>
            {sc.name}
          </button>
        ))}
      </div>

      {/* prompt card */}
      <div className="relative z-10 mx-2 mb-1.5 flex items-center gap-2 rounded-2xl border-4 border-white bg-white/95 px-2.5 py-1.5 shadow-[0_4px_0_rgba(59,47,74,0.1)] sm:mx-4">
        <div className="shrink-0">
          <FriendPreview kind="niko" size={46} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7c5cff]">Niko says</p>
          <p className={`text-base font-bold leading-tight sm:text-lg ${promptColor}`} aria-live="polite">
            {finished
              ? "Great looking! You found them all."
              : allFoundNow
                ? "Yes! You found all three! 🎉"
                : current
                  ? isPhrase
                    ? <>Can you find <span className="text-[#ff4f8f]">{currentLabel}</span>?</>
                    : <>Can you find the <span className="text-[#ff4f8f]">{currentLabel}</span>?</>
                  : "Look closely…"}
          </p>
        </div>
        {current && (
          <div className="flex shrink-0 flex-col items-center">
            {["bunny", "kitty", "bear", "frog", "niko"].includes(current.kind) ? (
              <FriendPreview kind={current.kind as "bunny"} size={44} />
            ) : current.kind === "butterfly" ? (
              <span className="text-2xl" aria-hidden="true">🦋</span>
            ) : (
              <ItemPreview kind={current.kind as CountItem} size={40} />
            )}
            <div className="mt-0.5 flex gap-1" aria-label={`${found.length} of 3 found`}>
              {Array.from({ length: FOUND_PER_ROUND }).map((_, i) => (
                <span key={i} aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${i < found.length ? "bg-[#3cc68a]" : "bg-[#e6e0f2]"}`} />
              ))}
            </div>
          </div>
        )}
        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            onClick={showHint}
            disabled={finished}
            aria-label="Show a hint: glow around the answer"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-2 border-[#ffe0a8] bg-[#fff8e1] text-lg disabled:opacity-40"
          >
            💡
          </button>
          {canSpeak && (
            <button
              type="button"
              onClick={ask}
              disabled={finished}
              aria-label="Hear Niko's question"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-2 border-[#e2dafc] bg-[#f6f2ff] text-lg disabled:opacity-40"
            >
              🔊
            </button>
          )}
        </div>
      </div>

      {/* stage */}
      <div ref={stageRef} className="relative mx-2 flex-1 overflow-hidden rounded-[1.4rem] border-4 border-white bg-[#eaf9ff] shadow-[0_6px_0_rgba(59,47,74,0.1)] sm:mx-4">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%" }}
          className="absolute inset-0 h-full w-full cursor-pointer"
          onPointerDown={(e) => {
            pointerStart.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const start = pointerStart.current;
            pointerStart.current = null;
            if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 14) return;
            pickAt(e.clientX, e.clientY);
          }}
          aria-label={`Hidden object scene: ${scene.name}. Look for ${currentLabel}.`}
          role="img"
        />
        {wrongFlash && (
          <span
            key={wrongFlash.key}
            className="wrong-wobble pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-0.5 text-sm font-bold text-[#c2410c]"
            style={{ left: wrongFlash.x, top: wrongFlash.y }}
          >
            Look again 💛
          </span>
        )}
        {hint && (
          <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#fff8e1]/95 px-3 py-0.5 text-xs font-bold text-[#9a6b00]">
            The glowing one! ✨
          </div>
        )}
      </div>

      {/* bottom controls */}
      <div className="relative z-10 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 sm:px-4">
        {finished ? (
          <div className="relative overflow-hidden rounded-2xl border-4 border-white bg-white/95 p-2 text-center shadow-[0_5px_0_rgba(59,47,74,0.1)]">
            <div className="flex items-center justify-center gap-2">
              <span className="anim-floaty">
                <FriendPreview kind="niko" size={64} />
              </span>
              <div className="text-left">
                <h2 className="text-xl font-bold leading-none text-[#3b2f4a] sm:text-2xl">
                  {timerInfo.seconds > 0 && timeLeft <= 0 ? "Time's up — look what you found!" : "Fantastic looking!"}
                </h2>
                <p className="text-xs font-semibold text-[#6b6080] sm:text-sm">
                  You found all six hidden things in {scene.name}. 🎉
                </p>
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
              <button
                type="button"
                onClick={restart}
                autoFocus
                className="btn-chunky min-h-[48px] cursor-pointer rounded-full bg-[#3cc68a] px-5 text-lg font-bold text-white"
              >
                ↻ Play again
              </button>
              <button
                type="button"
                onClick={() => {
                  const idx = FIND_SCENES.findIndex((s) => s.key === sceneKey);
                  const next = FIND_SCENES[(idx + 1) % FIND_SCENES.length];
                  resetTo(next.key, timer);
                }}
                className="btn-chunky min-h-[48px] cursor-pointer rounded-full bg-[#7c5cff] px-4 text-lg font-bold text-white"
              >
                🗺️ Next scene
              </button>
              <BigButton color="white" onClick={onHome} className="!min-h-[48px] !text-lg">
                🏠 Home
              </BigButton>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-2xl border-4 border-white bg-white/95 p-1.5 shadow-[0_5px_0_rgba(59,47,74,0.1)]">
            <span className="hidden shrink-0 text-xs font-bold text-[#8a809a] sm:block">Timer:</span>
            <div className="flex flex-1 justify-center gap-1">
              {(Object.keys(TIMERS) as TimerChoice[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => resetTo(sceneKey, k)}
                  aria-pressed={timer === k}
                  title={TIMERS[k].blurb}
                  className={`flex min-h-[38px] flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl px-1.5 text-xs font-bold transition-colors sm:text-sm ${
                    timer === k ? "bg-[#7c5cff] text-white" : "bg-[#f6f2ff] text-[#6b6080] hover:bg-[#efeaff]"
                  }`}
                >
                  <span aria-hidden="true">{TIMERS[k].icon}</span>
                  {TIMERS[k].label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={restart}
              aria-label="Start this scene again"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f6f2ff] text-lg text-[#6b6080]"
            >
              ↻
            </button>
          </div>
        )}
        <p className="mt-0.5 text-center text-[10px] font-semibold text-[#a79cba]">
          Times are optional. A guess that isn&apos;t it never takes anything away. 💛
        </p>
      </div>
    </div>
  );
}
