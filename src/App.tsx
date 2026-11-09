import { useCallback, useEffect, useRef, useState } from "react";
import { ColorMatchWorld } from "./components/ColorMatchWorld";
import { ShapeFinderWorld } from "./components/ShapeFinderWorld";
import { GalaxyCountingWorld } from "./components/GalaxyCountingWorld";
import { FarmMemoryWorld } from "./components/FarmMemoryWorld";
import { ForestFeelingsWorld } from "./components/ForestFeelingsWorld";
import { BambooListenWorld } from "./components/BambooListenWorld";
import { CountGame } from "./components/CountGame";
import { CozyCreator } from "./components/CozyCreator";
import { PatternPath } from "./components/PatternPath";
import { FindAFriend } from "./components/FindAFriend";
import { Hud } from "./components/Hud";
import { MusicMeadow } from "./components/MusicMeadow";
import { GameOver, PauseMenu } from "./components/Menus";
import { StartScreen } from "./components/StartScreen";
import { ParentAccount } from "./components/ParentAccount";
import { supabase } from "./auth/supabase";
import { getSandboxCustomerId, hasPremiumAccess, initializeParentBilling, openSandboxPaywall } from "./billing/revenuecat";
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
function awardAdventureStars(previous: number[], level: number, score: number): number[] {
  const stars = score >= 800 ? 3 : score >= 300 ? 2 : 1;
  return previous.map((old, index) => index === level ? Math.max(old, stars) : old);
}

type Phase = "bamboo" | "forest" | "farm" | "galaxy" | "shape" | "color" | "start" | "playing" | "paused" | "over" | "count" | "pattern" | "creator" | "together" | "find" | "music";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [phase, setPhase] = useState<Phase>("start");
  const [lockedWorld, setLockedWorld] = useState<number | null>(null);
  // Fail closed until RevenueCat verifies a premium entitlement.
  const [premiumActive, setPremiumActive] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingChecking, setBillingChecking] = useState(true);
  const [billingError, setBillingError] = useState("");
  const [parentSignedIn, setParentSignedIn] = useState(false);
  const [membershipMessage, setMembershipMessage] = useState("");
  const paywallTargetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => { if (active) setParentSignedIn(Boolean(data.user)); });
    initializeParentBilling().then(() => hasPremiumAccess()).then(enabled => { if (active) setPremiumActive(enabled); })
      .catch((error: unknown) => { if (active) setBillingError(`Subscription check failed: ${error instanceof Error ? error.message : String(error)}`); })
      .finally(() => { if (active) setBillingChecking(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setParentSignedIn(Boolean(session?.user));
        // RevenueCat is configured once per page load. Recreate it with the verified parent identity.
        void supabase.auth.getUser().then(({ data }) => {
          const next = data.user ? `niko_parent_${data.user.id}` : null;
          const current = getSandboxCustomerId();
          if ((next && current !== next) || (!next && current.startsWith("niko_parent_"))) window.location.reload();
        });
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  const restoreSandboxAccess = async () => {
    if (billingBusy) return;
    if (!parentSignedIn) { setBillingError("Sign in with your parent email first, then check your existing subscription."); return; }
    setBillingBusy(true);
    setBillingError("");
    setMembershipMessage("");
    try {
      await initializeParentBilling();
      const enabled = await hasPremiumAccess();
      setPremiumActive(enabled);
      if (enabled) {
        setMembershipMessage("Your Premium membership is active. Worlds 2–10 are available.");
        setLockedWorld(null);
      } else {
        setMembershipMessage("No active Premium membership was found for this parent account. World 1 is free, and you can start a new subscription below.");
      }
    } catch (error) {
      setBillingError(`Subscription check failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBillingBusy(false);
    }
  };
  const beginSandboxCheckout = async () => {
    if (!paywallTargetRef.current || billingBusy) return;
    if (!parentSignedIn) { setBillingError("Sign in with your parent email before starting checkout."); return; }
    setBillingBusy(true);
    setBillingError("");
    try {
      await initializeParentBilling();
      const enabled = await openSandboxPaywall(paywallTargetRef.current);
      setPremiumActive(enabled || await hasPremiumAccess());
      if (enabled) setLockedWorld(null);
    } catch {
      setBillingError("Sandbox checkout was not completed. Please try again.");
    } finally {
      setBillingBusy(false);
    }
  };
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
  const lauryVoiceRef = useRef<HTMLAudioElement | null>(null);
  const songRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  // iOS Safari does not reliably support changing HTMLAudioElement.volume.
  // Route music through a Web Audio gain node for real mobile fades.
  const musicContextRef = useRef<AudioContext | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const musicLevelRef = useRef(0);
  const setMusicLevel = (level: number) => {
    const value = Math.max(0, Math.min(0.18, level));
    musicLevelRef.current = value;
    if (musicGainRef.current) musicGainRef.current.gain.value = value;
    else if (songRef.current) songRef.current.volume = value;
  };
  const cancelFade = () => {
    if (fadeFrameRef.current !== null) cancelAnimationFrame(fadeFrameRef.current);
    fadeFrameRef.current = null;
  };
  const stopSong = () => {
    cancelFade();
    songRef.current?.pause();
    songRef.current = null;
  };
  const fadeSong = (direction: "in" | "out", duration: number) => {
    cancelFade();
    const song = songRef.current;
    if (!song) return;
    if (direction === "in" && (!settingsRef.current.music || settingsRef.current.quiet || lauryVoiceRef.current)) return;
    const from = musicLevelRef.current;
    const to = direction === "in" ? 0.18 : 0;
    const start = performance.now();
    if (direction === "in") void song.play().catch(() => {});
    const tick = (now: number) => {
      if (songRef.current !== song) return;
      const t = Math.min(1, (now - start) / duration);
      setMusicLevel(from + (to - from) * t);
      if (t < 1) fadeFrameRef.current = requestAnimationFrame(tick);
      else {
        fadeFrameRef.current = null;
        if (direction === "out" && (phaseRef.current === "over" || phaseRef.current === "start" || phaseRef.current === "paused")) song.pause();
      }
    };
    fadeFrameRef.current = requestAnimationFrame(tick);
  };
  const resumeSong = () => {
    if (songRef.current && settingsRef.current.music && !settingsRef.current.quiet && (phaseRef.current === "playing" || phaseRef.current === "color" || phaseRef.current === "shape" || phaseRef.current === "galaxy" || phaseRef.current === "farm" || phaseRef.current === "forest" || phaseRef.current === "bamboo") && !lauryVoiceRef.current)
      fadeSong("in", 2000);
  };
  const [laurySpeaking, setLaurySpeaking] = useState(false);

  const stopLaury = useCallback(() => {
    const clip = lauryVoiceRef.current;
    if (clip) { clip.pause(); clip.onended = null; clip.onerror = null; lauryVoiceRef.current = null; }
    setLaurySpeaking(false);
  }, []);

  const playLaury = useCallback((world: number) => {
    stopLaury();
    if (!settingsRef.current.sound) { resumeSong(); return; }
    audio.stopMusic();
    cancelFade();
    setMusicLevel(0);
    const clip = new Audio(`${import.meta.env.BASE_URL}audio/world-${String(world + 1).padStart(2, "0")}-intro.mp3`);
    lauryVoiceRef.current = clip;
    setLaurySpeaking(true);
    const finish = () => {
      if (lauryVoiceRef.current !== clip) return;
      lauryVoiceRef.current = null;
      setLaurySpeaking(false);
      if (songRef.current && settingsRef.current.music && !settingsRef.current.quiet && (phaseRef.current === "playing" || phaseRef.current === "color" || phaseRef.current === "shape" || phaseRef.current === "galaxy" || phaseRef.current === "farm" || phaseRef.current === "forest" || phaseRef.current === "bamboo")) fadeSong("in", 2000);
    };
    clip.onended = finish;
    clip.onerror = finish;
    void clip.play().catch(finish);
  }, [stopLaury]);

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
        fadeSong("out", 3000);
        setResult(r);
        overAt.current = performance.now();
        setPhase("over");
      },
    });
    engine.setFriend(settingsRef.current.friend);
    engine.setOptions({ calm: settingsRef.current.calm, slow: settingsRef.current.slow });
    engineRef.current = engine;
    return () => {
      stopSong();
      engine.destroy();
      engineRef.current = null;
      audio.stopMusic();
      void musicContextRef.current?.close().catch(() => {});
      musicContextRef.current = null;
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
    audio.soundOn = settings.sound && !settings.quiet;
    audio.musicOn = settings.music && !settings.quiet;
    audio.stopMusic();
    if (!settings.music || settings.quiet) { cancelFade(); songRef.current?.pause(); }
    else resumeSong();
  }, [settings]);

  const updateSettings = useCallback((s: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...s })), []);

  // --- actions
  const play = useCallback((adventure?: number) => {
    const game = adventure ?? selectedGameRef.current;
    if (game < 0 || game > 9) return;
    if (game > 0 && !premiumActive) { setLockedWorld(game + 1); return; }
    selectedGameRef.current = game;
    const e = engineRef.current;
    if (!e) return;
    const s = settingsRef.current;
    audio.unlock();
    audio.soundOn = s.sound && !s.quiet;
    audio.musicOn = s.music && !s.quiet;
    stopLaury();
    stopSong();
    audio.stopMusic();
    const song = new Audio(`${import.meta.env.BASE_URL}audio/world-${String(game + 1).padStart(2, "0")}-music.mp3`);
    song.loop = true;
    songRef.current = song;
    musicGainRef.current = null;
    musicLevelRef.current = 0;
    try {
      const context = musicContextRef.current ?? new AudioContext();
      musicContextRef.current = context;
      const source = context.createMediaElementSource(song);
      const gain = context.createGain();
      gain.gain.value = 0;
      source.connect(gain);
      gain.connect(context.destination);
      musicGainRef.current = gain;
      song.volume = 1;
      void context.resume().catch(() => {});
    } catch {
      // Browsers without Web Audio retain the original volume-based fade.
      song.volume = 0;
    }
    // Start within the Play tap; stay silent until Laury finishes.
    if (s.music && !s.quiet) void song.play().catch(() => {});
    setResult(null);
    // All choices on the new home screen use the original Relaxed catching game.
    e.setVisible(game > 5);
    e.setFriend(game === 1 ? "fish" : "kitty");
    e.setOptions({ calm: s.calm, slow: s.slow });
    e.setLearningGame(game);
    if (game > 5) e.start("relaxed");
    setPhase(game === 0 ? "color" : game === 1 ? "shape" : game === 2 ? "galaxy" : game === 3 ? "farm" : game === 4 ? "forest" : game === 5 ? "bamboo" : "playing");
    phaseRef.current = game === 0 ? "color" : game === 1 ? "shape" : game === 2 ? "galaxy" : game === 3 ? "farm" : game === 4 ? "forest" : game === 5 ? "bamboo" : "playing";
    playLaury(game);
  }, [playLaury, stopLaury, premiumActive]);

  const restartFromOver = useCallback(() => {
    if (performance.now() - overAt.current < 450) return; // avoid accidental taps carried over from gameplay
    play();
  }, [play]);

  const pause = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    engineRef.current?.pause();
    stopLaury();
    songRef.current?.pause();
    audio.stopMusic();
    setPhase("paused");
  }, [stopLaury]);

  const resume = useCallback(() => {
    if (phaseRef.current !== "paused") return;
    engineRef.current?.resume();
    setPhase("playing");
    if (settingsRef.current.music && !settingsRef.current.quiet && songRef.current) void songRef.current.play().catch(() => {});
  }, []);

  const home = useCallback(() => {
    engineRef.current?.goHome();
    engineRef.current?.setVisible(true);
    stopLaury();
    stopSong();
    audio.stopMusic();
    setScores(loadScores());
    setPhase("start");
  }, [stopLaury]);

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
      } else if (p === "color" || p === "shape" || p === "galaxy" || p === "farm" || p === "forest") {
        if (k === "Escape") { e.preventDefault(); home(); }
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
      {phase === "playing" && settings.sound && <button type="button" onClick={() => playLaury(selectedGameRef.current)} aria-label="Hear Laury instructions again" className="absolute right-3 top-[max(6.5rem,calc(env(safe-area-inset-top)+5.75rem))] z-30 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-[#7750f7] text-xl text-white shadow-lg sm:left-4 sm:right-auto sm:top-28 sm:h-auto sm:w-auto sm:px-4 sm:py-2 sm:text-sm"><span className="sm:hidden" aria-hidden="true">{laurySpeaking ? "🔈" : "🔊"}</span><span className="hidden sm:inline">{laurySpeaking ? "🔊 Laury is speaking…" : "🔊 Hear Laury Again"}</span></button>}

      {phase === "bamboo" && <BambooListenWorld settings={settings} introPlaying={laurySpeaking} onQuestionAudioStart={() => { cancelFade(); setMusicLevel(0); }} onQuestionAudioEnd={() => { if (settingsRef.current.music && !settingsRef.current.quiet && phaseRef.current === "bamboo") fadeSong("in", 1200); }} onHome={home} onHearLaury={() => playLaury(5)} onInteract={resumeSong} onFinalAnswer={() => fadeSong("out", 3000)} onFinish={(score) => {
        stopLaury();
        setAdventureStars(previous => {
          const next = awardAdventureStars(previous, 5, score);
          try { localStorage.setItem(STAR_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
          return next;
        });
        setRank(-1);
        setLastId(null);
        setResult({ score, bestCombo: 10, caught: 10, mode: "relaxed", friend: "kitty", worldsVisited: 1 });
        overAt.current = performance.now();
        setPhase("over");
      }} />}

      {phase === "forest" && <ForestFeelingsWorld settings={settings} onHome={home} onHearLaury={() => playLaury(4)} onInteract={resumeSong} onFinalAnswer={() => fadeSong("out", 3000)} onFinish={(score) => {
        stopLaury();
        setAdventureStars(previous => {
          const next = awardAdventureStars(previous, 4, score);
          try { localStorage.setItem(STAR_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
          return next;
        });
        setRank(-1);
        setLastId(null);
        setResult({ score, bestCombo: 10, caught: 10, mode: "relaxed", friend: "kitty", worldsVisited: 1 });
        overAt.current = performance.now();
        setPhase("over");
      }} />}

      {phase === "farm" && <FarmMemoryWorld settings={settings} onHome={home} onHearLaury={() => playLaury(3)} onInteract={resumeSong} onFinalAnswer={() => fadeSong("out", 3000)} onFinish={(score) => {
        stopLaury();
        setAdventureStars(previous => {
          const next = awardAdventureStars(previous, 3, score);
          try { localStorage.setItem(STAR_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
          return next;
        });
        setRank(-1);
        setLastId(null);
        setResult({ score, bestCombo: 10, caught: 10, mode: "relaxed", friend: "kitty", worldsVisited: 1 });
        overAt.current = performance.now();
        setPhase("over");
      }} />}

      {phase === "galaxy" && <GalaxyCountingWorld settings={settings} onHome={home} onHearLaury={() => playLaury(2)} onInteract={resumeSong} onFinalAnswer={() => fadeSong("out", 3000)} onFinish={(score) => {
        stopLaury();
        setAdventureStars(previous => {
          const next = awardAdventureStars(previous, 2, score);
          try { localStorage.setItem(STAR_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
          return next;
        });
        setRank(-1);
        setLastId(null);
        setResult({ score, bestCombo: 10, caught: 10, mode: "relaxed", friend: "kitty", worldsVisited: 1 });
        overAt.current = performance.now();
        setPhase("over");
      }} />}

      {phase === "shape" && <ShapeFinderWorld settings={settings} onHome={home} onHearLaury={() => playLaury(1)} onInteract={resumeSong} onFinalAnswer={() => fadeSong("out", 3000)} onFinish={(score) => {
        stopLaury();
        setAdventureStars(previous => {
          const next = awardAdventureStars(previous, 1, score);
          try { localStorage.setItem(STAR_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
          return next;
        });
        setRank(-1);
        setLastId(null);
        setResult({ score, bestCombo: 10, caught: 10, mode: "relaxed", friend: "fish", worldsVisited: 1 });
        overAt.current = performance.now();
        setPhase("over");
      }} />}

      {phase === "color" && <ColorMatchWorld settings={settings} onHome={home} onHearLaury={() => playLaury(0)} onFinalAnswer={() => fadeSong("out", 3000)} onFinish={(score) => {
        stopLaury();
        stopSong();
        setAdventureStars(previous => {
          const next = awardAdventureStars(previous, 0, score);
          try { localStorage.setItem(STAR_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
          return next;
        });
        setRank(-1);
        setLastId(null);
        setResult({ score, bestCombo: 10, caught: 10, mode: "relaxed", friend: "kitty", worldsVisited: 1 });
        overAt.current = performance.now();
        setPhase("over");
      }} />}

      {phase === "start" && (
        <StartScreen
          settings={settings}
          adventureStars={adventureStars}
          premiumActive={premiumActive}
          onLockedWorld={setLockedWorld}
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

      {lockedWorld !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#261a43]/70 p-4" role="dialog" aria-modal="true" aria-label="Parent area">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="text-5xl" aria-hidden="true">🔒</div>
            <h2 className="mt-2 text-2xl font-extrabold text-[#48316e]">Grown-ups only</h2>
            <p className="mt-3 text-[#58466d]">World {lockedWorld} is part of Niko's Games Premium. World 1 is always free.</p>
            <p className="mt-3 font-bold text-[#48316e]">$27/year · Worlds 2–10</p>
            {billingChecking && <p className="mt-2 text-sm text-[#665a75]">Checking your existing subscription…</p>}
            <p className="mt-3 text-sm font-bold text-[#665a75]">SANDBOX TEST ONLY — no real payment will be collected.</p>
            <p className="mt-2 text-xs text-[#665a75]">For parents and guardians only. Annual subscriptions renew until canceled. <a className="underline" href="/terms/" target="_blank" rel="noreferrer">Terms</a> · <a className="underline" href="/privacy/" target="_blank" rel="noreferrer">Privacy</a> · <a className="underline" href="/subscriptions/" target="_blank" rel="noreferrer">Cancellation</a></p>
            <ParentAccount />
            {parentSignedIn && !billingChecking && <section className="mt-3 rounded-2xl border border-[#d6c4f5] bg-[#faf7ff] p-3 text-left" aria-label="Membership status"><h3 className="font-extrabold text-[#48316e]">Your membership</h3><p className="mt-1 text-sm text-[#58466d]">Status: <strong>{premiumActive ? "Premium active" : "No active Premium access"}</strong></p><p className="mt-1 text-sm text-[#58466d]">{premiumActive ? "Worlds 2–10 are unlocked." : "World 1 is free. Worlds 2–10 require an active subscription."}</p><p className="mt-2 text-xs text-[#665a75]">Sandbox subscriptions may expire quickly. Canceled subscriptions retain access until their expiration. To cancel a sandbox test subscription, use the RevenueCat dashboard. Self-service cancellation for real customers will be added before launch.</p></section>}
            {parentSignedIn ? (
              <>
                <p className="mt-3 text-sm font-semibold text-[#48316e]">Step 2: Check your subscription before purchasing.</p>
                <button type="button" disabled={billingBusy || billingChecking} className="mt-3 w-full rounded-2xl border-2 border-[#7750f7] bg-white px-5 py-3 font-bold text-[#7750f7] disabled:opacity-60" onClick={restoreSandboxAccess}>{billingBusy ? "Checking subscription…" : "Already subscribed? Check access"}</button>
                {!premiumActive && <button type="button" disabled={billingBusy || billingChecking} className="mt-3 w-full rounded-2xl bg-[#7750f7] px-5 py-3 font-bold text-white disabled:opacity-60" onClick={beginSandboxCheckout}>{billingBusy ? "Opening sandbox checkout…" : "Grown-up: Test $27/year checkout"}</button>}
              </>
            ) : (
              <p className="mt-3 text-sm font-semibold text-[#48316e]">Step 1: Sign in above with your parent email. We’ll check your subscription before offering checkout.</p>
            )}
            <div ref={paywallTargetRef} className="mt-3" />
            {membershipMessage && <p role="status" className="mt-2 text-sm text-[#48316e]">{membershipMessage}</p>}
            {billingError && <p role="alert" className="mt-2 text-sm text-red-700">{billingError}</p>}
            <p className="mt-3 break-all rounded-xl bg-[#f4f0ff] p-3 text-left text-xs text-[#58466d]">RevenueCat sandbox customer ID: <strong>{getSandboxCustomerId()}</strong></p>
            <button type="button" className="mt-5 w-full rounded-2xl bg-[#7750f7] px-5 py-3 font-bold text-white" onClick={() => setLockedWorld(null)}>Back to free play</button>
          </div>
        </div>
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
          worldNumber={selectedGameRef.current + 1}
          earnedStars={adventureStars[selectedGameRef.current] || 1}
          calm={settings.calm}
          onNextWorld={selectedGameRef.current < 9 ? () => play(selectedGameRef.current + 1) : null}
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
