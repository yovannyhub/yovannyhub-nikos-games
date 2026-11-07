import type { ReactNode } from "react";
import { audio } from "../game/audio";
import type { Settings } from "../game/types";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`anim-popin rounded-[2rem] border-4 border-white bg-white/90 p-5 text-[#3b2f4a] shadow-[0_12px_0_rgba(59,47,74,0.15)] backdrop-blur-sm sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function BigButton({
  children,
  onClick,
  color = "pink",
  className = "",
  autoFocus,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  color?: "pink" | "purple" | "yellow" | "white" | "green";
  className?: string;
  autoFocus?: boolean;
  ariaLabel?: string;
}) {
  const colors: Record<string, string> = {
    pink: "bg-[#ff7ab6] text-white",
    purple: "bg-[#7c5cff] text-white",
    yellow: "bg-[#ffd23f] text-[#3b2f4a]",
    white: "bg-white text-[#3b2f4a] border-4 border-[#e9e3ff]",
    green: "bg-[#3cc68a] text-white",
  };
  return (
    <button
      type="button"
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      onClick={() => {
        audio.click();
        onClick();
      }}
      className={`btn-chunky flex min-h-[56px] cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-xl font-bold tracking-wide ${colors[color]} ${className}`}
    >
      {children}
    </button>
  );
}

const TOGGLES: { key: "sound" | "music" | "calm" | "slow" | "quiet"; on: string; off: string; label: string; help: string }[] = [
  { key: "sound", on: "🔊", off: "🔈", label: "Sounds", help: "Gentle sound effects" },
  { key: "music", on: "🎵", off: "🎵", label: "Music", help: "Soft background music" },
  { key: "calm", on: "🌙", off: "✨", label: "Calm", help: "No shaking, fewer sparkles" },
  { key: "slow", on: "🐢", off: "🐇", label: "Slow", help: "Everything falls slower" },
  { key: "quiet", on: "🤫", off: "🎶", label: "Quiet", help: "Mute songs and game effects, but keep Laury speaking" },
];

export function SettingsToggles({ settings, onChange }: { settings: Settings; onChange: (s: Partial<Settings>) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="group" aria-label="Settings">
      {TOGGLES.map((t) => {
        const on = settings[t.key];
        return (
          <button
            key={t.key}
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={`${t.label}: ${on ? "on" : "off"}. ${t.help}`}
            title={t.help}
            onClick={() => {
              onChange({ [t.key]: !on });
              if (!settings.quiet && t.key !== "quiet") audio.click();
            }}
            className={`flex min-h-[64px] cursor-pointer flex-col items-center justify-center rounded-2xl border-4 px-1 py-1 text-sm font-semibold transition-colors ${
              on ? "border-[#7c5cff] bg-[#efeaff] text-[#3b2f4a]" : "border-[#eee] bg-white text-[#9a92a8]"
            }`}
          >
            <span className={`text-2xl leading-none ${on ? "" : "opacity-50 grayscale"}`}>{on ? t.on : t.off}</span>
            <span>{t.label}</span>
            <span className={`mt-0.5 rounded-full px-2 text-[10px] font-bold ${on ? "bg-[#7c5cff] text-white" : "bg-[#eee] text-[#9a92a8]"}`}>{on ? "ON" : "OFF"}</span>
          </button>
        );
      })}
    </div>
  );
}

export function BrandFooter() {
  return (
    <p className="mt-3 text-center text-xs font-bold tracking-wide text-[#a79cba]">
      ⭐ Niko&apos;s Games · gentle play for little hands ⭐
    </p>
  );
}

export function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-end justify-center gap-1" aria-label={`${count} out of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`anim-popin inline-block ${i === 1 ? "text-6xl" : "text-5xl"} ${i < count ? "" : "opacity-25 grayscale"}`}
          style={{ animationDelay: `${0.15 + i * 0.2}s` }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
