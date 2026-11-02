import { useEffect, useRef, useState } from "react";
import { audio } from "../game/audio";
import { FRIENDS, type Settings } from "../game/types";
import { FriendPreview } from "./FriendPreview";
import { BigButton } from "./ui";

type Tab = "play" | "jam";

export interface MeadowInstrument {
  key: string;
  name: string;
  icon: string;
  bg: string;
  ring: string;
  darkText: boolean;
  keyHint: string;
}

export const MEADOW_INSTRUMENTS: MeadowInstrument[] = [
  { key: "guitar", name: "Guitar", icon: "🎸", bg: "#ff7ab6", ring: "#e5457f", darkText: false, keyHint: "1" },
  { key: "piano", name: "Piano", icon: "🎹", bg: "#4aa8ff", ring: "#2b6fd6", darkText: false, keyHint: "2" },
  { key: "trumpet", name: "Trumpet", icon: "🎺", bg: "#ffd23f", ring: "#d99a00", darkText: true, keyHint: "3" },
  { key: "drum", name: "Drum", icon: "🥁", bg: "#ff9f4d", ring: "#c96a1e", darkText: false, keyHint: "4" },
  { key: "violin", name: "Violin", icon: "🎻", bg: "#a98bff", ring: "#7a5cd6", darkText: false, keyHint: "5" },
  { key: "bell", name: "Bell", icon: "🔔", bg: "#3cc68a", ring: "#1e8f5c", darkText: false, keyHint: "6" },
];

/** Shuffled order so every instrument is asked for exactly once. Exported for testing. */
export function makeOrder(rand: () => number = Math.random): number[] {
  const order = MEADOW_INSTRUMENTS.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

interface Note {
  id: number;
  pad: number;
  symbol: string;
  left: number;
}

const NOTE_SYMBOLS = ["♪", "♫", "♩", "♬"];

export function MusicMeadow({
  settings,
  onHome,
  onChange,
}: {
  settings: Settings;
  onHome: () => void;
  onChange: (s: Partial<Settings>) => void;
}) {
  const [tab, setTab] = useState<Tab>("play");
  const [order, setOrder] = useState<number[]>(() => makeOrder());
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [helpPad, setHelpPad] = useState<number | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [finished, setFinished] = useState(false);
  const [jamCount, setJamCount] = useState(0);
  const [cheerKey, setCheerKey] = useState("");

  const alive = useRef(true);
  const noteId = useRef(0);
  const tabRef = useRef<Tab>("play");
  tabRef.current = tab;

  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  const chosen = FRIENDS.find((f) => f.kind === settings.friend) ?? FRIENDS[1];
  const pal = chosen.kind === "niko" ? FRIENDS[1] : chosen; // Niko hosts, a pal dances along
  const total = MEADOW_INSTRUMENTS.length;
  const target = MEADOW_INSTRUMENTS[order[Math.min(step, order.length - 1)]];

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const sprinkleNotes = (pad: number) => {
    if (settings.calm) return;
    const id = ++noteId.current;
    setNotes((prev) => [...prev.slice(-11), { id, pad, symbol: NOTE_SYMBOLS[id % NOTE_SYMBOLS.length], left: 14 + ((id * 41) % 68) }]);
    window.setTimeout(() => setNotes((prev) => prev.filter((n) => n.id !== id)), 1100);
  };

  const tapPad = (i: number) => {
    audio.unlock();
    const inst = MEADOW_INSTRUMENTS[i];
    if (tabRef.current === "jam") {
      audio.instrument(inst.key);
      sprinkleNotes(i);
      setJamCount((c) => c + 1);
      return;
    }
    if (finished || step >= total) return;
    if (i === order[step]) {
      // found it — play its true sound!
      audio.instrument(inst.key);
      sprinkleNotes(i);
      setHelpPad(null);
      setFound((f) => [...f, inst.key]);
      setCheerKey(inst.key + Date.now());
      if (step + 1 >= total) {
        window.setTimeout(() => {
          if (!alive.current || tabRef.current !== "play") return;
          setFinished(true);
          audio.tada();
        }, 1100);
      } else {
        window.setTimeout(() => {
          if (!alive.current || tabRef.current !== "play") return;
          setStep((s) => s + 1);
        }, 1000);
      }
    } else {
      audio.miss();
      setWrong(i);
      window.setTimeout(() => setWrong((w) => (w === i ? null : w)), 550);
    }
  };

  // number keys 1–6 play the instruments
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const idx = ["1", "2", "3", "4", "5", "6"].indexOf(e.key);
      if (idx < 0) return;
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA")) return;
      e.preventDefault();
      tapPad(idx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, step, finished]);

  /** Plays the target's true timbre — a listening hint. */
  const hearIt = () => {
    if (tab !== "play" || finished) return;
    audio.unlock();
    audio.instrument(target.key);
    sprinkleNotes(order[step]);
  };

  /** Pulses the right instrument for children who need a visual hint. */
  const showMe = () => {
    if (tab !== "play" || finished) return;
    audio.click();
    const idx = order[step];
    setHelpPad(idx);
    window.setTimeout(() => setHelpPad((h) => (h === idx ? null : h)), 1100);
  };

  const speak = (text: string) => {
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
  };

  const sayIt = () => {
    audio.unlock();
    if (tab === "jam") {
      speak("Free jam! Tap any instrument and hear how it sounds.");
      return;
    }
    speak(`Can you play the ${target.name}? Find the ${target.name}.`);
  };

  const switchTab = (t: Tab) => {
    audio.click();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setTab(t);
    setWrong(null);
    setHelpPad(null);
  };

  const restart = () => {
    audio.click();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setOrder(makeOrder());
    setStep(0);
    setFound([]);
    setFinished(false);
    setWrong(null);
    setHelpPad(null);
    setCheerKey("");
  };

  const justFound = found.length > step && !finished;

  return (
    <div className={`absolute inset-0 z-20 flex flex-col overflow-y-auto bg-[linear-gradient(#2e3a75_0%,#6f6fc0_45%,#a8e6c9_100%)] ${settings.calm ? "calm" : ""}`}>
      {/* meadow backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[3%] h-16 w-16 -translate-x-1/2 rounded-full bg-[#fff3c4] shadow-[0_0_0_12px_rgba(255,243,196,0.2)]" />
        {["#ff7ab6", "#ffd23f", "#7ad7ff", "#ff9ec7", "#a98bff", "#7be08f"].map((c, i) => (
          <div
            key={c}
            className="absolute h-7 w-5 rounded-t-full"
            style={{ left: `${4 + i * 16}%`, top: `${6 + (i % 3) * 4}%`, backgroundColor: c, transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 12}deg)` }}
          />
        ))}
        <div className="absolute -bottom-24 -left-12 h-56 w-[85%] rounded-[50%] bg-[#7ccf8f]" />
        <div className="absolute -bottom-28 -right-12 h-60 w-[90%] rounded-[50%] bg-[#5cb874]" />
        <div className="absolute bottom-0 inset-x-0 h-20 bg-[#4da862]" />
        {!settings.calm &&
          Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="firefly"
              style={{ left: `${(i * 83) % 100}%`, top: `${30 + ((i * 47) % 45)}%`, animationDelay: `${(i % 6) * 0.7}s` }}
            />
          ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-xl flex-col gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        {/* header */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onHome}
            aria-label="Back to Niko's Games home"
            className="btn-chunky flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-white/95 text-2xl text-[#3b2f4a]"
          >
            🏠
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold leading-none text-white drop-shadow-[0_2px_0_rgba(59,47,74,0.4)] sm:text-2xl">
              <span className="rounded-lg bg-[#ff7ab6] px-1.5 py-0.5 text-white">Music</span> Meadow
            </h1>
            <p className="text-xs font-semibold text-white/85 sm:text-sm">Niko&apos;s Games · find it, play it, hear it</p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 rounded-full border-2 border-white bg-white/85 px-2 py-1" aria-label={`${found.length} of ${total} instruments found`}>
            {MEADOW_INSTRUMENTS.map((inst, i) => (
              <span key={inst.key} aria-hidden="true" className={`text-base transition-all sm:text-lg ${i < found.length ? "scale-110" : "opacity-30 grayscale"}`}>
                ⭐
              </span>
            ))}
          </div>
        </div>

        {/* tabs */}
        <div className="flex justify-center gap-1.5" role="tablist" aria-label="Play with Niko or free jam">
          {(
            [
              { key: "play", label: "🎵 Play with Niko" },
              { key: "jam", label: "🎶 Free jam" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => switchTab(t.key)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition-colors sm:text-base ${
                tab === t.key ? "bg-white text-[#3b2f4a] shadow" : "bg-white/25 text-white hover:bg-white/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {finished && tab === "play" ? (
          <div className="my-auto flex flex-col items-center py-3">
            <div className="anim-popin w-full max-w-md rounded-[2rem] border-4 border-white bg-white/95 p-5 text-center shadow-[0_12px_0_rgba(59,47,74,0.15)]">
              <div className="flex items-end justify-center gap-1">
                <span className="anim-floaty text-5xl" aria-hidden="true">🎶</span>
                <div className="anim-floaty" style={{ animationDelay: "0.2s" }}>
                  <FriendPreview kind="niko" size={96} />
                </div>
                <div className="anim-floaty" style={{ animationDelay: "0.4s" }}>
                  <FriendPreview kind={pal.kind} size={80} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-[#3b2f4a] sm:text-4xl">Wonderful concert!</h2>
              <p className="text-base font-semibold text-[#6b6080] sm:text-lg">You found every instrument and heard them all play! 🎸🎹🎺</p>
              <div className="my-3 flex items-center justify-center gap-1">
                {MEADOW_INSTRUMENTS.map((inst) => (
                  <span key={inst.key} className="anim-popin text-4xl sm:text-5xl" style={{ animationDelay: `${MEADOW_INSTRUMENTS.indexOf(inst) * 0.12}s` }}>
                    ⭐
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <BigButton color="pink" onClick={restart} autoFocus className="text-2xl">
                  ↻ Play again
                </BigButton>
                <BigButton color="purple" onClick={() => switchTab("jam")}>
                  🎶 Free jam
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
            {!settings.sound && (
              <div className="flex items-center gap-2 rounded-3xl border-4 border-[#ffb000] bg-[#fff8e1] p-3 shadow-[0_6px_0_rgba(59,47,74,0.12)]">
                <span className="text-3xl" aria-hidden="true">🔇</span>
                <p className="min-w-0 flex-1 text-sm font-bold leading-snug text-[#7a5200] sm:text-base">
                  Sounds are off, so the instruments can&apos;t be heard right now.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    audio.unlock();
                    onChange({ sound: true });
                    window.setTimeout(() => audio.guitar(), 60);
                  }}
                  className="btn-chunky shrink-0 cursor-pointer rounded-full bg-[#ffb000] px-4 py-2 text-base font-bold text-white"
                >
                  🔊 Turn on
                </button>
              </div>
            )}

            {/* Niko's prompt */}
            <div className="rounded-3xl border-4 border-white bg-white/95 p-3 shadow-[0_6px_0_rgba(59,47,74,0.12)]">
              <div className="flex items-center gap-2">
                <div className="shrink-0">
                  <div className="anim-floaty">
                    <FriendPreview kind="niko" size={66} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-wider text-[#e5457f] uppercase">Niko says</p>
                  {tab === "jam" ? (
                    <>
                      <p className="text-lg font-bold leading-tight text-[#3b2f4a] sm:text-xl">Just play! Tap anything! 🎶</p>
                      <p className="text-xs font-semibold text-[#6b6080]">{jamCount === 0 ? "Every instrument has its own sound." : `${jamCount} sweet sound${jamCount === 1 ? "" : "s"} played!`}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold leading-tight text-[#3b2f4a] sm:text-xl" aria-live="polite">
                        {justFound ? (
                          <span key={cheerKey}>Yes! That was the {MEADOW_INSTRUMENTS.find((m) => m.key === found[found.length - 1])?.name}! 🎉</span>
                        ) : (
                          <>Can you play the <span className="text-[#e5457f]">{target.name}</span>? {target.icon}</>
                        )}
                      </p>
                      <div className="mt-1 flex items-center gap-1" aria-label={`Instrument ${Math.min(step + 1, total)} of ${total}`}>
                        <span className="text-xs font-bold text-[#8a809a]">Find {Math.min(step + 1, total)}/{total}</span>
                        {MEADOW_INSTRUMENTS.map((_, i) => (
                          <span
                            key={i}
                            aria-hidden="true"
                            className={`h-2.5 w-2.5 rounded-full transition-all ${i < found.length ? "scale-110 bg-[#3cc68a]" : i === found.length ? "bg-[#ffb000]" : "bg-[#e6e0f2]"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {canSpeak && (
                  <button
                    type="button"
                    onClick={sayIt}
                    aria-label={tab === "jam" ? "Hear what free jam is" : `Hear Niko ask for the ${target.name}`}
                    className="btn-chunky flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border-4 border-[#e2dafc] bg-[#f6f2ff] text-xl leading-none text-[#3b2f4a]"
                  >
                    <span aria-hidden="true">🔊</span>
                    <span className="mt-0.5 text-[10px] font-bold">Say it</span>
                  </button>
                )}
              </div>
              {tab === "play" && !finished && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 border-t-2 border-dashed border-[#eee7fa] pt-2">
                  <button
                    type="button"
                    onClick={hearIt}
                    className="cursor-pointer rounded-full bg-[#efeaff] px-3 py-1 text-xs font-bold text-[#4b2fbd] sm:text-sm"
                  >
                    🔊 Hear it
                  </button>
                  <button
                    type="button"
                    onClick={showMe}
                    className="cursor-pointer rounded-full bg-[#fff8e1] px-3 py-1 text-xs font-bold text-[#9a6b00] sm:text-sm"
                  >
                    💡 Show me
                  </button>
                </div>
              )}
            </div>

            {/* instrument board */}
            <div className="relative rounded-3xl border-4 border-white bg-[#fffdf5]/90 p-2 shadow-[0_6px_0_rgba(59,47,74,0.1)] sm:p-3" role="group" aria-label="Six musical instruments">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                {notes.map((n) => (
                  <span key={n.id} className="note-float" style={{ left: `${n.left}%`, bottom: "14%", color: MEADOW_INSTRUMENTS[n.pad].ring }}>
                    {n.symbol}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {MEADOW_INSTRUMENTS.map((inst, i) => {
                  const isHelp = helpPad === i;
                  const isWrong = wrong === i;
                  const isFound = found.includes(inst.key);
                  return (
                    <button
                      key={inst.key}
                      type="button"
                      onClick={() => tapPad(i)}
                      aria-label={`Play the ${inst.name}. Keyboard key ${inst.keyHint}.`}
                      className={`relative flex min-h-[104px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-3xl border-b-8 transition-all duration-150 active:translate-y-1 active:border-b-2 sm:min-h-[118px] ${
                        isWrong ? "wrong-wobble" : ""
                      }`}
                      style={{
                        backgroundColor: inst.bg,
                        borderColor: inst.ring,
                        transform: isHelp ? "scale(1.06)" : undefined,
                        boxShadow: isHelp ? `0 0 0 5px #ffffff, 0 0 26px 6px ${inst.bg}` : undefined,
                        opacity: isFound && tab === "play" ? 0.85 : 1,
                      }}
                    >
                      <span className="text-4xl sm:text-5xl" aria-hidden="true">
                        {inst.icon}
                      </span>
                      <span
                        className="rounded-full bg-white/85 px-2 text-base font-bold leading-tight sm:text-lg"
                        style={{ color: "#3b2f4a" }}
                      >
                        {inst.name}
                      </span>
                      <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-xs font-bold text-[#3b2f4a]" aria-hidden="true">
                        {inst.keyHint}
                      </span>
                      {isFound && tab === "play" && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#3cc68a] text-xs font-bold text-white" aria-hidden="true">
                          ✓
                        </span>
                      )}
                      {isHelp && (
                        <span className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 py-0.5 text-sm shadow" aria-hidden="true">
                          💡
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-center text-xs font-bold text-[#6b6080] sm:text-sm" aria-live="polite">
                {tab === "jam"
                  ? "Keys 1–6 work too! Tap and listen. 🎹"
                  : "Find the one Niko asked for and tap it to hear it play! A tap that isn't it just wobbles — try again! 💛"}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-white/90">
              <FriendPreview kind={pal.kind} size={26} />
              <span className="drop-shadow-[0_1px_0_rgba(59,47,74,0.4)]">{pal.name} loves your concert!</span>
              <span className="anim-floaty inline-block" aria-hidden="true">
                💃
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
