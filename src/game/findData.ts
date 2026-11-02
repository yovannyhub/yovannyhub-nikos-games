import type { CountItem } from "../components/ItemPreview";
import type { FriendKind } from "./types";

export type FindKind = CountItem | "butterfly" | FriendKind;

export interface FindThing {
  id: string;
  kind: FindKind;
  /** unit coordinates 0..1 within the scene */
  x: number;
  y: number;
  size: number;
  rot: number;
}

export interface FindSceneInfo {
  key: "garden" | "meadow" | "party";
  name: string;
  icon: string;
  paper: string;
  sky: string;
  hill: string;
}

export const FIND_SCENES: FindSceneInfo[] = [
  { key: "garden", name: "Berry Garden", icon: "🌷", paper: "#fffdf7", sky: "#eaf7ff", hill: "#c9edb9" },
  { key: "meadow", name: "Butterfly Meadow", icon: "🦋", paper: "#fdf3ff", sky: "#fdeeff", hill: "#d9f2c2" },
  { key: "party", name: "Moonlight Party", icon: "🌙", paper: "#f2f0ff", sky: "#e6e2ff", hill: "#cfc9f2" },
];

export const THINGS: FindThing[] = [
  // Berry Garden — strawberries, blueberries, hearts and stars tucked among the plants
  { id: "g1", kind: "strawberry", x: 0.1, y: 0.69, size: 0.088, rot: -0.08 },
  { id: "g2", kind: "blueberry", x: 0.19, y: 0.28, size: 0.07, rot: 0 },
  { id: "g3", kind: "heart", x: 0.31, y: 0.22, size: 0.062, rot: 0.1 },
  { id: "g4", kind: "star", x: 0.47, y: 0.14, size: 0.06, rot: 0.2 },
  { id: "g5", kind: "strawberry", x: 0.49, y: 0.74, size: 0.095, rot: 0.06 },
  { id: "g6", kind: "blueberry", x: 0.63, y: 0.27, size: 0.072, rot: 0 },
  { id: "g7", kind: "star", x: 0.77, y: 0.37, size: 0.07, rot: -0.1 },
  { id: "g8", kind: "heart", x: 0.9, y: 0.24, size: 0.058, rot: 0.15 },
  { id: "g9", kind: "blueberry", x: 0.86, y: 0.76, size: 0.086, rot: 0 },
  { id: "g10", kind: "strawberry", x: 0.25, y: 0.44, size: 0.06, rot: 0.2 },
  { id: "g11", kind: "heart", x: 0.68, y: 0.62, size: 0.062, rot: -0.1 },
  { id: "g12", kind: "star", x: 0.94, y: 0.55, size: 0.055, rot: 0.3 },
  { id: "g13", kind: "blueberry", x: 0.38, y: 0.06, size: 0.06, rot: 0 },
  { id: "g14", kind: "heart", x: 0.05, y: 0.44, size: 0.05, rot: 0.2 },
  { id: "g15", kind: "strawberry", x: 0.74, y: 0.9, size: 0.07, rot: 0.1 },
  { id: "g16", kind: "star", x: 0.57, y: 0.43, size: 0.052, rot: -0.2 },
  { id: "g17", kind: "blueberry", x: 0.42, y: 0.88, size: 0.075, rot: 0 },
  { id: "g18", kind: "heart", x: 0.96, y: 0.87, size: 0.06, rot: 0.1 },

  // Butterfly Meadow — friends, butterflies and treats
  { id: "m1", kind: "bunny", x: 0.13, y: 0.68, size: 0.17, rot: -0.05 },
  { id: "m2", kind: "butterfly", x: 0.3, y: 0.3, size: 0.1, rot: 0.15 },
  { id: "m3", kind: "star", x: 0.47, y: 0.24, size: 0.065, rot: 0.2 },
  { id: "m4", kind: "kitty", x: 0.72, y: 0.7, size: 0.17, rot: 0.06 },
  { id: "m5", kind: "butterfly", x: 0.88, y: 0.28, size: 0.095, rot: -0.15 },
  { id: "m6", kind: "blueberry", x: 0.25, y: 0.86, size: 0.085, rot: 0 },
  { id: "m7", kind: "heart", x: 0.42, y: 0.6, size: 0.075, rot: 0.15 },
  { id: "m8", kind: "strawberry", x: 0.56, y: 0.86, size: 0.09, rot: -0.1 },
  { id: "m9", kind: "butterfly", x: 0.6, y: 0.42, size: 0.07, rot: 0.25 },
  { id: "m10", kind: "star", x: 0.91, y: 0.66, size: 0.075, rot: 0.1 },
  { id: "m11", kind: "frog", x: 0.33, y: 0.47, size: 0.13, rot: 0.08 },
  { id: "m12", kind: "heart", x: 0.08, y: 0.36, size: 0.06, rot: -0.1 },
  { id: "m13", kind: "bear", x: 0.05, y: 0.9, size: 0.12, rot: -0.05 },
  { id: "m14", kind: "strawberry", x: 0.79, y: 0.14, size: 0.06, rot: 0.2 },
  { id: "m15", kind: "blueberry", x: 0.51, y: 0.08, size: 0.055, rot: 0 },
  { id: "m16", kind: "heart", x: 0.93, y: 0.9, size: 0.07, rot: 0.1 },
  { id: "m17", kind: "star", x: 0.18, y: 0.16, size: 0.05, rot: -0.2 },
  { id: "m18", kind: "butterfly", x: 0.36, y: 0.92, size: 0.06, rot: 0.1 },

  // Moonlight Party — Niko's pals, stars, treats and butterflies in the evening garden
  { id: "p1", kind: "niko", x: 0.18, y: 0.66, size: 0.2, rot: 0.04 },
  { id: "p2", kind: "bunny", x: 0.82, y: 0.66, size: 0.18, rot: -0.05 },
  { id: "p3", kind: "star", x: 0.4, y: 0.15, size: 0.07, rot: 0.2 },
  { id: "p4", kind: "star", x: 0.56, y: 0.28, size: 0.06, rot: -0.2 },
  { id: "p5", kind: "star", x: 0.9, y: 0.3, size: 0.055, rot: 0.1 },
  { id: "p6", kind: "butterfly", x: 0.32, y: 0.42, size: 0.085, rot: 0.2 },
  { id: "p7", kind: "butterfly", x: 0.66, y: 0.5, size: 0.075, rot: -0.15 },
  { id: "p8", kind: "heart", x: 0.5, y: 0.72, size: 0.075, rot: 0.1 },
  { id: "p9", kind: "heart", x: 0.09, y: 0.28, size: 0.055, rot: -0.1 },
  { id: "p10", kind: "strawberry", x: 0.28, y: 0.86, size: 0.08, rot: 0.1 },
  { id: "p11", kind: "blueberry", x: 0.72, y: 0.9, size: 0.075, rot: 0 },
  { id: "p12", kind: "kitty", x: 0.47, y: 0.58, size: 0.13, rot: 0.06 },
  { id: "p13", kind: "frog", x: 0.95, y: 0.87, size: 0.1, rot: -0.08 },
  { id: "p14", kind: "heart", x: 0.12, y: 0.88, size: 0.06, rot: 0.15 },
  { id: "p15", kind: "blueberry", x: 0.62, y: 0.08, size: 0.05, rot: 0 },
  { id: "p16", kind: "strawberry", x: 0.88, y: 0.12, size: 0.05, rot: -0.1 },
  { id: "p17", kind: "star", x: 0.15, y: 0.47, size: 0.05, rot: 0.3 },
  { id: "p18", kind: "butterfly", x: 0.76, y: 0.3, size: 0.06, rot: 0.1 },
];

export function labelFor(kind: FindKind): string {
  if (kind === "butterfly") return "butterfly";
  if (kind === "bunny") return "Bun-Bun";
  if (kind === "kitty") return "Mochi the kitty";
  if (kind === "bear") return "Honey the bear";
  if (kind === "frog") return "Pip the frog";
  if (kind === "niko") return "Niko";
  if (kind === "strawberry") return "strawberry";
  if (kind === "blueberry") return "blueberry";
  if (kind === "star") return "star";
  return "heart";
}

export const SCENE_BY_KEY = Object.fromEntries(FIND_SCENES.map((s) => [s.key, s])) as Record<string, FindSceneInfo>;
