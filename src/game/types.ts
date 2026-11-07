export type FriendKind = "niko" | "bunny" | "kitty" | "fish" | "bear" | "frog";
export type GameMode = "relaxed" | "adventure" | "cove" | "count" | "pattern" | "creator" | "together" | "find" | "music";

export interface FriendInfo {
  kind: FriendKind;
  name: string;
  body: string;
  belly: string;
  dark: string;
  inner: string;
}

export const FRIENDS: FriendInfo[] = [
  { kind: "niko", name: "Niko", body: "#ffab5e", belly: "#fff1d9", dark: "#d97a37", inner: "#ffb3a7" },
  { kind: "bunny", name: "Bun-Bun", body: "#fdf2f8", belly: "#ffffff", dark: "#d9a8c2", inner: "#ffb3cf" },
  { kind: "kitty", name: "Mochi", body: "#ffc178", belly: "#fff1dc", dark: "#d98a3d", inner: "#ffb3a7" },
  { kind: "fish", name: "Finn", body: "#ffae65", belly: "#ffe5b0", dark: "#e17a46", inner: "#ff7e8c" },
  { kind: "bear", name: "Honey", body: "#c98f5e", belly: "#f3d3ae", dark: "#8d5a33", inner: "#f2b8a0" },
  { kind: "frog", name: "Pip", body: "#86d98a", belly: "#dcf7c9", dark: "#4fa257", inner: "#ffb3c1" },
];

export interface Settings {
  sound: boolean;
  music: boolean;
  calm: boolean; // no shake / flashes, fewer particles
  slow: boolean; // slower pace
  quiet: boolean; // mute songs and effects, keep Laury's instructions
  playerName: string;
  friend: FriendKind;
  mode: GameMode;
}

export interface HudState {
  score: number;
  hearts: number;
  timeLeft: number;
  combo: number;
  multiplier: number;
  world: string;
  mode: GameMode;
}

export interface GameResult {
  score: number;
  bestCombo: number;
  caught: number;
  mode: GameMode;
  friend: FriendKind;
  worldsVisited: number;
}

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  friend: FriendKind;
  mode: GameMode;
  date: number;
}

export interface World {
  name: string;
  skyTop: string;
  skyBottom: string;
  hillBack: string;
  hillFront: string;
  ground: string;
  celestial: "sun" | "moon";
  decor: "flowers" | "waves" | "twinkles" | "candy";
}

export const WORLDS: World[] = [
  { name: "Sunny Meadow", skyTop: "#7cc8ff", skyBottom: "#d9f1ff", hillBack: "#a6e39b", hillFront: "#79cf72", ground: "#5fb85a", celestial: "sun", decor: "flowers" },
  { name: "Sandy Beach", skyTop: "#6fd2ef", skyBottom: "#fff1c9", hillBack: "#58bde0", hillFront: "#f7dd9b", ground: "#efcd7c", celestial: "sun", decor: "waves" },
  { name: "Starry Night", skyTop: "#27306b", skyBottom: "#6b62b8", hillBack: "#4b4f9a", hillFront: "#3a3f86", ground: "#2e3374", celestial: "moon", decor: "twinkles" },
  { name: "Candy Clouds", skyTop: "#ffb3dc", skyBottom: "#fff0f8", hillBack: "#ffd1ea", hillFront: "#c9b6ff", ground: "#b39dfa", celestial: "sun", decor: "candy" },
];

export const CATCHES_PER_WORLD = 20;
export const MAX_LEVEL = 6;
export const RELAXED_TIME = 90;
export const MAX_HEARTS = 3;
