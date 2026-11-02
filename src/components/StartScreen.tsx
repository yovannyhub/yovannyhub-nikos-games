import { useState, type ReactNode } from "react";
import { audio } from "../game/audio";
import { FRIENDS, type ScoreEntry, type Settings } from "../game/types";
import { FriendPreview } from "./FriendPreview";
import { ScoreTable } from "./ScoreTable";
import { BigButton, Panel, SettingsToggles } from "./ui";

interface Props {
  settings: Settings;
  onChange: (s: Partial<Settings>) => void;
  onPlay: () => void;
  scores: ScoreEntry[];
  onClearScores: () => void;
}

const TITLE = "Niko's Games";
const TITLE_COLORS = ["#ff7ab6", "#ffb000", "#3cc68a", "#4aa8ff", "#7c5cff"];

export function StartScreen({ settings, onChange, onPlay, scores, onClearScores }: Props) {
  const [view, setView] = useState<"main" | "scores" | "grownups">("main");
  const [confirmClear, setConfirmClear] = useState(false);

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
        <p className="max-w-sm rounded-full bg-white/80 px-4 py-1 text-center text-sm font-semibold text-[#3b2f4a] sm:text-base">
          Catch stars, count, make art & music, seek & find, and play together. ⭐🌱🎶
        </p>

        <Panel className="w-full">
          <h2 className="mb-2 text-center text-xl font-bold">1. Pick a friend</h2>
          <div className="grid grid-cols-5 gap-1 sm:gap-2" role="radiogroup" aria-label="Pick a friend">
            {FRIENDS.map((f) => {
              const sel = settings.friend === f.kind;
              return (
                <button
                  key={f.kind}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  aria-label={`${f.name} the ${f.kind}`}
                  onClick={() => {
                    onChange({ friend: f.kind });
                    audio.unlock();
                    audio.catch(FRIENDS.indexOf(f) * 2);
                  }}
                  className={`flex cursor-pointer flex-col items-center rounded-2xl border-4 pb-1 transition-all ${
                    sel ? "scale-105 border-[#ff7ab6] bg-[#fff0f7]" : "border-transparent bg-[#f6f2ff] hover:bg-[#efeaff]"
                  }`}
                >
                  <span className={sel ? "anim-wiggle" : ""}>
                    <FriendPreview kind={f.kind} size={56} />
                  </span>
                  <span className="text-xs font-bold sm:text-base">{f.name}</span>
                </button>
              );
            })}
          </div>

          <h2 className="mb-2 mt-4 text-center text-xl font-bold">2. Pick a game</h2>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Pick a game">
            {(
              [
                { mode: "relaxed", icon: "🌈", title: "Relaxed", desc: "Just catch! No clouds.", tint: "border-[#7c5cff] bg-[#efeaff]" },
                { mode: "adventure", icon: "⛰️", title: "Adventure", desc: "3 hearts. Dodge clouds!", tint: "border-[#ff7ab6] bg-[#fff0f7]" },
                { mode: "cove", icon: "🍃", title: "Calm Cove", desc: "No score. Tap & grow.", tint: "border-[#3cc68a] bg-[#e8fbf1]" },
                { mode: "count", icon: "🔢", title: "Count With Niko", desc: "Count 1–5 or 6–10.", tint: "border-[#ffb000] bg-[#fff8e1]" },
              ] as const
            ).map((m) => {
              const sel = settings.mode === m.mode;
              return (
                <button
                  key={m.mode}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  onClick={() => {
                    onChange({ mode: m.mode });
                    audio.unlock();
                    if (m.mode === "count") audio.bloom(2);
                    else audio.click();
                  }}
                  className={`relative flex cursor-pointer flex-col items-center rounded-2xl border-4 px-2 py-2 text-center transition-all ${
                    sel ? `${m.tint} shadow-sm` : "border-transparent bg-[#f6f2ff] hover:bg-[#efeaff]"
                  }`}
                >
                  <span className="text-3xl" aria-hidden="true">{m.icon}</span>
                  <span className="text-base font-bold leading-tight sm:text-lg">{m.title}</span>
                  <span className="text-xs font-medium leading-tight text-[#6b6080] sm:text-sm">{m.desc}</span>
                  {sel && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#3cc68a] text-[11px] font-bold text-white" aria-hidden="true">✓</span>
                  )}
                </button>
              );
            })}
                      <button
              type="button"
              role="radio"
              aria-checked={settings.mode === "find"}
              onClick={() => {
                onChange({ mode: "find" });
                audio.unlock();
                audio.catch(4);
              }}
              className={`relative col-span-2 flex w-full cursor-pointer items-center gap-3 rounded-2xl border-4 px-3 py-2 text-left transition-all ${
                settings.mode === "find" ? "border-[#7c5cff] bg-[#efeaff] shadow-sm" : "border-transparent bg-[#f6f2ff] hover:bg-[#efeaff]"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">🔍</span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold leading-tight sm:text-lg">Find a Friend</span>
                <span className="block text-xs font-medium leading-tight text-[#6b6080] sm:text-sm">
                  Hidden pictures with a hint button. Optional gentle timer.
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  settings.mode === "find" ? "bg-[#3cc68a] text-white" : "bg-white text-[#b9aecd]"
                }`}
              >
                ✓
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={settings.mode === "together"}
              onClick={() => {
                onChange({ mode: "together" });
                audio.unlock();
                audio.cheer();
              }}
              className={`relative col-span-2 flex w-full cursor-pointer items-center gap-3 rounded-2xl border-4 px-3 py-2 text-left transition-all ${
                settings.mode === "together" ? "border-[#ff7ab6] bg-[#fff0f7] shadow-sm" : "border-transparent bg-[#f6f2ff] hover:bg-[#fff0f7]"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">🤝</span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold leading-tight sm:text-lg">Together Time</span>
                <span className="block text-xs font-medium leading-tight text-[#6b6080] sm:text-sm">
                  A turn-taking picnic for two. Play with Niko or a grown-up.
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  settings.mode === "together" ? "bg-[#3cc68a] text-white" : "bg-white text-[#b9aecd]"
                }`}
              >
                ✓
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={settings.mode === "creator"}
              onClick={() => {
                onChange({ mode: "creator" });
                audio.unlock();
                audio.bloom(4);
              }}
              className={`relative col-span-2 flex w-full cursor-pointer items-center gap-3 rounded-2xl border-4 px-3 py-2 text-left transition-all ${
                settings.mode === "creator" ? "border-[#3cc68a] bg-[#e8fbf1] shadow-sm" : "border-transparent bg-[#f6f2ff] hover:bg-[#e8fbf1]"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">🎨</span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold leading-tight sm:text-lg">Cozy Creator</span>
                <span className="block text-xs font-medium leading-tight text-[#6b6080] sm:text-sm">
                  Colour a garden, meadow, moonlit glade or pond. No rules!
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  settings.mode === "creator" ? "bg-[#3cc68a] text-white" : "bg-white text-[#b9aecd]"
                }`}
              >
                ✓
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={settings.mode === "pattern"}
              onClick={() => {
                onChange({ mode: "pattern" });
                audio.unlock();
                audio.catch(3);
              }}
              className={`relative col-span-2 mt-0 flex w-full cursor-pointer items-center gap-3 rounded-2xl border-4 px-3 py-2 text-left transition-all ${
                settings.mode === "pattern" ? "border-[#ffb000] bg-[#fff8e1] shadow-sm" : "border-transparent bg-[#f6f2ff] hover:bg-[#fff8e1]"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">🛤️</span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold leading-tight sm:text-lg">Pattern Path</span>
                <span className="block text-xs font-medium leading-tight text-[#6b6080] sm:text-sm">
                  What comes next? ⭐💛⭐💛… Walk your pal to the picnic.
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  settings.mode === "pattern" ? "bg-[#3cc68a] text-white" : "bg-white text-[#b9aecd]"
                }`}
              >
                ✓
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={settings.mode === "music"}
              onClick={() => {
                onChange({ mode: "music" });
                audio.unlock();
                audio.pad(2);
              }}
              className={`relative col-span-2 mt-0 flex w-full cursor-pointer items-center gap-3 rounded-2xl border-4 px-3 py-2 text-left transition-all ${
                settings.mode === "music" ? "border-[#4aa8ff] bg-[#e8f3ff] shadow-sm" : "border-transparent bg-[#f6f2ff] hover:bg-[#e8f3ff]"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">🎶</span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold leading-tight sm:text-lg">Music Meadow</span>
                <span className="block text-xs font-medium leading-tight text-[#6b6080] sm:text-sm">
                  Find the guitar, piano &amp; more. Hear real sounds!
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  settings.mode === "music" ? "bg-[#3cc68a] text-white" : "bg-white text-[#b9aecd]"
                }`}
              >
                ✓
              </span>
            </button>
                    </div>

          {settings.mode === "cove" || settings.mode === "count" || settings.mode === "pattern" || settings.mode === "creator" || settings.mode === "together" || settings.mode === "find" || settings.mode === "music" ? (
            <p className={`mt-3 rounded-2xl px-3 py-2 text-center text-sm font-semibold ${
              settings.mode === "cove" || settings.mode === "creator"
                ? "bg-[#e8fbf1] text-[#2f7f5f]"
                : settings.mode === "together"
                  ? "bg-[#fff0f7] text-[#b03060]"
                  : "bg-[#fff8e1] text-[#9a6b00]"
            }`}>
              {settings.mode === "count"
                ? "🔢 No timer and no wrong answers. Tap to count at your own pace."
                : settings.mode === "pattern"
                  ? "🛤️ No timer and no lost points. Guesses that don't fit just wobble — try again!"
                  : settings.mode === "creator"
                    ? "🎨 No score and no wrong answer. Pick a colour, tap a shape, undo anytime."
                    : settings.mode === "together"
                      ? "🤝 A game for two: you both win when both pals reach the picnic. No timer, no losing."
                      : settings.mode === "music"
                        ? "🎶 Niko names an instrument — find it on the board and tap it to hear it play! Taps that aren&apos;t it just wobble."
                        : settings.mode === "find"
                        ? "🔍 Three things to spot at a time. Hints and a spoken prompt are always there; the timer is optional."
                        : "🍃 No score and no timer here — just play and leave when you're ready."}
            </p>
          ) : (
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
          )}

          <BigButton color="pink" onClick={onPlay} className="mt-4 w-full py-4 text-3xl" ariaLabel="Play">
            {settings.mode === "cove"
              ? "🍃 Visit Calm Cove"
              : settings.mode === "count"
                ? "🔢 Count with Niko"
                : settings.mode === "pattern"
                  ? "🛤️ Walk the Pattern Path"
                  : settings.mode === "creator"
                    ? "🎨 Start creating"
                    : settings.mode === "together"
                      ? "🤝 Start Together Time"
                      : settings.mode === "music"
                        ? "🎶 Play Music Meadow"
                        : "▶ Play!"}
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
