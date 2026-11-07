import { useCallback, useEffect, useRef, useState } from "react";
import { CountGame } from "./components/CountGame";
import { CozyCreator } from "./components/CozyCreator";
import { PatternPath } from "./components/PatternPath";
import { FindAFriend } from "./components/FindAFriend";
import { Hud } from "./components/Hud";
import { MusicMeadow } from "./components/MusicMeadow";
import { GameOver, PauseMenu } from "./components/Menus";
import { StartScreen } from "./components/StartScreen";
import { TogetherTime } from "./components/TogetherTime";
import { audio } from "./game/audio";
import { GameEngine } from "./game/engine";
import { addScore, clearScores, loadScores, loadSettings, saveSettings } from "./game/storage";
import { FRIENDS, RELAXED_TIME, type GameResult, type HudState, type ScoreEntry, type Settings } from "./game/types";

const STAR_KEY = "niko-adventure-stars-v1";
function readAdventureStars(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STAR_KEY) || "[]");
    if (Array.isArray(raw)) return Array.from({ length: 10 }, (_, i) => Math.max(0, Math.min(3, Number(raw[i]) || 0)));
  } catch { /* storage may be unavailable */ }
  return Array(10).fill(0);
}
function highestUnlockedWorld(stars: number[]): number {
  const lastCompleted = stars.reduce((last, value, index) => value > 0 ? index : last, -1);
  return Math.min(9, lastCompleted + 1);
}
function awardAdventureStars(previous: number[], level: number, score: number): number[] {
  const stars = score >= 800 ? 3 : score >= 300 ? 2 : 1;
  return previous.map((old, index) => index === level ? Math.max(old, stars) : old);
}

type Phase = "start" | "playing" | "paused" | "over" | "count" | "pattern" | "creator" | "together" | "find" | "music";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [phase, setPhase] = useState<Phase>("start");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [hud, setHud] = useState<HudState>({ score: 0, hearts: 3, timeLeft: RELAXED_TIME, combo: 0, multiplier: 1, world: "Sunny Meadow", mode: "relaxed" });
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScores());
  const [result, setResult] = useState<GameResult | null>(null);
  const [adventureStars, setAdventureStars] = useState<number[]>(readAdventureStars);
  const selectedGameRef = useRef(0);
  const [lastId, setLastId] = useState<string | null>(null);
  const [rank, setRank] = useState(-1);
  const overAt = useRef(0);

  // --- engine lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new GameEngine(canvas, {
      onHud: (h) => setHud(h),
      onGameOver: (r) => {
        const s = settingsRef.current;
        const friendName = FRIENDS.find((f) => f.kind === r.friend)?.name ?? "Pal";
        if (r.score > 0) {
          const res = addScore({ name: s.playerName.trim() || friendName, score: r.score, friend: r.friend, mode: r.mode });
          setScores(res.scores);
          setRank(res.rank);
          setLastId(res.rank >= 0 ? res.id : null);
        } else {
          setScores(loadScores());
          setRank(-1);
          setLastId(null);
        }
        if (r.mode === "relaxed") {
          setAdventureStars(previous => {
            const next = awardAdventureStars(previous, selectedGameRef.current, r.score);
            try { localStorage.setItem(STAR_KEY, JSON.stringify(next)); } catch { /* private browsing */ }
            return next;
          });
        }
        setResult(r);
        overAt.current = performance.now();
        setPhase("over");
      },
    });
    engine.setFriend(settingsRef.current.friend);
    engine.setOptions({ calm: settingsRef.current.calm, slow: settingsRef.current.slow });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
      audio.stopMusic();
    };
  }, []);

  // --- apply settings
  useEffect(() => {
    saveSettings(settings);
    const e = engineRef.current;
    if (e) {
      e.setFriend(settings.friend);
      e.setOptions({ calm: settings.calm, slow: settings.slow });
    }
    audio.soundOn = settings.sound;
    audio.musicOn = settings.music;
    if (!settings.music) audio.stopMusic();
    else if (phaseRef.current === "playing") audio.startMusic();
  }, [settings]);

  const updateSettings = useCallback((s: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...s })), []);

  // --- actions
  const play = useCallback((adventure?: number) => {
    const game = adventure ?? selectedGameRef.current;
    if (game < 0 || game > highestUnlockedWorld(readAdventureStars())) return;
    selectedGameRef.current = game;
    const e = engineRef.current;
    if (!e) return;
    const s = settingsRef.current;
    audio.unlock();
    audio.soundOn = s.sound;
    audio.musicOn = s.music;
    audio.stopMusic();
    setResult(null);
    // All choices on the new home screen use the original Relaxed catching game.
    e.setVisible(true);
    if (s.music) audio.startMusic();
    e.setFriend(game === 1 ? "fish" : "kitty");
    e.setOptions({ calm: s.calm, slow: s.slow });
    e.setLearningGame(game);
    e.start("relaxed");
    setPhase("playing");
  }, []);

  const restartFromOver = useCallback(() => {
    if (performance.now() - overAt.current < 450) return; // avoid accidental taps carried over from gameplay
    play();
  }, [play]);

  const pause = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    engineRef.current?.pause();
    audio.stopMusic();
    setPhase("paused");
  }, []);

  const resume = useCallback(() => {
    if (phaseRef.current !== "paused") return;
    engineRef.current?.resume();
    if (settingsRef.current.music) audio.startMusic();
    setPhase("playing");
  }, []);

  const home = useCallback(() => {
    engineRef.current?.goHome();
    engineRef.current?.setVisible(true);
    audio.stopMusic();
    setScores(loadScores());
    setPhase("start");
  }, []);

  // --- global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName;
      if (tag === "INPUT") return;
      const onButton = tag === "BUTTON";
      const k = e.key;
      const p = phaseRef.current;
      const isConfirm = k === "Enter" || k === " ";
      if (p === "start") {
        if (isConfirm && !onButton) {
          e.preventDefault();
          play();
        }
      } else if (p === "playing") {
        if (k === "p" || k === "P" || k === "Escape") {
          e.preventDefault();
          pause();
        } else if (k === "r" || k === "R") {
          e.preventDefault();
          play();
        } else if (k === " ") e.preventDefault();
      } else if (p === "paused") {
        if (k === "p" || k === "P" || k === "Escape" || (isConfirm && !onButton)) {
          e.preventDefault();
          resume();
        } else if (k === "r" || k === "R") {
          e.preventDefault();
          play();
        }
      } else if (p === "count" || p === "pattern" || p === "creator" || p === "together" || p === "find" || p === "music") {
        if (k === "Escape") {
          e.preventDefault();
          home();
        }
      } else if (p === "over") {
        if (k === "r" || k === "R" || (isConfirm && !onButton)) {
          e.preventDefault();
          restartFromOver();
        } else if (k === "Escape") {
          e.preventDefault();
          home();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play, pause, resume, home, restartFromOver]);

  // --- auto-pause when the tab/app is hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pause]);

  return (
    <div className={`relative h-full w-full overflow-hidden font-display ${settings.calm ? "calm" : ""}`}>
      <canvas ref={canvasRef} aria-label="Game area: move your friend left and right to catch falling stars" role="img" />

      {(phase === "playing" || phase === "paused") && <Hud hud={hud} onPause={pause} onExit={home} />}

      {phase === "start" && (
        <StartScreen
          settings={settings}
          adventureStars={adventureStars}
          onResetAdventure={() => {
            const empty = Array(10).fill(0);
            try { localStorage.setItem(STAR_KEY, JSON.stringify(empty)); } catch { /* storage unavailable */ }
            setAdventureStars(empty);
            selectedGameRef.current = 0;
          }}
          onChange={updateSettings}
          onPlay={(adventure) => play(adventure)}
          scores={scores}
          onClearScores={() => {
            clearScores();
            setScores([]);
          }}
        />
      )}

      {phase === "paused" && <PauseMenu settings={settings} onChange={updateSettings} onResume={resume} onRestart={play} onHome={home} />}

      {phase === "count" && <CountGame settings={settings} onHome={home} />}
      {phase === "pattern" && <PatternPath settings={settings} onHome={home} />}
      {phase === "creator" && <CozyCreator settings={settings} onHome={home} />}
      {phase === "together" && <TogetherTime settings={settings} onHome={home} />}
      {phase === "find" && <FindAFriend settings={settings} onHome={home} />}
      {phase === "music" && <MusicMeadow settings={settings} onHome={home} onChange={updateSettings} />}

      {phase === "over" && result && (
        <GameOver
          result={result}
          scores={scores}
          highlightId={lastId}
          rank={rank}
          playerName={settings.playerName}
          onRestart={restartFromOver}
          onHome={home}
        />
      )}
    </div>
  );
}
