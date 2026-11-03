import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { audio } from "../game/audio";
import { FRIENDS, type Settings } from "../game/types";
import { FriendPreview } from "./FriendPreview";
import { ITEM_INFO, ItemPreview, type CountItem } from "./ItemPreview";
import { BigButton } from "./ui";

type SetKey = "little" | "big";

const SETS: Record<SetKey, { targets: number[]; label: string; max: number }> = {
  little: { targets: [1, 2, 3, 4, 5], label: "1–5", max: 5 },
  big: { targets: [6, 7, 8, 9, 10], label: "6–10", max: 10 },
};

const ROUND_ITEMS: CountItem[] = ["strawberry", "blueberry", "star", "heart", "strawberry"];
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const TRAY_SLOTS = 6;

export function CountGame({ settings, onHome }: { settings: Settings; onHome: () => void }) {
  const [setKey, setSetKey] = useState<SetKey>("little");
  const [round, setRound] = useState(0);
  const [count, setCount] = useState(0);
  const [added, setAdded] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [finished, setFinished] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const chosen = FRIENDS.find((f) => f.kind === settings.friend) ?? FRIENDS[1];
  // Niko is already hosting, so the helper is always a different pal
  const friend = chosen.kind === "niko" ? FRIENDS[1] : chosen;

  const { targets, max } = SETS[setKey];
  const target = targets[round] ?? 1;
  const item = ROUND_ITEMS[round % ROUND_ITEMS.length];
  const info = ITEM_INFO[item];
  const plural = target === 1 ? info.one : info.plural;
  const friendName = friend.name;
  const canSpeak = useMemo(() => typeof window !== "undefined" && "speechSynthesis" in window, []);

  
const speak = useCallback(() => {
  const filename = `count-${String(target).padStart(2, "0")}-${item}.mp3`;
  const recording = new Audio(`${import.meta.env.BASE_URL}audio/${filename}`);

  window.speechSynthesis?.cancel();

  if (voiceRef.current) {
    voiceRef.current.pause();
    voiceRef.current.currentTime = 0;
  }

  voiceRef.current = recording;
  recording.volume = 0.9;
  recording.play().catch(() => {
    // Some devices require a tap before playing audio.
  });
}, [target, item]);


  useEffect(() => {
    if (done) nextRef.current?.focus();
  }, [done]);
  // Automatically read each new counting question aloud.
  useEffect(() => {
    if (done || finished) return;

    speak();

   
return () => {
  if (voiceRef.current) {
    voiceRef.current.pause();
    voiceRef.current.currentTime = 0;
    voiceRef.current = null;
  }
};
}, [speak, done, finished]);

  // stop any spoken instruction when leaving the game
  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const addOne = () => {
    if (done || finished) return;
    if (count >= target) return;
    const n = count + 1;
    setCount(n);
    setAdded((a) => [...a, Date.now() + Math.random()]);
    audio.bloom(n - 1);
    if (n === target) {
      setDone(true);
      window.setTimeout(() => audio.cheer(), 180);
    }
  };

  const undo = () => {
    if (done || count === 0) return;
    setCount((c) => Math.max(0, c - 1));
    setAdded((a) => a.slice(0, -1));
    audio.miss();
  };

  const next = () => {
    if (!done) return;
    if (round + 1 >= targets.length) {
      setFinished(true);
      audio.tada();
      return;
    }
    setRound((r) => r + 1);
    setCount(0);
    setAdded([]);
    setDone(false);
    audio.levelUp();
  };

  const reset = (key: SetKey = setKey) => {
    audio.click();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setSetKey(key);
    setRound(0);
    setCount(0);
    setAdded([]);
    setDone(false);
    setFinished(false);
  };

  const atStart = round === 0 && count === 0 && !done && !finished;
  const completed = round + (done ? 1 : 0);

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-[linear-gradient(#8fd3ff_0%,#c9edff_58%,#eafbe7_100%)]">
      {/* soft meadow backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[8%] top-[6%] h-20 w-20 rounded-full bg-[#ffe066] shadow-[0_0_0_14px_rgba(255,224,102,0.3)]" />
        <div className="absolute left-[6%] top-[22%] h-8 w-24 rounded-full bg-white/80" />
        <div className="absolute left-[15%] top-[24%] h-10 w-14 rounded-full bg-white/80" />
        <div className="absolute right-[12%] top-[30%] h-7 w-20 rounded-full bg-white/70" />
        <div className="absolute -bottom-16 -left-10 h-48 w-[70%] rounded-[50%] bg-[#a6e39b]" />
        <div className="absolute -bottom-20 -right-10 h-52 w-[75%] rounded-[50%] bg-[#79cf72]" />
        <div className="absolute bottom-0 inset-x-0 h-16 bg-[#5fb85a]" />
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
              <span className="rounded-lg bg-[#7c5cff] px-1.5 py-0.5 text-white">Count</span> With Niko
            </h1>
            <p className="text-xs font-semibold text-[#4b5b6b] sm:text-sm">Niko&apos;s Games · no timer, no rush</p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 rounded-full border-2 border-white bg-white/80 px-2 py-1" aria-label={`${completed} of ${targets.length} stars earned`}>
            {targets.map((_, i) => (
              <span key={i} aria-hidden="true" className={`text-base transition-all sm:text-lg ${i < completed ? "scale-110" : "opacity-30 grayscale"}`}>
                ⭐
              </span>
            ))}
          </div>
        </div>

        {finished ? (
          <div className="my-auto flex flex-col items-center py-3">
            <div className="anim-popin w-full max-w-md rounded-[2rem] border-4 border-white bg-white/95 p-5 text-center shadow-[0_12px_0_rgba(59,47,74,0.15)]">
              <div className="anim-floaty flex justify-center">
                <FriendPreview kind="niko" size={118} />
              </div>
              <h2 className="text-3xl font-bold text-[#3b2f4a] sm:text-4xl">You did it!</h2>
              <p className="text-base font-semibold text-[#6b6080] sm:text-lg">
                Niko and {friendName} counted all the way to {max}!
              </p>
              <div className="my-3 flex items-center justify-center gap-1">
                {targets.map((t, i) => (
                  <span key={t} className="anim-popin text-4xl sm:text-5xl" style={{ animationDelay: `${i * 0.12}s` }}>
                    ⭐
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <BigButton color="pink" onClick={() => reset(setKey)} autoFocus className="text-2xl">
                  ↻ Play again
                </BigButton>
                <BigButton color="purple" onClick={() => reset(setKey === "little" ? "big" : "little")}>
                  {setKey === "little" ? "🔢 Try 6–10" : "🔢 Back to 1–5"}
                </BigButton>
                <BigButton color="white" onClick={onHome}>
                  🏠 Home
                </BigButton>
              </div>
              <p className="mt-3 text-xs font-semibold text-[#a79cba]">⭐ Niko&apos;s Games · Starlight Pals ⭐</p>
            </div>
          </div>
        ) : (
          <>
            {/* Niko's request */}
            <div className="rounded-3xl border-4 border-white bg-white/95 p-3 shadow-[0_6px_0_rgba(59,47,74,0.12)]">
              <div className="flex items-center gap-2">
                <div className="relative shrink-0">
                  <div className="anim-floaty">
                    <FriendPreview kind="niko" size={74} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-wider text-[#7c5cff] uppercase">Niko says</p>
                  <p className="text-lg font-bold leading-tight text-[#3b2f4a] sm:text-2xl" aria-live="polite">
                    Put{" "}
                    <span className="inline-block rounded-xl bg-[#ffe9f3] px-2 text-3xl leading-tight text-[#ff4f8f] sm:text-4xl">{target}</span>{" "}
                    {plural} in the basket!
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1" aria-hidden="true">
                    {Array.from({ length: target }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${i < count ? "scale-110 bg-[#ff9f00]" : "bg-[#e6e0f2]"}`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-semibold text-[#8a809a]">({NUMBER_WORDS[target] ?? target})</span>
                  </div>
                </div>
                {canSpeak && (
                  <button
                    type="button"
                    onClick={() => {
                      audio.unlock();
                      speak();
                    }}
                    aria-label={`Hear the instruction: put ${NUMBER_WORDS[target] ?? target} ${plural} in the basket`}
                    className="btn-chunky flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border-4 border-[#e2dafc] bg-[#f6f2ff] text-xl leading-none text-[#3b2f4a]"
                  >
                    <span aria-hidden="true">🔊</span>
                    <span className="mt-0.5 text-[10px] font-bold">Say it</span>
                  </button>
                )}
              </div>
              {atStart && (
                <div className="mt-2 flex items-center justify-center gap-2 border-t-2 border-dashed border-[#eee7fa] pt-2">
                  <span className="text-xs font-bold text-[#8a809a]">Counting:</span>
                  {(["little", "big"] as SetKey[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => reset(k)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                        setKey === k ? "bg-[#7c5cff] text-white" : "bg-[#f6f2ff] text-[#6b6080] hover:bg-[#efeaff]"
                      }`}
                    >
                      {SETS[k].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* basket scene */}
            <div className="relative flex flex-1 items-end justify-center rounded-3xl border-4 border-white bg-[#fffdf5]/80 px-2 pb-2 pt-1">
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-[#6b6080]">
                Round {round + 1} of {targets.length}
              </div>
              <div className="mr-1 hidden shrink-0 sm:block">
                <div className="anim-floaty">
                  <FriendPreview kind={friend.kind} size={86} />
                </div>
              </div>
              <div className="relative w-full max-w-[300px]">
                {/* items sit in the basket */}
                <div className="relative z-10 -mb-2 flex min-h-[58px] flex-wrap items-end justify-center gap-0 px-3">
                  {added.length === 0 ? (
                    <span className="mb-1 rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-[#8a809a]">The basket is empty. Tap below! 👇</span>
                  ) : (
                    added.map((id) => (
                      <span key={id} className="fruit-pop inline-block" aria-hidden="true">
                        <ItemPreview kind={item} size={44} />
                      </span>
                    ))
                  )}
                </div>
                {/* rim + woven basket */}
                <div className="relative">
                  <div className="h-4 rounded-full border-2 border-[#a96a2e] bg-[#e9b877]" />
                  <div className="basket-body relative -mt-1 flex h-[64px] items-end justify-center rounded-b-[2rem] border-2 border-t-0 border-[#a96a2e] pb-2">
                    <span className="text-sm font-bold text-[#7a4b1e]">
                      <span className="hidden sm:inline">Niko&apos;s </span>basket
                    </span>
                    <div className="absolute -right-2 -top-3 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-[#7c5cff] text-2xl font-bold tabular-nums text-white shadow-md" aria-live="polite" aria-label={`${count} in the basket`}>
                      {count}
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-center text-xs font-bold text-[#6b6080] sm:text-sm">
                  {count} {count === 1 ? info.one : info.plural} in the basket
                </p>
              </div>
              <div className="ml-1 sm:hidden">
                <div className="anim-floaty">
                  <FriendPreview kind={friend.kind} size={58} />
                </div>
              </div>
            </div>

            {/* tap tray / celebration */}
            {done ? (
              <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white/95 p-3 text-center shadow-[0_6px_0_rgba(59,47,74,0.12)]">
                <div className="confetti" aria-hidden="true">
                  {Array.from({ length: settings.calm ? 6 : 14 }).map((_, i) => (
                    <span key={i} style={{ left: `${6 + i * 6.6}%`, animationDelay: `${(i % 5) * 0.12}s`, background: ["#ff7ab6", "#ffd23f", "#7be08f", "#7ad7ff", "#a98bff"][i % 5] }} />
                  ))}
                </div>
                <p className="relative text-xl font-bold text-[#22a06b] sm:text-2xl">
                  🎉 {NUMBER_WORDS[target]?.[0]?.toUpperCase() + String(NUMBER_WORDS[target]).slice(1)}! You counted {target} {plural}!
                </p>
                <button
                  ref={nextRef}
                  type="button"
                  onClick={next}
                  className="btn-chunky relative mt-2 inline-flex min-h-[56px] w-full max-w-xs cursor-pointer items-center justify-center rounded-full bg-[#3cc68a] px-6 text-2xl font-bold text-white"
                >
                  {round + 1 >= targets.length ? "See my stars ⭐" : "Next →"}
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border-4 border-white bg-white/95 p-2 shadow-[0_6px_0_rgba(59,47,74,0.12)] sm:p-3">
                <p className="mb-1 text-center text-xs font-bold text-[#8a809a] sm:text-sm">Tap a {info.one} to add one</p>
                <div className="mx-auto grid max-w-md grid-cols-3 gap-1.5 sm:gap-2">
                  {Array.from({ length: TRAY_SLOTS }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={addOne}
                      aria-label={`Add one ${info.one} to the basket`}
                      className="flex min-h-[58px] cursor-pointer items-center justify-center rounded-2xl border-4 border-[#ffe6f0] bg-[#fff7fb] transition-transform active:translate-y-1 active:scale-95 hover:border-[#ffc2da] hover:bg-white sm:min-h-[64px]"
                    >
                      <ItemPreview kind={item} size={52} />
                    </button>
                  ))}
                </div>
                <div className="mt-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={undo}
                    disabled={count === 0}
                    className="cursor-pointer rounded-full px-3 py-1 text-xs font-bold text-[#8a809a] underline disabled:cursor-default disabled:opacity-40"
                  >
                    ↩ Take one out
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
