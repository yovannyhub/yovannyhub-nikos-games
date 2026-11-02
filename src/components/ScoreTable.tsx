import { FriendPreview } from "./FriendPreview";
import type { ScoreEntry } from "../game/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export function ScoreTable({ scores, highlightId }: { scores: ScoreEntry[]; highlightId?: string | null }) {
  if (scores.length === 0) {
    return (
      <div className="rounded-2xl bg-[#f6f2ff] p-4 text-center text-lg font-medium text-[#6b6080]">
        No stars yet — play to fill the Star Board! ⭐
      </div>
    );
  }
  return (
    <ol className="flex flex-col gap-1.5" aria-label="Star Board high scores">
      {scores.map((s, i) => {
        const hl = s.id === highlightId;
        return (
          <li
            key={s.id}
            className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 text-lg font-semibold ${
              hl ? "anim-popin bg-[#ffd23f] text-[#3b2f4a] ring-4 ring-[#ffb000]" : i % 2 ? "bg-[#f6f2ff]" : "bg-white"
            }`}
          >
            <span className="w-8 text-center text-xl">{MEDALS[i] ?? `${i + 1}.`}</span>
            <FriendPreview kind={s.friend} size={34} />
            <span className="min-w-0 flex-1 truncate">{s.name}</span>
            <span className="text-sm" title={s.mode === "relaxed" ? "Relaxed" : "Adventure"} aria-label={s.mode === "relaxed" ? "Relaxed mode" : "Adventure mode"}>
              {s.mode === "relaxed" ? "🌈" : "⛰️"}
            </span>
            <span className="w-16 text-right tabular-nums">{s.score}</span>
          </li>
        );
      })}
    </ol>
  );
}
