import { useState, type ReactNode } from "react";
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
    return (
      <Overlay>
        <Panel className="w-full max-w-md">
          <h2 className="mb-1 text-center text-2xl font-bold">👋 For grown-ups</h2>
          <p className="mb-3 text-center text-sm font-semibold text-[#8a809a]">Niko&apos;s Games · made for little hands and busy minds</p>
          <div className="space-y-4 text-sm leading-relaxed text-[#4a3f5c] sm:text-base">
            <section className="rounded-2xl bg-[#f6f2ff] p-4">
              <h3 className="mb-2 text-lg font-extrabold text-[#48316e]">🎮 How to play today</h3>
              <p>Choose an unlocked world on the home screen, then tap <b>Play World</b>. <b>World 1 — Color Match</b> is a tap-to-match activity with 10 colors to find and no timer. Worlds 2–10 currently use the catching activity: move Niko's friend left and right to catch matching falling objects in a round of about <b>90 seconds</b>. Each world has its own theme, song and spoken introduction.</p>
              <p className="mt-2">In World 1, tap a matching color choice. In Worlds 2–10, touch and slide to move on a phone or tablet; on a computer, use the left/right arrow keys or A/D. Tap <b>Hear Laury Again</b> during a round to repeat the introduction.</p>
            </section>
            <section className="rounded-2xl bg-[#effaf4] p-4">
              <h3 className="mb-2 text-lg font-extrabold text-[#26734e]">⭐ Stars and unlocking worlds</h3>
              <p>Finishing a world earns <b>1 to 3 stars</b> based on points. World 1 awards points for correct matches; other worlds award points for catches. Even a low score earns a star. Completing a world unlocks the next one. Your best star result for each world stays saved on this device.</p>
              <p className="mt-2">After a round, choose <b>Next World</b>, <b>Play Again</b>, or <b>Home</b>. The home screen also offers <b>Continue Adventure</b> once a world has been completed.</p>
            </section>
            <section className="rounded-2xl bg-[#fff7e5] p-4">
              <h3 className="mb-2 text-lg font-extrabold text-[#795514]">🌙 Sensory-friendly choices</h3>
              <p><b>Quiet</b> turns off music and game effects while keeping Laury's recorded instructions. <b>Music</b> controls world songs. <b>Sounds</b> controls effects and the Laury instruction button. <b>Calm</b> reduces decorative movement and celebration effects. <b>Slow</b> slows the falling objects.</p>
              <p className="mt-2">You can change these options on the home screen or while paused. They are remembered on this device. If your child needs a break, use the pause button during play.</p>
            </section>
            <section className="rounded-2xl bg-[#eef6ff] p-4">
              <h3 className="mb-2 text-lg font-extrabold text-[#315c8e]">👨‍👩‍👧 Helpful notes for parents</h3>
              <p>Children can repeat worlds as often as they like. Encourage exploration rather than focusing on points. For very young children, play together and demonstrate sliding left and right.</p>
              <p className="mt-2">The <b>Star Board</b> stores local scores. <b>Reset adventure progress</b> below clears earned stars and world unlocks, but keeps the Star Board. The reset requires confirmation.</p>
              <p className="mt-2">The world names preview future learning themes. World 1 now has its own color-matching activity. Dedicated shape, counting, memory, feelings and communication activities for the other worlds are still planned. Niko's Games is educational play, not a medical treatment or therapy.</p>
            </section>
          </div>
          <button type="button" className="mt-4 w-full rounded-2xl border-2 border-[#d6c4f5] bg-[#f7f0ff] px-3 py-3 text-sm font-bold text-[#65428c]" onClick={() => { if (confirmResetAdventure) { onResetAdventure(); setSelectedAdventure(0); setConfirmResetAdventure(false); setView("main"); } else setConfirmResetAdventure(true); }}>{confirmResetAdventure ? "Confirm: reset stars and unlocks (keep Star Board)" : "🔄 Reset adventure progress (grown-ups)"}</button>
          <BigButton color="purple" className="mt-4 w-full" onClick={() => setView("main")} autoFocus>
            ← Back
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
          <div className="mt-2 grid grid-cols-2 gap-2">
            <BigButton color="yellow" className="!min-h-[48px] !text-lg" onClick={() => setView("scores")}>
              🏆 Star Board
            </BigButton>
            <BigButton color="white" className="!min-h-[48px] !text-lg" onClick={() => setView("grownups")}>
              👋 Grown-ups
            </BigButton>
          </div>
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
