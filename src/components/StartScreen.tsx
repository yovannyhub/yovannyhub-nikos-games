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
}

const TITLE = "Niko's Games";
const TITLE_COLORS = ["#ff7ab6", "#ffb000", "#3cc68a", "#4aa8ff", "#7c5cff"];

export function StartScreen({ settings, adventureStars, onChange, onPlay, scores, onClearScores }: Props) {
  const [view, setView] = useState<"main" | "scores" | "grownups">("main");
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedAdventure, setSelectedAdventure] = useState(0);
  const lastCompleted = adventureStars.reduce((last, value, index) => value > 0 ? index : last, -1);
  const unlockedThrough = Math.min(9, lastCompleted + 1);
  const playableSelection = Math.min(selectedAdventure, unlockedThrough);

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
          <ul className="flex list-none flex-col gap-2 text-base leading-snug text-[#4a3f5c]">
            <li>🌈 <b>Relaxed</b> mode has no obstacles and no losing — just a 90-second round of catching treats.</li>
            <li>⛰️ <b>Adventure</b> adds slow grumpy clouds to dodge, with 3 hearts and heart refills.</li>
            <li>🎶 <b>Music Meadow</b> practises listening and naming without any &quot;wrong notes&quot;. Niko asks for an instrument — guitar, piano, trumpet, drum, violin or bell — and your child finds it on the board and taps it to hear its true sound (a plucked guitar, a mellow trumpet, a soft drum and more, all gently synthesised). Each instrument is found once across six turns. <b>Hear it</b> plays the sound as a listening hint, <b>Show me</b> pulses the right one, and <b>Say it</b> speaks the name. A <b>Free jam</b> tab is pure open-ended play. Keys 1–6 also work. There is no timer, no score and no fail — a tap that isn&apos;t it gently wobbles and can be retried.</li>
            <li>🔍 <b>Find a Friend</b> is a calm hidden-picture search across Berry Garden, Butterfly Meadow and Moonlight Party. Niko asks for three things at a time from a preview card; correct finds fade with a soft chime, and wrong taps only say &quot;Look again&quot;. There is a hint that glows around the answer, an optional spoken prompt, and timer choices for older players — with no lost points at any setting, and no ending that says they failed.</li>
            <li>🤝 <b>Together Time</b> is a cooperative turn-taking game for your child and a grown-up (or Niko, for solo play). A clear, colour-coded card shows whose turn it is and asks the waiting player to tap to pass the device. Each turn is one big spin, then the pal hops 1–3 stones; both pals must reach the picnic, and nobody loses. There is no timer, so pauses are always fine. This is practice in waiting and shared attention, not a test.</li>
            <li>🎨 <b>Cozy Creator</b> is open-ended colouring with no right answer. Choose a garden, meadow, moonlit glade or pond, choose a colour and tap any flower, butterfly, mushroom or cloud. Shapes keep soft outlines so the picture stays readable, and undo and fresh-page buttons are always one tap away. Palettes use calm, fixed colours with no flashing. Co-use with an adult works well (&quot;I want the blue one&quot;).</li>
            <li>🛤️ <b>Pattern Path</b> asks &quot;what comes next?&quot; Two or three large picture choices continue a simple pattern, and each correct step walks the chosen pal closer to a picnic. Easy patterns repeat two or three pictures; Tricky patterns use three or four, including AABB. There is no timer and no penalty: a guess that doesn&apos;t fit gently wobbles and can be retried. <b>Say it</b> reads the pattern aloud.</li>
            <li>🔢 <b>Count With Niko</b> practises counting and one-to-one matching. Niko asks for a number of strawberries (or berries, stars and hearts); your child taps one at a time and the dots and number fill in. Choose 1–5 or 6–10. There is no timer, no wrong answer and no lost point; <i>Take one out</i> lets them correct themselves. The <b>Say it</b> button uses the device&apos;s own voice and only speaks when tapped.</li>
            <li>🍃 <b>Calm Cove</b> has no score, no timer and no losing. Tap or drag to grow flowers, make ripples and wake fireflies. The friend can be tickled. Leave whenever you like with <b>Done</b>.</li>
            <li>🌙 <b>Calm</b> turns off screen shake and flashes, softens motion and reduces sparkles. It&apos;s on automatically if the device asks for reduced motion.</li>
            <li>🐢 <b>Slow</b> makes everything fall slower and less often.</li>
            <li>🔊 Sounds are soft, rounded tones with no sudden loud noises. Music and sounds can be switched off separately. Each count gives a gentle rising note.</li>
            <li>🎮 One simple action: move left and right. Arrow keys / A-D, or touch and slide anywhere. Calm Cove needs only a tap.</li>
            <li>🏆 The counting, pattern, art, music, search and together games have no score and no Star Board entry — finishing is its own reward. Pause is not needed because nothing is timed.</li>
            <li>⏸️ Pause any time (P or Esc) in the catching games. Missing a treat never takes points away.</li>
            <li>🔒 No ads, no accounts. Scores are only saved on this device.</li>
          </ul>

          <div className="mt-3 rounded-2xl bg-[#f6f2ff] p-3 text-sm leading-snug text-[#4a3f5c]">
            <p className="mb-1 font-bold text-[#3b2f4a]">🌱 Ideas we&apos;re exploring next</p>
            <p>🧺 <b>Match &amp; Make</b> — sort everyday things into two or three hoops.</p>
            <p>🎨 <b>Pattern Parade</b> — continue gentle AB or AAB patterns.</p>
            <p>😊 <b>Feelings Friends</b> — short stories with a choice of helpful actions.</p>
            <p>🔍 <b>Find It</b> — search a calm picture for named friends.</p>
            <p>📖 <b>Story Path</b> — put daily-routine pictures in order.</p>
            <p>🤝 <b>Turn-Taking Board</b> — a cooperative game played with a grown-up.</p>
            <p className="mt-2 text-xs text-[#8a809a]">These are play ideas, not therapy or a medical claim. Best built with speech therapists, occupational therapists, teachers and autistic children themselves.</p>
          </div>
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
                    className={`relative z-10 flex min-h-[140px] flex-col items-center justify-center rounded-[1.5rem] border-[3px] p-2 text-center shadow-md transition-transform hover:-translate-y-1 sm:min-h-[155px] ${selected ? "border-[#7750f7] ring-4 ring-[#ac94ff] scale-[1.03]" : unlocked ? "border-white" : "border-white opacity-55 grayscale"}`}
                    style={{backgroundColor:adventure.color}}
                  >
                    <span className="absolute left-2 top-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-extrabold text-[#58436d]">{index + 1}</span>
                    <span className="text-5xl drop-shadow-sm sm:text-6xl" aria-hidden="true">{adventure.icon}</span>
                    <span className="mt-1 text-sm font-extrabold leading-tight text-[#3b2f4a]">{adventure.title}</span>
                    <span className="text-[11px] font-semibold text-[#695a7a]">{adventure.world}</span>
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
      <div className="my-auto flex w-full justify-center">{children}</div>
    </div>
  );
}
