import { FRIENDS, type GameResult, type ScoreEntry, type Settings } from "../game/types";
import { FriendPreview } from "./FriendPreview";
import { ScoreTable } from "./ScoreTable";
import { Overlay } from "./StartScreen";
import { BigButton, BrandFooter, Panel, SettingsToggles, StarRating } from "./ui";

export function PauseMenu({
  settings,
  onChange,
  onResume,
  onRestart,
  onHome,
}: {
  settings: Settings;
  onChange: (s: Partial<Settings>) => void;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}) {
  return (
    <Overlay dim>
      <Panel className="w-full max-w-sm text-center">
        <div className="flex justify-center">
          <FriendPreview kind={settings.friend} size={96} />
        </div>
        <h2 className="text-4xl font-bold">Paused</h2>
        <p className="mb-4 text-lg font-medium text-[#6b6080]">Take a little rest! 💤</p>
        <div className="flex flex-col gap-3">
          <BigButton color="green" onClick={onResume} autoFocus className="text-2xl">
            ▶ Keep playing
          </BigButton>
          <BigButton color="yellow" onClick={onRestart}>
            ↻ Start over
          </BigButton>
          <BigButton color="white" onClick={onHome}>
            🏠 Home
          </BigButton>
        </div>
        <div className="mt-4">
          <SettingsToggles settings={settings} onChange={onChange} />
        </div>
        <p className="mt-3 hidden text-sm font-medium text-[#8a809a] sm:block">P / Esc = keep playing · R = start over</p>
        <BrandFooter />
      </Panel>
    </Overlay>
  );
}

function starsFor(score: number) {
  if (score >= 800) return 3;
  if (score >= 300) return 2;
  return 1;
}

export function GameOver({
  result,
  scores,
  highlightId,
  rank,
  playerName,
  onRestart,
  onHome,
}: {
  result: GameResult;
  scores: ScoreEntry[];
  highlightId: string | null;
  rank: number;
  playerName: string;
  onRestart: () => void;
  onHome: () => void;
}) {
  const friend = FRIENDS.find((f) => f.kind === result.friend) || FRIENDS[0];
  const who = playerName.trim() || friend.name;
  const headline = rank === 0 && scores.length > 1 ? "New best score! 🎉" : rank >= 0 ? "You're on the Star Board!" : "Great job!";
  return (
    <Overlay dim>
      <Panel className="w-full max-w-md text-center">
        <div className="anim-floaty flex justify-center">
          <FriendPreview kind={result.friend} size={104} basket />
        </div>
        <h2 className="text-3xl font-bold sm:text-4xl">Hooray, {who}!</h2>
        <p className="text-lg font-semibold text-[#7c5cff]">{headline}</p>
        <div className="my-2">
          <StarRating count={starsFor(result.score)} />
        </div>
        <div className="mx-auto mb-3 inline-flex items-baseline gap-2 rounded-full bg-[#fff6d6] px-6 py-1">
          <span className="text-5xl font-bold tabular-nums text-[#ff9f00]">{result.score}</span>
          <span className="text-lg font-semibold">points</span>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2 text-sm font-semibold">
          <Stat icon="🍓" value={result.caught} label="treats" />
          <Stat icon="🔥" value={result.bestCombo} label="in a row" />
          <Stat icon="🗺️" value={result.worldsVisited} label={result.worldsVisited === 1 ? "world" : "worlds"} />
        </div>
        <div className="flex flex-col gap-3">
          <BigButton color="pink" onClick={onRestart} autoFocus className="py-4 text-2xl">
            ↻ Play again!
          </BigButton>
          <BigButton color="white" onClick={onHome}>
            🏠 Home
          </BigButton>
        </div>
        <p className="mt-2 hidden text-sm font-medium text-[#8a809a] sm:block">Press Enter or R to play again</p>
        <h3 className="mb-2 mt-4 text-xl font-bold">🏆 Star Board</h3>
        <div className="text-left">
          <ScoreTable scores={scores} highlightId={highlightId} />
        </div>
        <BrandFooter />
      </Panel>
    </Overlay>
  );
}

function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-[#f6f2ff] py-2">
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-[#6b6080]">{label}</span>
    </div>
  );
}
