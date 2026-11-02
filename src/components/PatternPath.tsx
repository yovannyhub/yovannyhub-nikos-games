import { useEffect, useMemo, useRef, useState } from "react";
import { audio } from "../game/audio";
import { FRIENDS, type Settings } from "../game/types";
import { FriendPreview } from "./FriendPreview";
import { ITEM_INFO, ItemPreview, type CountItem } from "./ItemPreview";
import { BigButton } from "./ui";

type Difficulty = "easy" | "tricky";

interface Level {
  unit: CountItem[];
  visible: number;
  options: CountItem[];
}

/** Hand-made patterns so every step is predictable and unambiguous. */
export const LEVELS: Record<Difficulty, Level[]> = {
  easy: [
    { unit: ["strawberry", "blueberry"], visible: 4, options: ["strawberry", "blueberry"] },
    { unit: ["star", "star", "heart"], visible: 5, options: ["heart", "star"] },
    { unit: ["heart", "blueberry"], visible: 5, options: ["blueberry", "heart"] },
    { unit: ["blueberry", "blueberry", "strawberry"], visible: 5, options: ["strawberry", "blueberry"] },
    { unit: ["strawberry", "heart", "heart"], visible: 4, options: ["heart", "strawberry"] },
  ],
  tricky: [
    { unit: ["star", "blueberry", "blueberry"], visible: 5, options: ["blueberry", "star", "heart"] },
    { unit: ["strawberry", "strawberry", "blueberry", "blueberry"], visible: 5, options: ["strawberry", "blueberry", "heart"] },
    { unit: ["heart", "star", "blueberry"], visible: 5, options: ["blueberry", "heart", "star"] },
    { unit: ["blueberry", "blueberry", "star"], visible: 5, options: ["star", "blueberry", "heart"] },
    { unit: ["star", "heart", "heart", "blueberry"], visible: 5, options: ["heart", "blueberry", "star"] },
  ],
};

const HOW_TO_PLAY: Record<Difficulty, string> = {
  easy: "Look at the path. Which one comes next?",
  tricky: "Look closely! The pattern may repeat three or four things.",
};

export function sequenceOf(level: Level): CountItem[] {
  return Array.from({ length: level.visible }, (_, i) => level.unit[i % level.unit.length]);
}
export function answerOf(level: Level): CountItem {
  return level.unit[level.visible % level.unit.length];
}
function nameOf(t: CountItem): string {
  return ITEM_INFO[t].one;
}

/** Deterministic shuffle so choices stay in the same place between renders. */
function shuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let s = seed * 9301 + 49297;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface Wrong {
  tile: CountItem;
  key: number;
}

export function PatternPath({ settings, onHome }: { settings: Settings; onHome: () => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<Wrong | null>(null);
  const [finished, setFinished] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);

  const chosen = FRIENDS.find((f) => f.kind === settings.friend) ?? FRIENDS[1];
  const pal = chosen.kind === "niko" ? FRIENDS[1] : chosen; // Niko hosts, a pal walks the path
  const levels = LEVELS[difficulty];
  const level = levels[Math.min(round, levels.length - 1)];
  const sequence = useMemo(() => sequenceOf(level), [level]);
  const answer = answerOf(level);
  const options = useMemo(() => {
    // always offer a valid correct answer, even if a level is edited later
    const base = level.options.includes(answer) ? level.options : [answer, ...level.options.slice(0, Math.max(1, level.options.length - 1))];
    return shuffle(base, difficulty === "easy" ? round + 3 : round + 9);
  }, [level, difficulty, round, answer]);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (solved) nextRef.current?.focus();
  }, [solved]);

  useEffect(() => {
    if (!wrong) return;
    const id = window.setTimeout(() => setWrong(null), 650);
    return () => window.clearTimeout(id);
  }, [wrong]);

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const speak = () => {
    if (!canSpeak) return;
    try {
      window.speechSynthesis.cancel();
      const words = sequence.map(nameOf).join(", ");
      const u = new SpeechSynthesisUtterance(`${words}. What comes next?`);
      u.rate = 0.82;
      u.pitch = 1.1;
      u.volume = 0.9;
      window.speechSynthesis.speak(u);
    } catch {
      /* no voice available */
    }
  };

  const pick = (tile: CountItem) => {
    if (solved || finished) return;
    if (tile === answer) {
      audio.catch(round * 2 + 1);
      setSolved(true);
      setWrong(null);
    } else {
      audio.miss();
      setWrong({ tile, key: Date.now() });
    }
  };

  const nextStep = () => {
    if (!solved) return;
    if (round + 1 >= levels.length) {
      setFinished(true);
      audio.tada();
      return;
    }
    setRound((r) => r + 1);
    setSolved(false);
    setWrong(null);
    audio.click();
  };

  const reset = (d: Difficulty = difficulty) => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    audio.click();
    setDifficulty(d);
    setRound(0);
    setSolved(false);
    setWrong(null);
    setFinished(false);
  };

  const feedback = solved ? "Yes! You finished the pattern! 🎉" : wrong ? "Almost! Look at the path again. 💛" : "";
  const completed = round + (solved ? 1 : 0);

  return (
    <div className={`absolute inset-0 z-20 overflow-y-auto bg-[linear-gradient(#a9e4ff_0%,#e3f7ff_52%,#f2ffe6_100%)] ${settings.calm ? "calm" : ""}`}>
      {/* meadow backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[7%] top-[5%] h-20 w-20 rounded-full bg-[#ffe066] shadow-[0_0_0_14px_rgba(255,224,102,0.3)]" />
        <div className="absolute left-[5%] top-[17%] h-8 w-24 rounded-full bg-white/80" />
        <div className="absolute left-[16%] top-[19%] h-10 w-14 rounded-full bg-white/80" />
        <div className="absolute right-[14%] top-[24%] h-7 w-20 rounded-full bg-white/70" />
        <div className="absolute -bottom-24 -left-12 h-56 w-[80%] rounded-[50%] bg-[#b8e8a6]" />
        <div className="absolute -bottom-28 -right-12 h-60 w-[85%] rounded-[50%] bg-[#98dd8b]" />
        <div className="absolute bottom-0 inset-x-0 h-20 bg-[#7fd074]" />
        {[12, 27, 46, 71, 88].map((left, i) => (
          <div key={left} className="absolute bottom-2" style={{ left: `${left}%` }}>
            <div className="h-4 w-4 rounded-full bg-[#ffe066]" style={{ boxShadow: "0 0 0 5px rgba(255,224,102,0.35)" }} />
            <div className="mx-auto -mt-1 h-3 w-1 bg-[#4e9b4a]" />
            {i % 2 === 0 && <div className="absolute -top-2 -left-1 h-3 w-3 rounded-full bg-[#ff9ec7]" />}
          </div>
        ))}
      </div>

      <div className="relative mx-auto flex min-h-full w-full max-w-xl flex-col gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        {/* header */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onHome}
            aria-label="Back to Niko's Games home"
            className="btn-chunky flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-white/90 text-2xl text-[#3b2f4a]"
          >
            🏠
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold leading-none text-[#3b2f4a] sm:text-2xl">
              <span className="rounded-lg bg-[#ffb000] px-1.5 py-0.5 text-white">Pattern</span> Path
            </h1>
            <p className="text-xs font-semibold text-[#4b5b6b] sm:text-sm">Niko&apos;s Games · no timer, no rush</p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 rounded-full border-2 border-white bg-white/80 px-2 py-1" aria-label={`${completed} of ${levels.length} stars earned`}>
            {levels.map((_, i) => (
              <span key={i} aria-hidden="true" className={`text-base transition-all sm:text-lg ${i < completed ? "scale-110" : "opacity-30 grayscale"}`}>
                ⭐
              </span>
            ))}
          </div>
        </div>

        {finished ? (
          <div className="my-auto flex flex-col items-center py-3">
            <div className="anim-popin w-full max-w-md rounded-[2rem] border-4 border-white bg-white/95 p-5 text-center shadow-[0_12px_0_rgba(59,47,74,0.15)]">
              <div className="relative mx-auto flex w-fit items-end gap-2">
                <span className="anim-floaty text-6xl" aria-hidden="true">🧺</span>
                <div className="anim-floaty" style={{ animationDelay: "0.3s" }}>
                  <FriendPreview kind={pal.kind} size={110} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-[#3b2f4a] sm:text-4xl">Picnic time!</h2>
              <p className="text-base font-semibold text-[#6b6080] sm:text-lg">
                {pal.name} walked the whole Pattern Path. What a clever pattern spotter!
              </p>
              <div className="my-3 flex items-center justify-center gap-1">
                {levels.map((_, i) => (
                  <span key={i} className="anim-popin text-4xl sm:text-5xl" style={{ animationDelay: `${i * 0.12}s` }}>
                    ⭐
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <BigButton color="pink" onClick={() => reset(difficulty)} autoFocus className="text-2xl">
                  ↻ Play again
                </BigButton>
                <BigButton color="purple" onClick={() => reset(difficulty === "easy" ? "tricky" : "easy")}>
                  {difficulty === "easy" ? "🧠 Try trickier patterns" : "🪶 Back to easy patterns"}
                </BigButton>
                <BigButton color="white" onClick={onHome}>
                  🏠 Home
                </BigButton>
              </div>
              <p className="mt-3 text-xs font-semibold text-[#a79cba]">⭐ Niko&apos;s Games · gentle play for little hands ⭐</p>
            </div>
          </div>
        ) : (
          <>
            {/* Niko's prompt */}
            <div className="rounded-3xl border-4 border-white bg-white/95 p-3 shadow-[0_6px_0_rgba(59,47,74,0.12)]">
              <div className="flex items-center gap-2">
                <div className="shrink-0">
                  <div className="anim-floaty">
                    <FriendPreview kind="niko" size={70} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-wider text-[#ff9f00] uppercase">Niko says</p>
                  <p className="text-lg font-bold leading-tight text-[#3b2f4a] sm:text-2xl">
                    {solved ? "Hooray! You did it!" : wrong ? "Nearly! Try again." : "What comes next? 🔍"}
                  </p>
                  <p className="text-xs font-medium leading-tight text-[#6b6080] sm:text-sm">{HOW_TO_PLAY[difficulty]}</p>
                </div>
                {canSpeak && (
                  <button
                    type="button"
                    onClick={() => {
                      audio.unlock();
                      speak();
                    }}
                    aria-label="Hear the pattern read aloud"
                    className="btn-chunky flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border-4 border-[#e2dafc] bg-[#f6f2ff] text-xl leading-none text-[#3b2f4a]"
                  >
                    <span aria-hidden="true">🔊</span>
                    <span className="mt-0.5 text-[10px] font-bold">Say it</span>
                  </button>
                )}
              </div>
              {round === 0 && !solved && (
                <div className="mt-2 flex items-center justify-center gap-2 border-t-2 border-dashed border-[#eee7fa] pt-2">
                  <span className="text-xs font-bold text-[#8a809a]">Patterns:</span>
                  {(["easy", "tricky"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => reset(d)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                        difficulty === d ? "bg-[#ffb000] text-white" : "bg-[#f6f2ff] text-[#6b6080] hover:bg-[#efeaff]"
                      }`}
                    >
                      {d === "easy" ? "Easy" : "Tricky"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* stepping-stone path */}
            <div className="rounded-3xl border-4 border-white bg-[#fffdf5]/85 px-2 py-2 shadow-[0_6px_0_rgba(59,47,74,0.1)]">
              <div className="mb-1 flex items-center justify-between px-1">
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-[#6b6080]">Step {round + 1} of {levels.length}</span>
                <span className="flex items-center gap-1 text-xs font-bold text-[#7c5cff]">
                  <span aria-hidden="true">🦶</span> Tap the next stone
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-1.5" role="group" aria-label="The pattern so far, then an empty space for what comes next">
                <div className="hidden shrink-0 sm:block">
                  <FriendPreview kind={pal.kind} size={44} />
                </div>
                {sequence.map((tile, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center"
                    style={{ transform: `translateY(${(i % 2 === 0 ? 0 : 6) + (i === sequence.length - 1 ? 4 : 0)}px)` }}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-[#e8f6e0] shadow-[0_3px_0_rgba(79,140,70,0.25)] sm:h-14 sm:w-14">
                      <ItemPreview kind={tile} size={38} />
                    </div>
                    <span className="sr-only">{nameOf(tile)}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center">
                  <div
                    className={`anim-wiggle flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-dashed text-2xl font-bold sm:h-[60px] sm:w-[60px] ${
                      solved ? "border-[#3cc68a] bg-[#e8fbf1]" : "border-[#ffb000] bg-[#fff8e1] text-[#ff9f00]"
                    }`}
                    style={{ boxShadow: solved ? "0 0 0 6px rgba(60,198,138,0.18)" : "0 0 0 6px rgba(255,176,0,0.15)" }}
                  >
                    {solved ? (
                      <span key="answered" className="fruit-pop">
                        <ItemPreview kind={answer} size={40} />
                      </span>
                    ) : (
                      <span aria-hidden="true">?</span>
                    )}
                  </div>
                  <span className="sr-only">{solved ? `Answer: ${nameOf(answer)}` : "What comes next?"}</span>
                </div>
              </div>
            </div>

            {/* feedback */}
            <p
              className={`min-h-[24px] text-center text-sm font-bold sm:text-base ${solved ? "text-[#22a06b]" : wrong ? "text-[#c2410c]" : "text-[#6b6080]"}`}
              aria-live="polite"
            >
              {feedback || (solved ? "" : "Pick one below 👇")}
            </p>

            {/* answer choices or next */}
            {solved ? (
              <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white/95 p-3 text-center shadow-[0_6px_0_rgba(59,47,74,0.12)]">
                <div className="confetti" aria-hidden="true">
                  {Array.from({ length: settings.calm ? 6 : 16 }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        left: `${4 + i * 6}%`,
                        animationDelay: `${(i % 6) * 0.1}s`,
                        background: ["#ff7ab6", "#ffd23f", "#7be08f", "#7ad7ff", "#a98bff"][i % 5],
                      }}
                    />
                  ))}
                </div>
                <button
                  ref={nextRef}
                  type="button"
                  onClick={nextStep}
                  className="btn-chunky relative inline-flex min-h-[56px] w-full max-w-xs cursor-pointer items-center justify-center rounded-full bg-[#3cc68a] px-6 text-2xl font-bold text-white"
                >
                  {round + 1 >= levels.length ? "Picnic time! 🧺" : "Next stone →"}
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border-4 border-white bg-white/95 p-2 shadow-[0_6px_0_rgba(59,47,74,0.12)] sm:p-3">
                <p className="mb-1 text-center text-xs font-bold text-[#8a809a] sm:text-sm">
                  {options.length} choices — take your time
                </p>
                <div className={`mx-auto grid max-w-md gap-2 ${options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  {options.map((tile) => {
                    const isWrong = wrong?.tile === tile;
                    return (
                      <button
                        key={`${tile}`}
                        type="button"
                        onClick={() => pick(tile)}
                        aria-label={`Choose the ${nameOf(tile)}`}
                        className={`flex min-h-[64px] cursor-pointer items-center justify-center gap-1 rounded-2xl border-4 bg-[#fff7fb] px-2 py-1 transition-transform active:translate-y-1 active:scale-95 hover:border-[#ffc2da] hover:bg-white sm:min-h-[72px] ${
                          isWrong ? "wrong-wobble border-[#ffb000]" : "border-[#ffe6f0]"
                        }`}
                      >
                        <ItemPreview kind={tile} size={54} />
                        <span className="hidden text-sm font-bold text-[#6b6080] sm:block">{nameOf(tile)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-[#6b6080]">
              <FriendPreview kind={pal.kind} size={26} />
              <span>{pal.name} is walking the path with you!</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
