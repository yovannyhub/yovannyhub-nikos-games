import { useEffect, useMemo, useRef, useState } from "react";
import { audio } from "../game/audio";
import type { Settings } from "../game/types";
import { PALETTE, SCENES, SHAPES, type SceneKey } from "../game/creatorShapes";
import { FriendPreview } from "./FriendPreview";
import { BigButton } from "./ui";

type Tool = "paint" | "erase";

interface Edit {
  scene: SceneKey;
  id: string;
  color: string;
}

const BLANK_SCENES = Object.fromEntries(SCENES.map((sc) => [sc.key, true])) as Record<SceneKey, boolean>;
const BLANK_RESTORED: Record<SceneKey, Record<string, string>> = {
  garden: {},
  meadow: {},
  night: {},
  pond: {},
};

function Stroke({ d, fill, selected, onPick }: { d: string; fill: string; selected: boolean; onPick: () => void }) {
  return (
    <path
      d={d}
      fill={fill}
      stroke={selected ? "#3b2f4a" : "#4a3f5c"}
      strokeWidth={selected ? 2.4 : 1.6}
      strokeLinejoin="round"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      className="cursor-pointer transition-[filter] duration-150 hover:brightness-105"
      style={{ filter: selected ? "drop-shadow(0 0 3px rgba(124,92,255,0.7))" : undefined }}
      onClick={onPick}
      role="button"
      aria-label={`Colour this shape${selected ? " (selected)" : ""}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPick();
        }
      }}
    />
  );
}

/** Draw the tiny dark line details that keep shapes readable once coloured. */
function Details({ shapes, selectedId }: { shapes: { id: string; details?: string }[]; selectedId: string | null }) {
  return (
    <>
      {shapes.map((sh) =>
        sh.details ? (
          <path
            key={`${sh.id}-details`}
            d={sh.details}
            fill="none"
            stroke="#3b2f4a"
            strokeOpacity={0.75}
            strokeWidth={selectedId === sh.id ? 2 : 1.4}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          />
        ) : null,
      )}
    </>
  );
}

function SceneView({
  sceneKey,
  colorOf,
  selectedId,
  onPick,
  calm,
}: {
  sceneKey: SceneKey;
  colorOf: (id: string) => string;
  selectedId: string | null;
  onPick: (id: string) => void;
  calm: boolean;
}) {
  const scene = SCENES.find((s) => s.key === sceneKey)!;
  const shapes = SHAPES[sceneKey];
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ backgroundColor: scene.paper }}>
      {/* soft scenery bands, never colourable so the page stays calm */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[42%]" style={{ backgroundColor: scene.sky }} />
      <div aria-hidden="true" className="absolute -bottom-10 left-1/2 h-[46%] w-[130%] -translate-x-1/2 rounded-[50%]" style={{ backgroundColor: scene.hill }} />
      <div aria-hidden="true" className="absolute bottom-[18%] left-[6%] h-[10%] w-[26%] rounded-full bg-white/40" />
      {!calm && (
        <div aria-hidden="true" className="absolute left-[10%] top-[8%] animate-pulse text-lg opacity-60">
          🐝
        </div>
      )}
      <svg viewBox="0 0 1000 640" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-label={`Colouring scene: ${scene.name}`}>
        {shapes.map((sh) => {
          const size = sh.scale * 1000;
          return (
            <g
              key={sh.id}
              transform={`translate(${sh.x * 1000 - size / 2}, ${sh.y * 640 - size * 0.5}) scale(${size / 100})`}
            >
              <Stroke d={sh.d} fill={colorOf(sh.id)} selected={selectedId === sh.id} onPick={() => onPick(sh.id)} />
              <Details shapes={[sh]} selectedId={selectedId} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function CozyCreator({ settings, onHome }: { settings: Settings; onHome: () => void }) {
  const [scene, setScene] = useState<SceneKey>("garden");
  const [colors, setColors] = useState<Record<SceneKey, Record<string, string>>>(BLANK_RESTORED);
  const [dirty, setDirty] = useState<Record<SceneKey, boolean>>(BLANK_SCENES);
  const [history, setHistory] = useState<Edit[]>([]);
  const [color, setColor] = useState(PALETTE[0]);
  const [tool, setTool] = useState<Tool>("paint");
  const [selected, setSelected] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [showPalette, setShowPalette] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const [pickMessage, setPickMessage] = useState("");

  const shapes = useMemo(() => SHAPES[scene], [scene]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const colorOf = (id: string) => colors[scene][id] ?? shapes.find((s) => s.id === id)?.base ?? "#ffffff";

  const apply = (id: string, next: string | null) => {
    setColors((prev) => {
      const sceneColors = { ...prev[scene] };
      if (next === null) delete sceneColors[id];
      else sceneColors[id] = next;
      return { ...prev, [scene]: sceneColors };
    });
    setDirty((prev) => ({ ...prev, [scene]: true }));
    setHistory((prev) => [...prev.slice(-40), { scene, id, color: next ?? "" }]);
  };

  const pick = (id: string) => {
    audio.unlock();
    setSelected(id);
    if (tool === "erase") {
      apply(id, null);
      audio.giggle();
      setPickMessage("Undone!");
      return;
    }
    apply(id, color);
    audio.bloom(Math.floor(Math.random() * 8));
    setPickMessage("Nice colour!");
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setColors((prev) => {
      const sceneColors = { ...prev[last.scene] };
      if (last.color === "") delete sceneColors[last.id];
      else sceneColors[last.id] = last.color;
      return { ...prev, [last.scene]: sceneColors };
    });
    audio.miss();
    setSelected(last.id);
    setPickMessage("Undone");
  };

  const restart = () => {
    setColors((prev) => ({ ...prev, [scene]: {} }));
    setDirty((prev) => ({ ...prev, [scene]: false }));
    setSelected(null);
    setHistory((prev) => prev.filter((e) => e.scene !== scene));
    audio.miss();
    setPickMessage("A fresh page!");
  };

  const changeScene = (key: SceneKey) => {
    audio.click();
    setScene(key);
    setSelected(null);
    setShowPalette(true);
  };

  const chooseColor = (c: string) => {
    audio.unlock();
    audio.catch(2);
    setColor(c);
    setTool("paint");
    setShowPalette(true);
    if (selected) {
      apply(selected, c);
      setPickMessage("Lovely!");
    }
  };

  return (
    <div className={`absolute inset-0 z-20 flex flex-col overflow-hidden bg-[linear-gradient(#fff6ef_0%,#f3ecff_100%)] ${settings.calm ? "calm" : ""}`}>
      {/* header */}
      <div className="relative z-10 flex items-center gap-2 px-3 pt-[max(0.6rem,env(safe-area-inset-top))] pb-2 sm:px-4">
        <button
          type="button"
          onClick={() => {
            try {
              window.speechSynthesis?.cancel();
            } catch {
              /* ignore */
            }
            onHome();
          }}
          aria-label="Back to Niko's Games home"
          className="btn-chunky flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-white/95 text-2xl text-[#3b2f4a]"
        >
          🏠
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold leading-none text-[#3b2f4a] sm:text-2xl">
            <span className="rounded-lg bg-[#3cc68a] px-1.5 py-0.5 text-white">Cozy</span> Creator
          </h1>
          <p className="text-xs font-semibold text-[#8a809a] sm:text-sm">Niko&apos;s Games · colour, no rules, no rush</p>
        </div>
        <div className="hidden shrink-0 items-center gap-1 rounded-full bg-white/80 px-2 py-1 sm:flex">
          <FriendPreview kind={settings.friend} size={34} />
          <span className="text-xs font-bold text-[#6b6080]">Just create</span>
        </div>
      </div>

      {/* scene switcher */}
      <div className="relative z-10 flex gap-1.5 overflow-x-auto px-3 pb-2 sm:justify-center" role="tablist" aria-label="Art scenes">
        {SCENES.map((sc) => (
          <button
            key={sc.key}
            type="button"
            role="tab"
            aria-selected={scene === sc.key}
            onClick={() => changeScene(sc.key)}
            className={`flex shrink-0 cursor-pointer items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-bold transition-colors sm:text-sm ${
              scene === sc.key ? "border-[#3cc68a] bg-[#e8fbf1] text-[#2f7f5f]" : "border-white bg-white/80 text-[#6b6080] hover:bg-white"
            }`}
          >
            <span aria-hidden="true">{sc.icon}</span>
            {sc.name}
            {dirty[sc.key] && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff9f00]" aria-label="has your art" />
            )}
          </button>
        ))}
      </div>

      {/* art stage */}
      <div className="relative mx-2 flex-1 overflow-hidden rounded-[1.6rem] border-4 border-white bg-white shadow-[0_8px_0_rgba(59,47,74,0.1)] sm:mx-4">
        <div ref={stageRef} className="absolute inset-0">
          {size.w > 0 && (
            <SceneView sceneKey={scene} colorOf={colorOf} selectedId={selected} onPick={pick} calm={settings.calm} />
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-1">
          <p className="pointer-events-auto rounded-full bg-white/85 px-3 py-0.5 text-[11px] font-bold text-[#8a809a]" aria-live="polite">
            {pickMessage || "Tap any shape to colour it"}
          </p>
        </div>
      </div>

      {/* palette + tools */}
      <div className="relative z-10 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-4">
        <div className="rounded-2xl border-4 border-white bg-white/95 p-2 shadow-[0_5px_0_rgba(59,47,74,0.1)]">
          <div className="flex items-center gap-1.5">
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#f6f2ff] p-1">
              <button
                type="button"
                aria-label="Paint tool"
                aria-pressed={tool === "paint"}
                onClick={() => {
                  setTool("paint");
                  audio.click();
                }}
                className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg ${tool === "paint" ? "bg-[#7c5cff] text-white" : "text-[#6b6080]"}`}
              >
                🖌️
              </button>
              <button
                type="button"
                aria-label="Eraser tool"
                aria-pressed={tool === "erase"}
                onClick={() => {
                  setTool("erase");
                  audio.click();
                }}
                className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg ${tool === "erase" ? "bg-[#7c5cff] text-white" : "text-[#6b6080]"}`}
              >
                🧽
              </button>
            </div>
            <div className="grid min-w-0 flex-1 grid-cols-6 justify-items-center gap-1.5 px-1">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Choose colour ${c}`}
                  aria-pressed={color === c}
                  onClick={() => chooseColor(c)}
                  className={`h-8 w-8 shrink-0 cursor-pointer rounded-full border-[3px] transition-transform sm:h-9 sm:w-9 ${
                    color === c ? "scale-110 border-[#3b2f4a] shadow-inner" : "border-white hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={undo}
                disabled={history.length === 0}
                aria-label="Undo last colour"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#f6f2ff] text-lg text-[#6b6080] disabled:opacity-35"
              >
                ↩
              </button>
              <button
                type="button"
                onClick={restart}
                aria-label="Clear this scene and start again"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#f6f2ff] text-lg text-[#6b6080]"
              >
                🧺
              </button>
              <button
                type="button"
                onClick={() => setShowPalette((v) => !v)}
                aria-label={showPalette ? "Hide palette" : "Show palette"}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#f6f2ff] text-lg text-[#6b6080]"
              >
                {showPalette ? "▾" : "▸"}
              </button>
            </div>
          </div>
          <p className="mt-1 text-center text-[11px] font-semibold text-[#a79cba]">
            Tip: pick a colour, then tap the picture. Undo is always there. 🌈
          </p>
        </div>
        {/* large finish button for little hands */}
        <div className="mt-1.5 flex justify-center">
          <BigButton color="green" className="!min-h-[46px] w-full max-w-xs !text-lg" onClick={onHome}>
            ✓ All done
          </BigButton>
        </div>
      </div>
    </div>
  );
}
