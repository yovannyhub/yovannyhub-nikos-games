import type { ScoreEntry, Settings } from "./types";

const SETTINGS_KEY = "nikos-games-settings-v1";
const SCORES_KEY = "nikos-games-scores-v1";
const MAX_SCORES = 8;

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function loadSettings(): Settings {
  const defaults: Settings = {
    sound: true,
    music: true,
    calm: prefersReducedMotion(),
    slow: false,
    quiet: false,
    playerName: "",
    friend: "niko",
    mode: "relaxed",
  };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ScoreEntry[];
    return Array.isArray(arr) ? arr.slice(0, MAX_SCORES) : [];
  } catch {
    return [];
  }
}

/** Adds a score and returns { scores, rank } where rank is 0-based index or -1 if not on the table. */
export function addScore(entry: Omit<ScoreEntry, "id" | "date">): { scores: ScoreEntry[]; rank: number; id: string } {
  const id = Math.random().toString(36).slice(2, 10);
  const full: ScoreEntry = { ...entry, id, date: Date.now() };
  const scores = loadScores();
  scores.push(full);
  scores.sort((a, b) => b.score - a.score || a.date - b.date);
  const trimmed = scores.slice(0, MAX_SCORES);
  const rank = trimmed.findIndex((s) => s.id === id);
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
  return { scores: trimmed, rank, id };
}

export function clearScores() {
  try {
    localStorage.removeItem(SCORES_KEY);
  } catch {
    /* ignore */
  }
}
