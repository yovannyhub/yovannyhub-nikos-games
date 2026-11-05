import { useState, type ReactNode } from "react";
import { audio } from "../game/audio";
import { FRIENDS, type ScoreEntry, type Settings } from "../game/types";
import { ScoreTable } from "./ScoreTable";
import { BigButton, Panel, SettingsToggles } from "./ui";

interface Props {
  settings: Settings;
  onChange: (s: Partial<Settings>) => void;
  onPlay: (adventure: number) => void;
  scores: ScoreEntry[];
  onClearScores: () => void;
}

const TITLE = "Niko's Games";
const TITLE_COLORS = ["#ff7ab6", "#ffb000", "#3cc68a", "#4aa8ff", "#7c5cff"];

export function StartScreen({ settings, onChange, onPlay, scores, onClearScores }: Props) {
  const [view, setView] = useState<"main" | "scores" | "grownups">("main");
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedAdventure, setSelectedAdventure] = useState(0);

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
      <div className="flex w-full max-w-lg flex-col items-center gap-3">
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

        <Panel className="w-full">
          <h2 className="mb-1 text-center text-xl font-bold">1. Pick a friend · Choose a world</h2>
          <p className="mb-3 text-center text-xs font-semibold text-[#8a809a]">Play Kitty's Meadow now! More worlds are coming soon.</p>
          <div className="grid grid-cols-5 gap-1 sm:gap-2" aria-label="Adventure levels">
            {[
              { icon: "🐱", name: "Kitty", place: "Meadow" },
              { icon: "🐠", name: "Fish", place: "Ocean" },
              { icon: "👽", name: "Alien", place: "Galaxy" },
              { icon: "🐷", name: "Piggy", place: "Farm" },
              { icon: "🦊", name: "Fox", place: "Forest" },
              { icon: "🐼", name: "Panda", place: "Bamboo" },
              { icon: "🐧", name: "Penguin", place: "Snow" },
              { icon: "🦁", name: "Lion", place: "Savanna" },
              { icon: "🐉", name: "Dragon", place: "Dragonland" },
              { icon: "🦄", name: "Unicorn", place: "Magic" },
            ].map((level, index) => {
              const available = index === 0;
              const selected = available && settings.friend === "kitty" && settings.mode === "relaxed";
              return (
                <button
                  key={level.place}
                  type="button"
                  disabled={!available}
                  aria-label={`Level ${index + 1}: ${level.name} in ${level.place}${available ? ", play now" : ", coming soon"}`}
                  onClick={() => {
                    onChange({ friend: "kitty", mode: "relaxed" });
                    audio.unlock();
                    audio.catch(2);
                  }}
                  className={`relative flex min-w-0 flex-col items-center rounded-2xl border-[3px] px-0.5 py-2 transition-all ${
                    selected ? "border-[#ff7ab6] bg-[#fff0f7]" : available ? "border-[#b3e8c1] bg-[#e8fbf1] hover:bg-[#d7f8e4]" : "cursor-not-allowed border-transparent bg-[#f6f2ff] opacity-70"
                  }`}
                >
                  <span className="absolute left-1 top-0.5 text-[10px] font-bold text-[#776b8b]">{index + 1}</span>
                  <span className="text-3xl sm:text-4xl" aria-hidden="true">{level.icon}</span>
                  <span className="text-xs font-bold sm:text-sm">{level.name}</span>
                  <span className="text-[10px] font-semibold text-[#7b708d]">{level.place}</span>
                  <span className="text-[9px] font-bold text-[#7c5cff]">{available ? "▶ PLAY" : "🔒 SOON"}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-[#6b6080]">Kitty's Meadow uses the original Relaxed catching game. Other games below stay available.</p>

          <h2 className="mb-2 mt-4 text-center text-xl font-bold">2. Pick a game</h2>
          <p className="mb-3 text-center text-xs font-semibold text-[#8a809a]">Ten learning adventures. One easy catching game!</p>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Pick a learning adventure">
            {[
              { icon: "🎨", title: "Color Match" },
              { icon: "🔷", title: "Shape Finder" },
              { icon: "🔢", title: "Counting Fun" },
              { icon: "🧠", title: "Memory Match" },
              { icon: "😊", title: "Feelings & Faces" },
              { icon: "👂", title: "Listen & Choose" },
              { icon: "💬", title: "Let's Communicate" },
              { icon: "☀️", title: "My Daily Routine" },
              { icon: "🐾", title: "Animal Friends" },
              { icon: "🏆", title: "Niko's Big Challenge" },
            ].map((game, index) => (
              <button
                key={game.title}
                type="button"
                role="radio"
                aria-checked={selectedAdventure === index}
                onClick={() => {
                  setSelectedAdventure(index);
                  onChange({ mode: "relaxed", friend: "kitty" });
                  audio.unlock();
                  audio.click();
                }}
                className={`relative flex min-h-[86px] cursor-pointer flex-col items-center justify-center rounded-2xl border-4 px-2 py-2 text-center transition-all ${
                  selectedAdventure === index
                    ? "border-[#7c5cff] bg-[#efeaff] shadow-sm"
                    : "border-transparent bg-[#f6f2ff] hover:bg-[#efeaff]"
                }`}
              >
                <span className="text-3xl" aria-hidden="true">{game.icon}</span>
                <span className="text-sm font-bold leading-tight sm:text-base">{game.title}</span>
                {selectedAdventure === index && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#3cc68a] text-[11px] font-bold text-white" aria-hidden="true">✓</span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-3 rounded-2xl bg-[#e8fbf1] px-3 py-2 text-center text-xs font-semibold text-[#2f7f5f]">
            🌱 All games currently use the relaxed catching activity. Different learning objects and worlds are coming next.
          </p>
          <label className="mt-4 flex items-center gap-2 rounded-2xl bg-[#f6f2ff] px-3 py-2">
            <span className="text-sm font-bold whitespace-nowrap">Your name:</span>
            <input
              value={settings.playerName}
              maxLength={12}
              onChange={(e) => onChange({ playerName: e.target.value })}
              placeholder="(optional)"
              className="min-w-0 flex-1 rounded-xl border-2 border-[#e2dafc] bg-white px-3 py-1.5 text-lg font-semibold text-[#3b2f4a] outline-none select-text"
              aria-label="Your name for the Star Board (optional)"
            />
          </label>
          <BigButton
            color="pink"
            onClick={() => onPlay(selectedAdventure)}
            className="mt-4 w-full py-4 text-3xl"
            ariaLabel="Play relaxed catching game"
          >
            ▶ Play!
          </BigButton>
          <p className="mt-2 hidden text-center text-sm font-medium text-[#8a809a] sm:block">Press Enter to play · Arrow keys to move · P to pause</p>
        </Panel>

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
