// Simple, chunky shapes for the Cozy Creator colouring garden.
// Each shape is authored in a 100 x 100 box and scaled to fit.

export interface Shape {
  id: string;
  d: string;
  /** optional line details drawn on top of the fill (always dark, never coloured) */
  details?: string;
  base: string;
  /** where the shape naturally sits in the scene, 0..1 */
  x: number;
  y: number;
  scale: number;
}

export const PALETTE = [
  "#ff7ab6",
  "#ff9f4d",
  "#ffd23f",
  "#8fe08a",
  "#5fd6c6",
  "#7ad7ff",
  "#7c5cff",
  "#c9a3ff",
  "#ff5a6e",
  "#fff1d9",
  "#b8926a",
  "#8a6be0",
];

export const PAPER = ["#fffdf7", "#fdf3ff", "#f0fbf3", "#eef8ff"];

export const SCENES = [
  { key: "garden", name: "Flower Garden", icon: "🌸", paper: "#fffdf7", sky: "#eaf7ff", hill: "#c9edb9" },
  { key: "meadow", name: "Butterfly Meadow", icon: "🦋", paper: "#fdf3ff", sky: "#fdeeff", hill: "#e6f7cf" },
  { key: "night", name: "Moonlight Glade", icon: "🌙", paper: "#f2f0ff", sky: "#e6e2ff", hill: "#cfc9f2" },
  { key: "pond", name: "Puddle Park", icon: "💧", paper: "#f0fbf3", sky: "#e8f8ff", hill: "#bfead9" },
] as const;

export type SceneKey = (typeof SCENES)[number]["key"];

export const SHAPES: Record<SceneKey, Shape[]> = {
  garden: [
    { id: "g-sun", d: "M50 14a20 20 0 1 0 0.1 0Z", base: "#ffe9a8", x: 0.8, y: 0.16, scale: 0.13 },
    { id: "g-cloud", d: "M18 60c-8 0-12-7-8-13 3-5 9-6 14-3 2-9 14-12 20-5 8-4 18 3 16 12 6 1 8 8 3 12H20Z", base: "#f4f8ff", x: 0.22, y: 0.16, scale: 0.16 },
    { id: "g-cloud2", d: "M18 60c-8 0-12-7-8-13 3-5 9-6 14-3 2-9 14-12 20-5 8-4 18 3 16 12 6 1 8 8 3 12H20Z", base: "#f4f8ff", x: 0.62, y: 0.1, scale: 0.12 },
    { id: "g-flower1", d: "M50 18c10 0 16 8 15 16 10-2 18 6 16 15-2 9-12 13-20 9 2 10-7 18-16 16-9-2-13-11-10-19-10 2-18-6-16-15 2-8 11-12 19-10-1-7 4-12 12-12Z", details: "M50 40a10 10 0 1 0 0.1 0Z", base: "#ffc2da", x: 0.18, y: 0.68, scale: 0.24 },
    { id: "g-flower2", d: "M50 18c10 0 16 8 15 16 10-2 18 6 16 15-2 9-12 13-20 9 2 10-7 18-16 16-9-2-13-11-10-19-10 2-18-6-16-15 2-8 11-12 19-10-1-7 4-12 12-12Z", details: "M50 40a10 10 0 1 0 0.1 0Z", base: "#fff0b3", x: 0.45, y: 0.76, scale: 0.2 },
    { id: "g-flower3", d: "M50 18c10 0 16 8 15 16 10-2 18 6 16 15-2 9-12 13-20 9 2 10-7 18-16 16-9-2-13-11-10-19-10 2-18-6-16-15 2-8 11-12 19-10-1-7 4-12 12-12Z", details: "M50 40a10 10 0 1 0 0.1 0Z", base: "#d9ccff", x: 0.72, y: 0.62, scale: 0.27 },
    { id: "g-flower4", d: "M50 18c10 0 16 8 15 16 10-2 18 6 16 15-2 9-12 13-20 9 2 10-7 18-16 16-9-2-13-11-10-19-10 2-18-6-16-15 2-8 11-12 19-10-1-7 4-12 12-12Z", details: "M50 40a10 10 0 1 0 0.1 0Z", base: "#ffb3a7", x: 0.88, y: 0.8, scale: 0.17 },
    { id: "g-butterfly", d: "M50 48C36 48 22 38 24 26c2-11 16-12 26-4 10-8 24-7 26 4 2 12-12 22-26 22Zm0 0c-14 0-28 10-26 22 2 11 16 12 26 4 10 8 24 7 26-4 2-12-12-22-26-22Z", details: "M50 34v36", base: "#ffe066", x: 0.62, y: 0.42, scale: 0.13 },
    { id: "g-mushroom", d: "M14 54C14 28 34 14 50 14s36 14 36 40H14Zm28 0h16v26c0 6-4 8-8 8s-8-2-8-8V54Z", base: "#ffb3a7", x: 0.34, y: 0.86, scale: 0.15 },
    { id: "g-snail", d: "M28 70a16 16 0 1 0 32 0c0-9-7-16-16-16-5-1-10 2-12 7M60 70c0 8 6 14 14 14h8c3 0 6-2 6-5s-3-4-6-4", details: "M44 54a8 8 0 1 0 0.1 0Z", base: "#ffe9a8", x: 0.82, y: 0.9, scale: 0.13 },
    { id: "g-star", d: "M50 12l10 24 26 3-20 17 6 26-22-14-22 14 6-26-20-17 26-3Z", base: "#fff3c4", x: 0.12, y: 0.36, scale: 0.09 },
  ],
  meadow: [
    { id: "m-butterfly1", d: "M50 48C36 48 22 38 24 26c2-11 16-12 26-4 10-8 24-7 26 4 2 12-12 22-26 22Zm0 0c-14 0-28 10-26 22 2 11 16 12 26 4 10 8 24 7 26-4 2-12-12-22-26-22Z", details: "M50 34v36", base: "#ffc2da", x: 0.5, y: 0.42, scale: 0.26 },
    { id: "m-butterfly2", d: "M50 48C36 48 22 38 24 26c2-11 16-12 26-4 10-8 24-7 26 4 2 12-12 22-26 22Zm0 0c-14 0-28 10-26 22 2 11 16 12 26 4 10 8 24 7 26-4 2-12-12-22-26-22Z", details: "M50 34v36", base: "#ffe066", x: 0.78, y: 0.64, scale: 0.16 },
    { id: "m-butterfly3", d: "M50 48C36 48 22 38 24 26c2-11 16-12 26-4 10-8 24-7 26 4 2 12-12 22-26 22Zm0 0c-14 0-28 10-26 22 2 11 16 12 26 4 10 8 24 7 26-4 2-12-12-22-26-22Z", details: "M50 34v36", base: "#c9a3ff", x: 0.24, y: 0.7, scale: 0.15 },
    { id: "m-flower1", d: "M50 18c10 0 16 8 15 16 10-2 18 6 16 15-2 9-12 13-20 9 2 10-7 18-16 16-9-2-13-11-10-19-10 2-18-6-16-15 2-8 11-12 19-10-1-7 4-12 12-12Z", details: "M50 40a10 10 0 1 0 0.1 0Z", base: "#ffb3a7", x: 0.14, y: 0.88, scale: 0.18 },
    { id: "m-flower2", d: "M50 18c10 0 16 8 15 16 10-2 18 6 16 15-2 9-12 13-20 9 2 10-7 18-16 16-9-2-13-11-10-19-10 2-18-6-16-15 2-8 11-12 19-10-1-7 4-12 12-12Z", details: "M50 40a10 10 0 1 0 0.1 0Z", base: "#ffe9a8", x: 0.46, y: 0.9, scale: 0.16 },
    { id: "m-flower3", d: "M50 18c10 0 16 8 15 16 10-2 18 6 16 15-2 9-12 13-20 9 2 10-7 18-16 16-9-2-13-11-10-19-10 2-18-6-16-15 2-8 11-12 19-10-1-7 4-12 12-12Z", details: "M50 40a10 10 0 1 0 0.1 0Z", base: "#d9ccff", x: 0.82, y: 0.9, scale: 0.2 },
    { id: "m-sun", d: "M50 14a20 20 0 1 0 0.1 0Z", base: "#fff0b3", x: 0.16, y: 0.14, scale: 0.12 },
    { id: "m-cloud", d: "M18 60c-8 0-12-7-8-13 3-5 9-6 14-3 2-9 14-12 20-5 8-4 18 3 16 12 6 1 8 8 3 12H20Z", base: "#f4f8ff", x: 0.6, y: 0.12, scale: 0.15 },
    { id: "m-mushroom", d: "M14 54C14 28 34 14 50 14s36 14 36 40H14Zm28 0h16v26c0 6-4 8-8 8s-8-2-8-8V54Z", base: "#ffd1e0", x: 0.34, y: 0.78, scale: 0.11 },
    { id: "m-heart", d: "M50 88C18 66 8 48 18 32c8-12 24-12 32 0 8-12 24-12 32 0 10 16 0 34-32 56Z", base: "#ffb3c7", x: 0.88, y: 0.4, scale: 0.1 },
  ],
  night: [
    { id: "n-moon", d: "M62 12a38 38 0 1 0 0 76 30 30 0 1 1 0-76Z", base: "#fff3c4", x: 0.76, y: 0.18, scale: 0.16 },
    { id: "n-star1", d: "M50 12l10 24 26 3-20 17 6 26-22-14-22 14 6-26-20-17 26-3Z", base: "#ffe066", x: 0.2, y: 0.16, scale: 0.1 },
    { id: "n-star2", d: "M50 12l10 24 26 3-20 17 6 26-22-14-22 14 6-26-20-17 26-3Z", base: "#fff3c4", x: 0.42, y: 0.1, scale: 0.07 },
    { id: "n-star3", d: "M50 12l10 24 26 3-20 17 6 26-22-14-22 14 6-26-20-17 26-3Z", base: "#d9ccff", x: 0.58, y: 0.28, scale: 0.09 },
    { id: "n-star4", d: "M50 12l10 24 26 3-20 17 6 26-22-14-22 14 6-26-20-17 26-3Z", base: "#c9f0ff", x: 0.88, y: 0.42, scale: 0.06 },
    { id: "n-house", d: "M12 58h76v36H12Zm-6 2L50 14l44 46Z", details: "M40 94V72h20v22M24 66h10v12H24Z", base: "#c9a3ff", x: 0.32, y: 0.78, scale: 0.24 },
    { id: "n-cloud", d: "M18 60c-8 0-12-7-8-13 3-5 9-6 14-3 2-9 14-12 20-5 8-4 18 3 16 12 6 1 8 8 3 12H20Z", base: "#e6e2ff", x: 0.68, y: 0.5, scale: 0.13 },
    { id: "n-mushroom", d: "M14 54C14 28 34 14 50 14s36 14 36 40H14Zm28 0h16v26c0 6-4 8-8 8s-8-2-8-8V54Z", base: "#ffb3c7", x: 0.84, y: 0.86, scale: 0.14 },
    { id: "n-bush", d: "M8 74c-6 0-8-7-4-11-4-6 1-13 8-12-1-8 8-14 15-10 4-7 14-6 17 2 8-3 15 5 12 12 6 2 6 10 0 13 2 5-4 9-9 6-3 5-11 5-14 0-4 4-11 3-13-2-4 3-9 3-12 2Z", details: "M32 40c0 8 4 14 12 18M44 38c-2 8 0 14 6 20", base: "#b6d6ff", x: 0.1, y: 0.92, scale: 0.17 },
    { id: "n-owl", d: "M28 84c-8-10-10-26-6-38 4-12 16-20 28-20s24 8 28 20c4 12 2 28-6 38-12 8-32 8-44 0Z", details: "M38 46a7 7 0 1 0 0.1 0ZM62 46a7 7 0 1 0 0.1 0ZM46 58l4 6 4-6Z", base: "#c9a3ff", x: 0.56, y: 0.8, scale: 0.14 },
  ],
  pond: [
    { id: "p-pond", d: "M8 50c0-22 18-34 42-34s42 12 42 34-18 34-42 34S8 72 8 50Z", base: "#bfeaff", x: 0.5, y: 0.8, scale: 0.56 },
    { id: "p-lily", d: "M50 22c6 12 2 20-6 24-10 5-22 0-24-10-2-12 12-20 30-14Z", details: "M40 30l10 14", base: "#c9f0c0", x: 0.28, y: 0.82, scale: 0.16 },
    { id: "p-flower", d: "M50 18c10 0 16 8 15 16 10-2 18 6 16 15-2 9-12 13-20 9 2 10-7 18-16 16-9-2-13-11-10-19-10 2-18-6-16-15 2-8 11-12 19-10-1-7 4-12 12-12Z", details: "M50 40a10 10 0 1 0 0.1 0Z", base: "#ffc2da", x: 0.7, y: 0.78, scale: 0.16 },
    { id: "p-duck", d: "M40 66c-10 0-16-8-12-16 3-7 12-9 20-6 2-10 14-16 22-10 7 5 8 16 2 22 8 2 12 8 8 14-4 6-14 8-22 4-6 2-12 2-18-8Z", details: "M54 30a3 3 0 1 0 0.1 0Z", base: "#fff0b3", x: 0.78, y: 0.68, scale: 0.18 },
    { id: "p-fish", d: "M18 50c12-16 34-16 46 0-12 16-34 16-46 0Zm46 0 14-12v24Z", base: "#ffb3a7", x: 0.36, y: 0.9, scale: 0.13 },
    { id: "p-reeds", d: "M20 90V34c0-6 6-8 8-2v58Zm14 0V46c0-6 6-8 8-2v46Zm14 0V38c0-6 6-8 8-2v54Z", base: "#a8dc8f", x: 0.12, y: 0.7, scale: 0.16 },
    { id: "p-cloud", d: "M18 60c-8 0-12-7-8-13 3-5 9-6 14-3 2-9 14-12 20-5 8-4 18 3 16 12 6 1 8 8 3 12H20Z", base: "#f4f8ff", x: 0.24, y: 0.14, scale: 0.16 },
    { id: "p-sun", d: "M50 14a20 20 0 1 0 0.1 0Z", base: "#fff0b3", x: 0.82, y: 0.16, scale: 0.13 },
    { id: "p-snail", d: "M28 70a16 16 0 1 0 32 0c0-9-7-16-16-16-5-1-10 2-12 7M60 70c0 8 6 14 14 14h8c3 0 6-2 6-5s-3-4-6-4", details: "M44 54a8 8 0 1 0 0.1 0Z", base: "#fff0b3", x: 0.9, y: 0.9, scale: 0.12 },
    { id: "p-heart", d: "M50 88C18 66 8 48 18 32c8-12 24-12 32 0 8-12 24-12 32 0 10 16 0 34-32 56Z", base: "#ffb3c7", x: 0.5, y: 0.3, scale: 0.09 },
  ],
};
