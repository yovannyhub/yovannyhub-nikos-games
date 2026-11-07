import { useEffect, useRef, useState, type ReactNode } from "react";
import { audio } from "../game/audio";
import { FRIENDS, type ScoreEntry, type Settings } from "../game/types";
import { ScoreTable } from "./ScoreTable";
import { BigButton, Panel, SettingsToggles } from "./ui";

interface Props {
  settings: Settings;
  adventureStars: number[];
  onChange: (s: Partial<Settings>) => void;
  onPlay: (adventure: number) => void;
  scores: ScoreEntry[];
  onClearScores: () => void;
  onResetAdventure: () => void;
}

const TITLE = "Niko's Games";
const TITLE_COLORS = ["#ff7ab6", "#ffb000", "#3cc68a", "#4aa8ff", "#7c5cff"];

export function StartScreen({ settings, adventureStars, onChange, onPlay, scores, onClearScores, onResetAdventure }: Props) {
  const [view, setView] = useState<"main" | "scores" | "grownups">("main");
  const [lauryPlaying, setLauryPlaying] = useState(false);
  const [lauryMessage, setLauryMessage] = useState("");
  const lauryAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    return () => {
      lauryAudioRef.current?.pause();
      lauryAudioRef.current = null;
    };
  }, []);
  const toggleLaury = async () => {
    if (lauryPlaying) {
      lauryAudioRef.current?.pause();
      if (lauryAudioRef.current) lauryAudioRef.current.currentTime = 0;
      setLauryPlaying(false);
      return;
    }
    if (!lauryAudioRef.current) {
      const clip = new Audio(import.meta.env.BASE_URL + "audio/laury-welcome.mp3");
      clip.onended = () => setLauryPlaying(false);
      clip.onerror = () => {
        setLauryPlaying(false);
        setLauryMessage("Laury's welcome recording is coming soon!");
      };
      lauryAudioRef.current = clip;
    }
    try {
      setLauryMessage("");
      lauryAudioRef.current.currentTime = 0;
      await lauryAudioRef.current.play();
      setLauryPlaying(true);
    } catch {
      setLauryPlaying(false);
      setLauryMessage("Laury's welcome recording is coming soon!");
    }
  };
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmResetAdventure, setConfirmResetAdventure] = useState(false);
  const [selectedAdventure, setSelectedAdventure] = useState(0);
  const lastCompleted = adventureStars.reduce((last, value, index) => value > 0 ? index : last, -1);
  const unlockedThrough = Math.min(9, lastCompleted + 1);
  const playableSelection = Math.min(selectedAdventure, unlockedThrough);
  const completedCount = adventureStars.filter(stars => stars > 0).length;
  const nextWorld = adventureStars.findIndex(stars => stars === 0);
  const continueWorld = nextWorld < 0 ? 9 : Math.min(nextWorld, unlockedThrough);

  if (view === "scores") {
    return (
      <Overlay>
        <Panel className="w-full max-w-md">
          <h2 className="mb-1 text-center text-3xl font-bold">🏆 Star Board</h2>
          <p className="mb-3 text-center text-sm font-semibold text-[#8a809a]">Niko&apos;s Games · saved on this device</p>
          <ScoreTable scores={scores} />
          <div className="mt-4 flex flex-col gap-2">
            <BigButton color="purple" onClick={() => setView("main")} autoFocus>
              ← Back
            </BigButton>
            {scores.length > 0 && (
              <button
                type="button"
                className="mt-1 cursor-pointer text-sm font-semibold text-[#9a92a8] underline"
                onClick={() => {
                  if (confirmClear) {
                    onClearScores();
                    setConfirmClear(false);
                  } else setConfirmClear(true);
                }}
              >
                {confirmClear ? "Tap again to clear all scores" : "Clear scores (grown-ups)"}
              </button>
            )}
          </div>
        </Panel>
      </Overlay>
    );
  }

  if (view === "grownups") {
    const worldGuides = [
      ["🌈", "1 · Sunny Meadow", "Match colors by tapping the correct choice."],
      ["🔷", "2 · Ocean World", "Find and tap the matching shape."],
      ["🚀", "3 · Galaxy", "Practice counting in a space-themed activity."],
      ["🐷", "4 · Happy Farm", "Remember and match pictures."],
      ["🦊", "5 · Forest", "Explore feelings and facial expressions."],
      ["🐼", "6 · Bamboo Forest", "Listen to Laury and find the named animal."],
      ["❄️", "7 · Snow World", "Catch matching pictures for water, food, and help."],
      ["☀️", "8 · Savanna", "Match daily routines like waking up and brushing teeth."],
      ["🐉", "9 · Dragon Valley", "Catch the matching animal: cow, duck, or frog."],
      ["🏰", "10 · Magic Kingdom", "A final matching challenge with colors, shapes, and animals."],
    ];
    return (
      <Overlay>
        <Panel className="w-full max-w-2xl">
          <div className="text-center">
            <p className="text-sm font-bold text-[#7c5cff]">A GUIDE FOR PARENTS & CAREGIVERS</p>
            <h2 className="mt-1 text-3xl font-extrabold text-[#48316e]">👋 Welcome, grown-ups!</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[#6b6080]">Niko's Great Adventure is a gentle, replayable journey through 10 learning worlds. Play alongside your child, celebrate trying, and go at their pace.</p>
          </div>
          <section className="mt-5 rounded-2xl border-2 border-[#e4d6ff] bg-gradient-to-br from-[#f7f1ff] to-[#fff5fb] p-4 text-[#4a3f5c] sm:p-5" aria-labelledby="meet-laury-heading">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-[#e6d8ff] text-5xl shadow-sm" role="img" aria-label="Illustrated avatar placeholder for Laury">👩‍🏫</div>
              <div>
                <h3 id="meet-laury-heading" className="text-xl font-extrabold text-[#48316e]">💜 Meet Laury</h3>
                <p className="text-sm font-bold text-[#71509d]">Teacher Assistant · 17 Years in Education</p>
                <p className="text-xs font-semibold text-[#80708e]">Frisco, Texas</p>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-sm leading-relaxed sm:text-base">
              <p>Laury is an experienced teacher assistant working in Frisco, Texas. For 17 years, she has supported students from kindergarten through 12th grade, including children receiving special education services.</p>
              <p>What she enjoys most is helping students understand their school materials and seeing the happiness that comes with their progress.</p>
              <p>As Niko's friendly learning guide, Laury welcomes children into each adventure with a warm, encouraging voice. She believes in patience, kindness, and giving every child room to learn at their own pace.</p>
            </div>
            <blockquote className="mt-3 rounded-xl bg-white/85 p-3 text-sm italic leading-relaxed text-[#634e7b]">“One of the most rewarding parts of my work is seeing children make progress and how happy they become when they discover what they can do.” <span className="not-italic font-semibold">— A message inspired by Laury's motivation</span></blockquote>
          </section>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#4a3f5c] sm:text-base">
            <section className="rounded-2xl bg-[#f6f2ff] p-4">
              <h3 className="mb-2 text-lg font-extrabold text-[#48316e]">🗺️ Explore the 10 worlds</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {worldGuides.map(([icon, title, description]) => (
                  <div key={title} className="rounded-xl bg-white/85 p-3">
                    <p className="font-extrabold text-[#48316e]">{icon} {title}</p>
                    <p className="mt-1 text-sm text-[#665a75]">{description}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl bg-[#eef6ff] p-4">
              <h3 className="mb-2 text-lg font-extrabold text-[#315c8e]">🎮 How to play</h3>
              <p>Choose an unlocked world on the home screen and tap <b>Play World</b>. For matching activities, tap the answer. For catching activities, move left and right by touching and sliding on a phone or tablet, or using the arrow keys or A/D on a computer.</p>
              <p className="mt-2">Laury's prerecorded voice introduces each world. Use <b>Hear Laury Again</b> when available to repeat the instructions. Children can retry worlds as often as they wish.</p>
            </section>
            <section className="rounded-2xl bg-[#effaf4] p-4">
              <h3 className="mb-2 text-lg font-extrabold text-[#26734e]">⭐ Stars and progress</h3>
              <p>Completing a world earns <b>1–3 stars</b> based on points and unlocks the next world. The best stars earned in each world are saved on this device. Use <b>Continue Adventure</b> to pick up where your child left off, or replay a favorite world.</p>
              <p className="mt-2">The <b>Star Board</b> stores scores locally on this device. Progress and scores are separate: resetting the adventure below does not clear the Star Board.</p>
            </section>
            <section className="rounded-2xl bg-[#fff7e5] p-4">
              <h3 className="mb-2 text-lg font-extrabold text-[#795514]">🌙 Make play comfortable</h3>
              <p><b>Quiet</b> removes background music and game effects while keeping spoken guidance. <b>Music</b> and <b>Sounds</b> offer more audio control. <b>Calm</b> reduces decorative movement and celebration effects; <b>Slow</b> slows falling objects in catching worlds.</p>
              <p className="mt-2">Adjust settings on the home screen or when paused. They are remembered on this device. Take breaks whenever needed, and try playing together if your child wants extra support.</p>
            </section>
            <section className="rounded-2xl bg-[#fff1f5] p-4">
              <h3 className="mb-2 text-lg font-extrabold text-[#8d3f62]">💛 A note for families</h3>
              <p>Every child learns differently. There is no need to rush, chase high scores, or finish every world in one sitting. Niko's Games supports playful practice; it is <b>not a medical treatment, diagnostic tool, or replacement for professional therapy</b>.</p>
            </section>
          </div>
          <button type="button" className="mt-5 w-full rounded-2xl border-2 border-[#d6c4f5] bg-[#f7f0ff] px-3 py-3 text-sm font-bold text-[#65428c]" onClick={() => { if (confirmResetAdventure) { onResetAdventure(); setSelectedAdventure(0); setConfirmResetAdventure(false); setView("main"); } else setConfirmResetAdventure(true); }}>{confirmResetAdventure ? "Confirm: reset stars and unlocks (keep Star Board)" : "🔄 Reset adventure progress (grown-ups)"}</button>
          <BigButton color="purple" className="mt-4 w-full" onClick={() => setView("main")} autoFocus>
            ← Back to adventure
          </BigButton>
        </Panel>
      </Overlay>
    );
  }

  return (
    <Overlay>
      <div className="flex w-full max-w-5xl flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <span className="rounded-full border-2 border-white bg-[#7c5cff] px-3 py-0.5 text-xs font-bold tracking-[0.18em] text-white uppercase">
            ⭐ Welcome to Niko's world ⭐
          </span>
          <h1 className="anim-floaty whitespace-nowrap text-center text-[2.7rem] font-bold leading-none drop-shadow-[0_4px_0_rgba(59,47,74,0.25)] sm:text-6xl" aria-label={TITLE}>
            {TITLE.split("").map((ch, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="inline-block"
                style={{ color: ch === " " ? undefined : TITLE_COLORS[i % TITLE_COLORS.length], WebkitTextStroke: "2px white", paintOrder: "stroke fill" }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="rounded-full bg-[#ff7ab6] px-3 py-1 text-sm font-bold text-white shadow-sm sm:text-base">🌈 Play · Count · Explore</span>
            <span className="text-sm font-semibold text-[#3b2f4a] sm:text-base">gentle games for little hands</span>
          </div>
        </div>

        <section className="w-full rounded-[2rem] border-4 border-white/80 bg-white/90 p-3 shadow-xl sm:p-6">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-extrabold text-[#48316e] sm:text-3xl">🗺️ Niko's Great Adventure</h2>
            <p className="text-sm font-semibold text-[#74618c]">Explore 10 magical worlds with Niko's friends!</p>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-[#d9c8ff] bg-gradient-to-b from-[#c9e9ff] via-[#f3e4ff] to-[#dcf6d3] p-3 sm:p-7">
            <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" style={{backgroundImage:"radial-gradient(circle at 20% 16%, #fff 0 9px, transparent 10px), radial-gradient(circle at 78% 38%, #fff 0 12px, transparent 13px), radial-gradient(circle at 22% 75%, #fff 0 10px, transparent 11px)"}} />
            <div className="relative grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-5 sm:gap-x-5 sm:gap-y-8" role="radiogroup" aria-label="Choose an adventure world">
              {[
                { icon: "🐱", title: "Color Match", world: "Sunny Meadow", color: "#ffe4a8" },
                { icon: "🐠", title: "Shape Finder", world: "Ocean World", color: "#b8e9ff" },
                { icon: "👽", title: "Counting Fun", world: "Galaxy", color: "#d8caff" },
                { icon: "🐷", title: "Memory Match", world: "Happy Farm", color: "#ffd2e1" },
                { icon: "🦊", title: "Feelings & Faces", world: "Forest", color: "#c8edc3" },
                { icon: "🐼", title: "Listen & Choose", world: "Bamboo", color: "#d4f1bd" },
                { icon: "🐧", title: "Let's Communicate", world: "Snow World", color: "#d9f3ff" },
                { icon: "🦁", title: "My Daily Routine", world: "Savanna", color: "#ffe4b6" },
                { icon: "🐉", title: "Animal Friends", world: "Dragon World", color: "#e1d0ff" },
                { icon: "🦄", title: "Big Challenge", world: "Magic World", color: "#ffd6f2" },
              ].map((adventure, index) => {
                const selected = playableSelection === index;
                const unlocked = index <= unlockedThrough;
                return (
                  <button
                    key={adventure.title}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={!unlocked}
                    aria-label={`World ${index + 1}: ${adventure.title}, ${adventure.world}, ${adventureStars[index] || 0} of 3 stars earned${unlocked ? "" : ", locked"}`}
                    onClick={() => {
                      setSelectedAdventure(index);
                      onChange({ mode: "relaxed", friend: index === 1 ? "fish" : "kitty" });
                      audio.unlock();
                      audio.click();
                    }}
                    className={`relative z-10 flex min-h-[140px] flex-col items-center justify-center rounded-[1.5rem] border-[3px] p-2 text-center shadow-md transition-transform hover:-translate-y-1 sm:min-h-[155px] ${selected ? "border-[#7750f7] ring-4 ring-[#ac94ff] scale-[1.03]" : unlocked ? "border-white" : "border-[#e2cfff] shadow-sm"}`}
                    style={{backgroundColor:adventure.color}}
                  >
                    <span className="absolute left-2 top-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-extrabold text-[#58436d]">{index + 1}</span>
                    <span className="text-5xl drop-shadow-sm sm:text-6xl" aria-hidden="true">{adventure.icon}</span>
                    <span className="mt-1 text-sm font-extrabold leading-tight text-[#3b2f4a]">{adventure.title}</span>
                    <span className="text-[11px] font-semibold text-[#695a7a]">{adventure.world}</span>
                    {(adventureStars[index] || 0) > 0 && <span className="absolute right-2 top-1 rounded-full bg-white px-1.5 py-0.5 text-sm font-extrabold text-[#24845b]" aria-label="Completed">✓</span>}
                    {!unlocked && <span className="absolute right-2 top-1 rounded-full bg-white px-1.5 py-0.5 text-sm" aria-hidden="true">🔒</span>}
                    <span className="mt-1 text-base font-extrabold tracking-wide" aria-hidden="true">{Array.from({ length: 3 }, (_, star) => star < (adventureStars[index] || 0) ? "⭐" : "☆").join("")}</span>
                    {selected && <span className="mt-1 rounded-full bg-[#7750f7] px-2 py-0.5 text-[10px] font-bold text-white">SELECTED ✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mx-auto mt-4 flex max-w-xl flex-col items-center gap-3">
            <p className="text-center text-sm font-bold text-[#655478]">🔓 {unlockedThrough + 1} of 10 worlds unlocked · Finish a world to open the next!</p>
            {completedCount > 0 && <BigButton color="green" onClick={() => onPlay(continueWorld)} className="w-full py-3 text-xl" ariaLabel={completedCount === 10 ? "Replay final world" : `Continue adventure at world ${continueWorld + 1}`}>
              {completedCount === 10 ? "🌟 Replay the Final World" : `✨ Continue Adventure · World ${continueWorld + 1}`}
            </BigButton>}
            <BigButton color="pink" onClick={() => onPlay(playableSelection)} className="w-full py-4 text-2xl" ariaLabel={`Play world ${playableSelection + 1}`}>
              ▶ Play World {playableSelection + 1}!
            </BigButton>
          </div>
        </section>

        <Panel className="w-full !p-3">
          <SettingsToggles settings={settings} onChange={onChange} />
          <div className="mt-2 grid grid-cols-3 gap-2">
            <BigButton color="yellow" className="!min-h-[48px] !text-lg" onClick={() => setView("scores")}>
              🏆 Star Board
            </BigButton>
            <BigButton color="white" className="!min-h-[48px] !text-lg" onClick={() => setView("grownups")}>
              👋 Grown-ups
            </BigButton>
            <BigButton color="green" className="!min-h-[48px] !text-sm sm:!text-lg" onClick={toggleLaury} ariaLabel={lauryPlaying ? "Stop Laury's welcome" : "Meet Laury, play welcome audio"}>
              {lauryPlaying ? "⏹ Stop Laury" : "🔊 Meet Laury"}
            </BigButton>
          </div>
          {lauryMessage && <p className="mt-2 text-center text-sm font-semibold text-[#71509d]" role="status">{lauryMessage}</p>}
        </Panel>
      </div>
    </Overlay>
  );
}

export function Overlay({ children, dim = false }: { children: ReactNode; dim?: boolean }) {
  return (
    <div
      className={`absolute inset-0 z-20 flex justify-center overflow-y-auto px-4 py-6 ${dim ? "bg-[#3b2f4a]/35" : ""}`}
      style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))", paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="my-auto flex min-w-0 w-full justify-center">{children}</div>
    </div>
  );
}
