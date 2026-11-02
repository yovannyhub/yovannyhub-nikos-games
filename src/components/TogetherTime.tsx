import { useCallback, useEffect, useRef, useState } from "react";
import { audio } from "../game/audio";
import { FRIENDS, type FriendInfo, type Settings } from "../game/types";
import { FriendPreview } from "./FriendPreview";
import { BigButton } from "./ui";

type Who = "child" | "buddy";
type Partner = "niko" | "grownup";
type Phase = "intro" | "handoff" | "spin" | "rolling" | "hop" | "celebrate";

/** 12 places: 0 = home, 11 = picnic. The path snakes through a 4 x 3 board. */
export const TOTAL_PLACES = 12;
export const GOAL = TOTAL_PLACES - 1;

/** Board position for a place index, snaking left-right, right-left, left-right. */
export function snakeCell(index: number): { row: number; col: number } {
  const row = Math.floor(index / 4);
  const within = index % 4;
  return { row: row + 1, col: row % 2 === 0 ? within + 1 : 4 - within };
}

export function nextPosition(from: number, roll: number): number {
  return Math.min(GOAL, from + roll);
}

const SLEEP = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

const PARTNER_PAL: Record<Partner, FriendInfo> = {
  niko: FRIENDS.find((f) => f.kind === "niko") ?? FRIENDS[0],
  grownup: FRIENDS.find((f) => f.kind === "bear") ?? FRIENDS[2],
};

export function TogetherTime({ settings, onHome }: { settings: Settings; onHome: () => void }) {
  const [partner, setPartner] = useState<Partner>("niko");
  const [phase, setPhase] = useState<Phase>("intro");
  const [who, setWho] = useState<Who>("child");
  const [roll, setRoll] = useState(0);
  const [pos, setPos] = useState<{ child: number; buddy: number }>({ child: 0, buddy: 0 });
  const [turns, setTurns] = useState(0);
  const [nikoThinking, setNikoThinking] = useState(false);
  const alive = useRef(true);
  const busy = useRef(false);
  const posRef = useRef({ child: 0, buddy: 0 });
  const partnerRef = useRef<Partner>("niko");
  const handoffRef = useRef<HTMLButtonElement>(null);
  const spinRef = useRef<HTMLButtonElement>(null);
  const againRef = useRef<HTMLButtonElement>(null);

  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

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

  const childPal = FRIENDS.find((f) => f.kind === settings.friend && f.kind !== "niko") ?? FRIENDS[1];
  const buddyPal = partner === "niko" ? PARTNER_PAL.niko : PARTNER_PAL.grownup;
  const childName = settings.playerName.trim() || "You";
  const buddyName = partner === "niko" ? "Niko" : "Grown-up";
  const activeName = who === "child" ? childName : buddyName;

  const sleep = useCallback(async (ms: number) => {
    await SLEEP(ms);
    return alive.current;
  }, []);

  const setPosition = (player: Who, value: number) => {
    posRef.current = { ...posRef.current, [player]: value };
    setPos(posRef.current);
  };

  const announce = useCallback(
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

  const speakStatus = () => {
    audio.unlock();
    if (phase === "celebrate") announce("Together time! You both made it to the picnic!");
    else if (phase === "handoff") announce(`It is ${activeName}'s turn. Tap the big button when you are ready.`);
    else if (phase === "spin") announce(`${activeName}, tap the spinner.`);
    else if (phase === "rolling" || phase === "hop") announce(`${activeName} is moving. Let's watch.`);
    else announce("Together Time. A picnic walk for two. Tap start.");
  };

  const nextTurn = useCallback(
    async (prev: Who) => {
      if (!alive.current) return;
      const other: Who = prev === "child" ? "buddy" : "child";
      if (posRef.current.child >= GOAL && posRef.current.buddy >= GOAL) {
        busy.current = false;
        setPhase("celebrate");
        audio.tada();
        return;
      }
      const next: Who = posRef.current[other] < GOAL ? other : prev;
      await sleep(420);
      if (!alive.current) return;
      setWho(next);
      setRoll(0);
      busy.current = false;
      if (partnerRef.current === "niko" && next === "buddy") {
        // Niko takes his own turn: a visible "choosing" beat, then he spins himself.
        setNikoThinking(true);
        setPhase("spin");
        await sleep(1100);
        if (!alive.current) return;
        setNikoThinking(false);
        void doRoll("buddy");
      } else {
        setNikoThinking(false);
        setPhase("handoff");
      }
    },
    [sleep],
  );

  const doRoll = useCallback(
    async (player: Who) => {
      if (busy.current || !alive.current) return;
      busy.current = true;
      audio.unlock();
      setWho(player);
      setPhase("rolling");
      setTurns((t) => t + 1);
      // friendly shuffle of dots, then the real result
      for (let i = 0; i < 7; i++) {
        setRoll(1 + ((i * 7 + 1) % 3));
        audio.click();
        const ok = await sleep(85);
        if (!ok) return;
      }
      const result = 1 + Math.floor(Math.random() * 3);
      setRoll(result);
      audio.catch(result);
      const ok = await sleep(520);
      if (!ok) return;
      setPhase("hop");
      const from = posRef.current[player];
      const target = nextPosition(from, result);
      for (let p = from + 1; p <= target; p++) {
        const inside = await sleep(260);
        if (!inside) return;
        setPosition(player, p);
        audio.bloom(p);
      }
      await sleep(260);
      if (!alive.current) return;
      await nextTurn(player);
    },
    [nextTurn, sleep],
  );

  const startGame = (p: Partner = partner) => {
    audio.unlock();
    audio.levelUp();
    partnerRef.current = p;
    posRef.current = { child: 0, buddy: 0 };
    busy.current = false;
    setPartner(p);
    setPos({ child: 0, buddy: 0 });
    setRoll(0);
    setTurns(0);
    setNikoThinking(false);
    setWho("child");
    setPhase("handoff");
  };

  const restart = () => {
    audio.click();
    startGame(partner);
  };

  useEffect(() => {
    if (phase === "handoff") handoffRef.current?.focus();
    else if (phase === "spin") spinRef.current?.focus();
    else if (phase === "celebrate") againRef.current?.focus();
  }, [phase, who]);

  const atGoal = (p: number) => p >= GOAL;
  const stonesLeft = Math.max(0, GOAL - Math.min(pos.child, pos.buddy));

  return (
    <div className={`absolute inset-0 z-20 flex flex-col overflow-y-auto bg-[linear-gradient(#b9f0ff_0%,#eafff4_55%,#fff5dc_100%)] ${settings.calm ? "calm" : ""}`}>
      {/* meadow backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[6%] top-[4%] h-20 w-20 rounded-full bg-[#ffe066] shadow-[0_0_0_14px_rgba(255,224,102,0.3)]" />
        <div className="absolute left-[4%] top-[13%] h-8 w-24 rounded-full bg-white/80" />
        <div className="absolute left-[14%] top-[15%] h-9 w-14 rounded-full bg-white/80" />
        <div className="absolute right-[16%] top-[20%] h-7 w-20 rounded-full bg-white/70" />
        <div className="absolute -bottom-28 -left-12 h-64 w-[85%] rounded-[50%] bg-[#c9edb9]" />
        <div className="absolute -bottom-32 -right-12 h-68 w-[90%] rounded-[50%] bg-[#a8e39a]" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-[#8ad47e]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-lg flex-col gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
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
            <h1 className="truncate text-xl font-bold leading-none text-[#3b2f4a] sm:text-2xl">
              <span className="rounded-lg bg-[#ff7ab6] px-1.5 py-0.5 text-white">Together</span> Time
            </h1>
            <p className="text-xs font-semibold text-[#4b5b6b] sm:text-sm">Niko&apos;s Games · a picnic walk for two</p>
          </div>
          {phase !== "intro" && canSpeak && (
            <button
              type="button"
              onClick={speakStatus}
              aria-label="Hear whose turn it is"
              className="btn-chunky flex h-12 w-12 shrink-0 cursor-pointer flex-col items-center justify-center rounded-full border-4 border-white bg-[#f6f2ff] text-lg leading-none text-[#3b2f4a]"
            >
              <span aria-hidden="true">🔊</span>
              <span className="mt-0.5 text-[9px] font-bold">Say it</span>
            </button>
          )}
        </div>

        {phase === "intro" ? (
          <div className="my-auto flex flex-col items-center py-3">
            <div className="anim-popin w-full rounded-[2rem] border-4 border-white bg-white/95 p-4 text-center shadow-[0_12px_0_rgba(59,47,74,0.15)] sm:p-5">
              <div className="flex items-end justify-center gap-1">
                <span className="anim-floaty -mr-3">
                  <FriendPreview kind={childPal.kind} size={92} />
                </span>
                <span className="text-3xl" aria-hidden="true">🤝</span>
                <span className="anim-floaty -ml-3" style={{ animationDelay: "0.4s" }}>
                  <FriendPreview kind={buddyPal.kind} size={92} />
                </span>
              </div>
              <h2 className="mt-1 text-3xl font-bold text-[#3b2f4a] sm:text-4xl">A picnic for two!</h2>
              <p className="mx-auto max-w-sm text-base font-semibold leading-snug text-[#6b6080] sm:text-lg">
                Take turns to spin, hop your pal along the stones, and reach the picnic together. Everyone wins when both friends arrive.
              </p>
              <div className="mt-3 text-left">
                <p className="mb-1 text-center text-sm font-bold text-[#8a809a]">Who would you like to play with?</p>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Choose your partner">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={partner === "niko"}
                    onClick={() => {
                      setPartner("niko");
                      audio.catch(1);
                    }}
                    className={`flex cursor-pointer flex-col items-center rounded-2xl border-4 px-2 py-2 transition-all ${
                      partner === "niko" ? "border-[#ffb000] bg-[#fff8e1]" : "border-transparent bg-[#f6f2ff] hover:bg-[#fff8e1]"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">🦊</span>
                    <span className="text-base font-bold">Play with Niko</span>
                    <span className="text-xs font-medium leading-tight text-[#6b6080]">Niko takes his own turn</span>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={partner === "grownup"}
                    onClick={() => {
                      setPartner("grownup");
                      audio.catch(3);
                    }}
                    className={`flex cursor-pointer flex-col items-center rounded-2xl border-4 px-2 py-2 transition-all ${
                      partner === "grownup" ? "border-[#7c5cff] bg-[#efeaff]" : "border-transparent bg-[#f6f2ff] hover:bg-[#efeaff]"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">🧑‍🤝‍🧑</span>
                    <span className="text-base font-bold">Play with a grown-up</span>
                    <span className="text-xs font-medium leading-tight text-[#6b6080]">Pass the device, take turns</span>
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <BigButton color="pink" onClick={() => startGame(partner)} className="py-4 text-2xl" ariaLabel="Start Together Time">
                  ▶ Start our walk
                </BigButton>
                <BigButton color="white" onClick={onHome}>
                  🏠 Home
                </BigButton>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#6b6080]">No scores, no losing, and no timer. Take all the pauses you need. 💛</p>
              <p className="mt-1 text-xs font-semibold text-[#a79cba]">⭐ Niko&apos;s Games · gentle play for little hands ⭐</p>
            </div>
          </div>
        ) : (
          <>
            {/* turn banner */}
            <div
              className={`rounded-3xl border-4 border-white p-3 shadow-[0_6px_0_rgba(59,47,74,0.12)] ${
                who === "child" ? "bg-[#fff0f7]" : "bg-[#efeaff]"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white text-2xl ${who === "child" ? "bg-[#ff7ab6]" : "bg-[#7c5cff]"}`} aria-hidden="true">
                  {who === "child" ? "👆" : "👉"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: who === "child" ? "#e5457f" : "#6a4ce0" }}>
                    {phase === "rolling" || phase === "hop" ? "Watch the walk" : nikoThinking ? "Niko's turn" : "Turn"}
                  </p>
                  <p className="truncate text-xl font-bold leading-tight text-[#3b2f4a] sm:text-2xl" aria-live="polite">
                    {phase === "celebrate"
                      ? "Together Time!"
                      : phase === "hop"
                        ? `${activeName} is hopping…`
                        : phase === "rolling"
                          ? `${activeName} is spinning…`
                          : who === "child"
                            ? `Your turn, ${childName}!`
                            : `${buddyName}'s turn!`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/80 px-2 py-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`h-3 w-3 rounded-full transition-all ${i < roll ? "scale-110 bg-[#ffb000]" : "bg-[#e6e0f2]"}`}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="ml-1 text-sm font-bold tabular-nums text-[#6b6080]">{roll || "–"}</span>
                </div>
              </div>

              {phase === "handoff" && (
                <div className="mt-2">
                  <p className="mb-1 text-center text-sm font-semibold text-[#6b6080]">
                    {who === "child" ? (
                      <>Big tap when you&apos;re ready. {buddyName} is waiting. 💛</>
                    ) : partner === "niko" ? (
                      <>Niko is getting ready… 🦊</>
                    ) : (
                      <>Pass the device to your grown-up. Waiting is practising patience! 💜</>
                    )}
                  </p>
                  <button
                    ref={handoffRef}
                    type="button"
                    onClick={() => {
                      audio.unlock();
                      audio.cheer();
                      setPhase("spin");
                    }}
                    className={`btn-chunky flex min-h-[64px] w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-2xl font-bold text-white ${
                      who === "child" ? "bg-[#ff7ab6]" : "bg-[#7c5cff]"
                    }`}
                  >
                    {who === "child" ? "This is me — my turn! 👆" : `${buddyName}'s turn — tap here 👆`}
                  </button>
                </div>
              )}

              {(phase === "spin" || phase === "rolling") && (
                <div className="mt-2 flex items-center justify-center gap-3">
                  <button
                    ref={spinRef}
                    type="button"
                    disabled={phase === "rolling" || nikoThinking}
                    onClick={() => {
                      audio.unlock();
                      void doRoll(who);
                    }}
                    aria-label={phase === "rolling" ? "Spinning" : nikoThinking ? "Niko is choosing" : "Spin to see how many steps"}
                    className={`relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-full border-[6px] border-white text-white shadow-[0_7px_0_rgba(59,47,74,0.2)] transition-transform active:translate-y-1 disabled:cursor-wait ${
                      who === "child" ? "bg-[#ff7ab6]" : "bg-[#7c5cff]"
                    } ${phase === "rolling" ? "animate-spin-slow" : "anim-wiggle"}`}
                  >
                    <span className="text-3xl font-bold tabular-nums" aria-hidden="true">{roll || "🎲"}</span>
                  </button>
                  <div className="min-w-0">
                    <p className="text-lg font-bold leading-tight text-[#3b2f4a] sm:text-xl">
                      {nikoThinking ? "Niko is choosing… 🦊" : phase === "rolling" ? "Round and round…" : "Tap to spin!"}
                    </p>
                    <p className="text-sm font-semibold text-[#6b6080]">Then hop 1, 2 or 3 stones.</p>
                  </div>
                </div>
              )}

              {phase === "hop" && (
                <p className="mt-2 text-center text-xl font-bold text-[#3b2f4a]">Hop, hop, hop! 🦘</p>
              )}
            </div>

            {/* board */}
            <div className="relative flex-1 rounded-[1.6rem] border-4 border-white bg-[#fffdf5]/90 p-2 shadow-[0_6px_0_rgba(59,47,74,0.1)]">
              <div className="mb-1 flex items-center justify-between px-1 text-xs font-bold text-[#6b6080]">
                <span>🏠 Home</span>
                <span>{stonesLeft === 0 ? "Picnic! 🧺" : `${stonesLeft} more stones to the picnic`}</span>
                <span>🧺 Picnic</span>
              </div>
              <div className="relative grid grid-cols-4 grid-rows-3 gap-1.5 sm:gap-2">
                {Array.from({ length: TOTAL_PLACES }).map((_, index) => {
                  const cell = snakeCell(index);
                  const isStart = index === 0;
                  const isGoal = index === GOAL;
                  const childHere = pos.child === index;
                  const buddyHere = pos.buddy === index;
                  const both = childHere && buddyHere;
                  const activeHere = who === "child" ? childHere : buddyHere;
                  return (
                    <div
                      key={index}
                      style={{ gridColumn: cell.col, gridRow: cell.row }}
                      className={`relative flex min-h-[64px] flex-col items-center justify-center rounded-2xl border-[3px] p-1 transition-all sm:min-h-[74px] ${
                        isGoal
                          ? "border-[#ffb000] bg-[#fff6d6]"
                          : isStart
                            ? "border-[#e2dafc] bg-white"
                            : "border-[#dff3d6] bg-[#eefbe7]"
                      } ${activeHere && (phase === "handoff" || phase === "spin") ? "ring-4 ring-[#ff7ab6]/50" : ""}`}
                    >
                      <span className={`text-[11px] font-bold leading-none ${isGoal ? "text-[#a96a00]" : "text-[#7fa87a]"}`}>
                        {isStart ? "START" : isGoal ? "PICNIC" : `STONE ${index}`}
                      </span>
                      <span className={`leading-none ${isGoal ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"}`} aria-hidden="true">
                        {isStart ? "🏠" : isGoal ? "🧺" : index % 3 === 0 ? "🌼" : index % 3 === 1 ? "🍄" : "🌿"}
                      </span>
                      <div className="flex h-[30px] items-end justify-center gap-0.5">
                        {childHere && (
                          <span key={`c${pos.child}`} className="token-hop">
                            <FriendPreview kind={childPal.kind} size={both ? 26 : 32} />
                          </span>
                        )}
                        {buddyHere && (
                          <span key={`b${pos.buddy}`} className="token-hop">
                            <FriendPreview kind={buddyPal.kind} size={both ? 26 : 32} />
                          </span>
                        )}
                      </div>
                      {isGoal && <span className="absolute -right-1 -top-1 text-sm" aria-hidden="true">⭐</span>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-1.5 flex items-center justify-center gap-3 rounded-full bg-white/80 px-2 py-1 text-xs font-bold text-[#4b5b6b]">
                <span className="flex items-center gap-1"><FriendPreview kind={childPal.kind} size={22} /> {childName}</span>
                <span className="flex items-center gap-1"><FriendPreview kind={buddyPal.kind} size={22} /> {buddyName}</span>
                {atGoal(pos.child) && <span className="text-[#22a06b]">✓ at picnic</span>}
              </div>
            </div>

            {phase !== "celebrate" ? (
              <div className="rounded-3xl border-4 border-white bg-white/95 p-2 text-center shadow-[0_6px_0_rgba(59,47,74,0.12)]">
                <p className="text-sm font-semibold text-[#6b6080]">
                  Turns taken: <b>{turns}</b> · Take all the time you need · Both friends win together 🤝
                </p>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white/95 p-3 text-center shadow-[0_6px_0_rgba(59,47,74,0.12)]">
                <div className="confetti" aria-hidden="true">
                  {Array.from({ length: settings.calm ? 6 : 18 }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        left: `${4 + i * 5.2}%`,
                        animationDelay: `${(i % 6) * 0.1}s`,
                        background: ["#ff7ab6", "#ffd23f", "#7be08f", "#7ad7ff", "#a98bff"][i % 5],
                      }}
                    />
                  ))}
                </div>
                <div className="relative flex items-end justify-center gap-1">
                  <span className="anim-floaty text-5xl" aria-hidden="true">🧺</span>
                  <FriendPreview kind={childPal.kind} size={78} />
                  <FriendPreview kind={buddyPal.kind} size={78} />
                </div>
                <h2 className="relative mt-1 text-2xl font-bold text-[#3b2f4a] sm:text-3xl">Together Time!</h2>
                <p className="relative text-base font-semibold text-[#6b6080] sm:text-lg">
                  {childName} and {buddyName} reached the picnic together. You make a great team! 🎉
                </p>
                <div className="relative mt-2 flex flex-col gap-2">
                  <button
                    ref={againRef}
                    type="button"
                    onClick={restart}
                    className="btn-chunky inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-full bg-[#3cc68a] px-6 text-2xl font-bold text-white"
                  >
                    ↻ Walk again
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <BigButton color="purple" onClick={() => setPhase("intro")} className="!min-h-[48px] !text-base">
                      🤝 Change partner
                    </BigButton>
                    <BigButton color="white" onClick={onHome} className="!min-h-[48px] !text-base">
                      🏠 Home
                    </BigButton>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
