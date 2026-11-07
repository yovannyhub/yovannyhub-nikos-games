import { audio } from "./audio";
import {
  drawBlueberry,
  drawCoveFlower,
  drawCoveWorld,
  drawFriend,
  drawGrumpyCloud,
  drawHeart,
  drawRainbowStar,
  drawStar,
  drawStrawberry,
  drawWorld,
  drawOceanWorld,
  drawGalaxyWorld,
  drawFarmWorld,
  drawForestWorld,
  drawBambooWorld,
  drawSnowWorld,
  drawSavannaWorld,
  drawDragonWorld,
  drawMagicWorld,
  heartPath,
  type Mood,
} from "./draw";
import {
  FRIENDS,
  MAX_HEARTS,
  CATCHES_PER_WORLD,
  MAX_LEVEL,
  RELAXED_TIME,
  WORLDS,
  type FriendInfo,
  type FriendKind,
  type GameMode,
  type GameResult,
  type HudState,
} from "./types";

type ItemKind = "star" | "berry" | "blue" | "rainbow" | "heart" | "cloud" | "redOrb" | "blueOrb" | "yellowOrb" | "circleShape" | "squareShape" | "triangleShape" | "starShape" | "oneGroup" | "twoGroup" | "threeGroup" | "memorySun" | "memoryMoon" | "memoryStar" | "feelingHappy" | "feelingSad" | "feelingCalm" | "listenBird" | "listenCat" | "listenDog" | "communicateWater" | "communicateFood" | "communicateHelp" | "routineWake" | "routineBrush" | "routineSleep" | "animalCow" | "animalDuck" | "animalFrog";

interface Item {
  kind: ItemKind;
  x: number;
  baseX: number;
  y: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  swayAmp: number;
  swayF: number;
  t: number;
  spawnT: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  shape: 0 | 1 | 2; // circle, star, heart
  rot: number;
  vr: number;
  g: number;
}

interface Floater {
  x: number;
  y: number;
  text: string;
  life: number;
  max: number;
  color: string;
  size: number;
}

interface Ring {
  x: number;
  y: number;
  r: number;
  maxR: number;
  life: number;
  max: number;
  color: string;
}

interface CoveFlower {
  x: number;
  y: number;
  color: number;
  born: number;
  seed: number;
}

interface Banner {
  text: string;
  sub: string;
  t: number;
  dur: number;
  color: string;
}

export type EngineState = "ready" | "playing" | "paused" | "ending" | "over";

export interface EngineCallbacks {
  onHud: (h: HudState) => void;
  onGameOver: (r: GameResult) => void;
}

const ITEM_COLORS: Record<ItemKind, string[]> = {
  star: ["#ffd23f", "#ffb000", "#fff3a6"],
  berry: ["#ff5a6e", "#ff9aa8", "#4fc26a"],
  blue: ["#6a83ff", "#a8b6ff", "#ffffff"],
  rainbow: ["#ff7ab6", "#ffd23f", "#7be08f", "#7ad7ff", "#a98bff"],
  heart: ["#ff6fa5", "#ffb3d1", "#ffffff"],
  cloud: ["#9aa4bf", "#c6cde0", "#7fc4ff"],
  redOrb: ["#ff5b68"], blueOrb: ["#428bff"], yellowOrb: ["#ffcf3b"],
  circleShape: ["#ff668c"], squareShape: ["#5f91ff"], triangleShape: ["#ffc44d"], starShape: ["#a875ef"], oneGroup: ["#ffd36c"], twoGroup: ["#ffd36c"], threeGroup: ["#ffd36c"], memorySun: ["#ffd34d"], memoryMoon: ["#c2b4ff"], memoryStar: ["#ff9dc6"], feelingHappy: ["#ffd46e"], feelingSad: ["#8ac9ef"], feelingCalm: ["#b8e9b3"], listenBird: ["#ffe8a8"], listenCat: ["#ffc4a6"], listenDog: ["#b7dcff"], communicateWater: ["#a8e5ff"], communicateFood: ["#ffe7a6"], communicateHelp: ["#ffc2d2"], routineWake: ["#ffe6a3"], routineBrush: ["#a9e6ff"], routineSleep: ["#c9b9f9"], animalCow: ["#f5e6c9"], animalDuck: ["#ffeb9e"], animalFrog: ["#a6e8ae"],
};

const ITEM_POINTS: Record<ItemKind, number> = { star: 10, berry: 15, blue: 10, rainbow: 50, heart: 20, cloud: 0, redOrb: 10, blueOrb: 10, yellowOrb: 10, circleShape: 10, squareShape: 10, triangleShape: 10, starShape: 10, oneGroup: 10, twoGroup: 10, threeGroup: 10, memorySun: 10, memoryMoon: 10, memoryStar: 10, feelingHappy: 10, feelingSad: 10, feelingCalm: 10, listenBird: 10, listenCat: 10, listenDog: 10, communicateWater: 10, communicateFood: 10, communicateHelp: 10, routineWake: 10, routineBrush: 10, routineSleep: 10, animalCow: 10, animalDuck: 10, animalFrog: 10 };

const COMBO_WORDS: Record<number, string> = { 5: "Nice!", 10: "Super!", 15: "Wow!", 20: "Amazing!", 30: "Superstar!" };

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cb: EngineCallbacks;
  W = 0;
  H = 0;
  dpr = 1;
  raf = 0;
  last = 0;
  time = 0;

  state: EngineState = "ready";
  mode: GameMode = "relaxed";
  learningGame = 0;
  colorMatches = 0;
  targetColor = 0;
  targetShape = 0;
  shapeMatches = 0;
  countingMatches = 0;
  targetCount = 1;
  memoryMatches = 0;
  targetMemory = 0;
  memoryRevealUntil = 0;
  feelingMatches = 0;
  targetFeeling = 0;
  listenMatches = 0;
  targetSound = 0;
  communicationMatches = 0;
  targetNeed = 0;
  routineMatches = 0;
  targetRoutine = 0;
  animalMatches = 0;
  targetAnimal = 0;
  challengeMatches = 0;
  challengeStage = 0;
  lastSpokenTarget = -1;
  speakTarget() {
    if (this.learningGame !== 5 || !audio.soundOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const word = ["bird", "cat", "dog"][this.targetSound];
    const msg = new SpeechSynthesisUtterance(`Find the ${word}!`);
    msg.rate = 0.82;
    msg.pitch = 1.1;
    msg.volume = 0.85;
    window.speechSynthesis.speak(msg);
  }
  setLearningGame(index: number) { this.learningGame = index; }
  friend: FriendInfo = FRIENDS[0];
  calm = false;
  slow = false;
  coarse = false;
  visible = true;

  // player
  px = 0;
  pvx = 0;
  targetX: number | null = null;
  squash = 0;
  squashV = 0;
  tilt = 0;
  mood: Mood = "idle";
  moodT = 0;
  blinkT = 2;
  blinkOn = 0;
  invuln = 0;
  dustT = 0;
  movedOnce = false;

  keys = { left: false, right: false };
  pointerId: number | null = null;

  items: Item[] = [];
  particles: Particle[] = [];
  floaters: Floater[] = [];
  rings: Ring[] = [];
  banner: Banner | null = null;
  coveFlowers: CoveFlower[] = [];
  coveTaps = 0;
  coveHintT = 0;
  lastMagic = -1;

  score = 0;
  hearts = MAX_HEARTS;
  combo = 0;
  bestCombo = 0;
  caught = 0;
  timeLeft = RELAXED_TIME;
  playT = 0;
  spawnT = 0;
  worldLevel = 0;
  worldIdx = 0;
  prevWorldIdx = 0;
  worldFade = 1;
  maxWorldLevel = 0;
  shake = 0;
  flash = 0;
  endT = 0;
  lastHudKey = "";

  constructor(canvas: HTMLCanvasElement, cb: EngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.cb = cb;
    try {
      this.coarse = window.matchMedia("(pointer: coarse)").matches;
    } catch {
      this.coarse = false;
    }
    this.resize();
    this.px = this.W / 2;
    window.addEventListener("resize", this.resize);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.clearInput);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerUp);
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.clearInput);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
  }

  // ------------------------------------------------------------ sizing
  get size() {
    return Math.max(30, Math.min(56, Math.min(this.W * 0.085, this.H * 0.075)));
  }
  get groundY() {
    return this.H - Math.max(50, Math.min(90, this.H * 0.1));
  }
  get py() {
    return this.groundY - this.size * 0.45;
  }

  resize = () => {
    const parent = this.canvas.parentElement;
    const w = parent ? parent.clientWidth : window.innerWidth;
    const h = parent ? parent.clientHeight : window.innerHeight;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = w;
    this.H = h;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.px = Math.max(this.size, Math.min(this.W - this.size, this.px || w / 2));
  };

  // ------------------------------------------------------------ input
  onKeyDown = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") {
      this.keys.left = true;
      this.targetX = null;
      this.movedOnce = true;
      e.preventDefault();
    } else if (k === "ArrowRight" || k === "d" || k === "D") {
      this.keys.right = true;
      this.targetX = null;
      this.movedOnce = true;
      e.preventDefault();
    }
  };
  onKeyUp = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") this.keys.left = false;
    else if (k === "ArrowRight" || k === "d" || k === "D") this.keys.right = false;
  };
  clearInput = () => {
    this.keys.left = false;
    this.keys.right = false;
    this.targetX = null;
    this.pointerId = null;
  };
  private pointerX(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return e.clientX - rect.left;
  }
  onPointerDown = (e: PointerEvent) => {
    if (this.state !== "playing") return;
    this.pointerId = e.pointerId;
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const x = this.pointerX(e);
    if (this.mode === "cove") {
      const rect = this.canvas.getBoundingClientRect();
      this.magicAt(x, e.clientY - rect.top);
    } else {
      this.targetX = x;
      this.movedOnce = true;
    }
    e.preventDefault();
  };
  onPointerMove = (e: PointerEvent) => {
    if (this.pointerId !== e.pointerId) return;
    const x = this.pointerX(e);
    if (this.mode === "cove") {
      if (this.state === "playing") {
        const rect = this.canvas.getBoundingClientRect();
        this.magicAt(x, e.clientY - rect.top, true);
      }
      return;
    }
    this.targetX = x;
  };
  onPointerUp = (e: PointerEvent) => {
    if (this.pointerId !== e.pointerId) return;
    this.pointerId = null;
    this.targetX = null;
  };

  // ------------------------------------------------------------ control API
  setFriend(kind: FriendKind) {
    this.friend = FRIENDS.find((f) => f.kind === kind) || FRIENDS[0];
  }
  setOptions(o: { calm: boolean; slow: boolean }) {
    this.calm = o.calm;
    this.slow = o.slow;
  }
  /** Skips all drawing/updates while a DOM-based game (Count With Niko) is on screen. */
  setVisible(v: boolean) {
    this.visible = v;
    if (v) this.last = 0;
  }

  start(mode: GameMode) {
    this.mode = mode;
    this.colorMatches = 0;
    this.targetColor = 0;
    this.targetShape = 0;
    this.shapeMatches = 0;
    this.countingMatches = 0;
    this.targetCount = 1;
    this.memoryMatches = 0;
    this.targetMemory = 0;
    this.memoryRevealUntil = 4.5;
    this.feelingMatches = 0;
    this.targetFeeling = 0;
    this.listenMatches = 0;
    this.targetSound = 0;
    this.communicationMatches = 0;
    this.targetNeed = 0;
    this.routineMatches = 0;
    this.targetRoutine = 0;
    this.animalMatches = 0;
    this.targetAnimal = 0;
    this.challengeMatches = 0;
    this.challengeStage = 0;
    this.items.length = 0;
    this.particles.length = 0;
    this.floaters.length = 0;
    this.rings.length = 0;
    this.score = 0;
    this.hearts = MAX_HEARTS;
    this.combo = 0;
    this.bestCombo = 0;
    this.caught = 0;
    this.timeLeft = RELAXED_TIME;
    this.playT = 0;
    this.spawnT = 0.9;
    this.worldLevel = 0;
    this.maxWorldLevel = 0;
    this.prevWorldIdx = this.worldIdx;
    this.worldIdx = this.learningGame === 1 ? 1 : this.learningGame === 2 ? 2 : this.learningGame === 3 ? 3 : 0;
    this.worldFade = this.prevWorldIdx === this.worldIdx ? 1 : 0;
    this.invuln = 0;
    this.shake = 0;
    this.flash = 0;
    this.px = this.W / 2;
    this.pvx = 0;
    this.targetX = null;
    this.movedOnce = false;
    this.mood = "happy";
    this.moodT = 0.6;
    this.state = "playing";
    this.lastHudKey = "";
    this.coveFlowers.length = 0;
    this.coveTaps = 0;
    this.coveHintT = 0;
    this.lastMagic = -1;
    if (mode === "cove") {
      this.showBanner("Calm Cove", "Tap or drag anywhere for a little magic", "#7c5cff", 3.4);
    } else {
      this.showBanner("Let's go!", mode === "relaxed" ? (this.learningGame === 9 ? "Niko’s Big Challenge!" : this.learningGame === 8 ? "Find the COW!" : this.learningGame === 7 ? "Find WAKE UP!" : this.learningGame === 6 ? "Find WATER!" : this.learningGame === 5 ? "Listen! Find the BIRD!" : this.learningGame === 4 ? "Find the HAPPY face!" : this.learningGame === 3 ? "Remember the picture!" : this.learningGame === 2 ? "Count the stars! Catch ONE!" : this.learningGame === 1 ? "Catch the CIRCLE!" : "Catch RED!") : "Catch stars, dodge grumpy clouds!", "#ff7ab6", 2.2);
      // a friendly first star falls right toward the player so the first catch happens fast
      this.spawnItem(this.learningGame === 0 ? "redOrb" : this.learningGame === 1 ? "circleShape" : this.learningGame === 2 ? "oneGroup" : this.learningGame === 3 ? "memorySun" : this.learningGame === 4 ? "feelingHappy" : this.learningGame === 5 ? "listenBird" : this.learningGame === 6 ? "communicateWater" : this.learningGame === 7 ? "routineWake" : this.learningGame === 8 ? "animalCow" : this.learningGame === 9 ? "redOrb" : "star", this.W / 2 + (Math.random() - 0.5) * this.size * 1.5, 1.25);
    }
    this.emitHud(true);
    if (this.learningGame === 5 && mode === "relaxed") this.speakTarget();
  }

  pause() {
    if (this.state === "playing") {
      this.state = "paused";
      this.clearInput();
    }
  }
  resume() {
    if (this.state === "paused") {
      this.state = "playing";
      this.last = performance.now();
    }
  }
  goHome() {
    this.state = "ready";
    this.items.length = 0;
    this.floaters.length = 0;
    this.coveFlowers.length = 0;
    this.banner = null;
    this.px = this.W / 2;
    this.mood = "idle";
  }

  // ------------------------------------------------------------ helpers
  get level() {
    return Math.min(MAX_LEVEL, this.worldLevel);
  }
  get multiplier() {
    return Math.min(3, 1 + Math.floor(this.combo / 10));
  }
  showBanner(text: string, sub: string, color: string, dur = 1.6) {
    this.banner = { text, sub, t: 0, dur, color };
  }

  /** Calm Cove: touch anywhere to grow something. No timer, no score, no losing. */
  magicAt(x: number, y: number, dragging = false) {
    if (this.state !== "playing" || this.mode !== "cove") return;
    if (this.time - this.lastMagic < (dragging ? 0.16 : 0.05)) return;
    this.lastMagic = this.time;
    const s = this.size;
    const px = Math.max(s * 0.5, Math.min(this.W - s * 0.5, x));
    const py = Math.max(s, Math.min(this.H - 8, y));
    this.coveHintT = 0;

    // tickling the friend makes them giggle
    if (Math.abs(px - this.px) < s * 1.05 && Math.abs(py - this.py) < s * 1.1) {
      this.mood = "happy";
      this.moodT = 0.7;
      this.squashV += 3.4;
      this.burst(this.px, this.py - s * 0.3, ["#ff9ec7", "#ffd76a", "#ffe3f1"], this.calm ? 6 : 12, 170);
      this.ring(this.px, this.py - s * 0.2, "#ffd1e6", s * 2.2);
      audio.giggle();
      return;
    }

    this.ring(px, py, "rgba(255,255,255,0.9)", s * 2.4);
    this.burst(px, py, ["#fff3a8", "#ffd76a", "#c9f7d8", "#ffffff"], this.calm ? 5 : 11, 120);
    // fireflies drift up from the water
    for (let i = 0; i < (this.calm ? 2 : 4); i++) {
      this.particles.push({
        x: px + (Math.random() - 0.5) * s * 1.6,
        y: py + (Math.random() - 0.5) * s * 0.6,
        vx: (Math.random() - 0.5) * 30,
        vy: -40 - Math.random() * 50,
        life: 1.6 + Math.random() * 0.8,
        max: 2.4,
        size: 2.5 + Math.random() * 2,
        color: "#fff6a3",
        shape: 0,
        rot: 0,
        vr: 0,
        g: -22,
      });
    }
    // flowers grow along the sand
    const gy = this.groundY;
    this.coveFlowers.push({
      x: px,
      y: Math.max(gy + 10, Math.min(this.H - 6, py + s * 0.5)),
      color: this.coveTaps % 5,
      born: this.time,
      seed: Math.random() * 10,
    });
    if (this.coveFlowers.length > 18) this.coveFlowers.shift();
    this.mood = "happy";
    this.moodT = 0.45;
    this.squashV += 1.6;
    audio.bloom(this.coveTaps % 10);
    this.coveTaps++;
  }

  emitHud(force = false) {
    const h: HudState = {
      score: this.score,
      hearts: this.hearts,
      timeLeft: Math.ceil(this.timeLeft),
      combo: this.combo,
      multiplier: this.multiplier,
      world: this.mode === "cove" ? "Calm Cove" : this.learningGame === 1 ? "Ocean World" : this.learningGame === 2 ? "Galaxy World" : this.learningGame === 3 ? "Happy Farm" : this.learningGame === 4 ? "Enchanted Forest" : this.learningGame === 5 ? "Bamboo World" : this.learningGame === 6 ? "Snow World" : this.learningGame === 7 ? "Savanna World" : this.learningGame === 8 ? "Dragon World" : this.learningGame === 9 ? "Magic World" : WORLDS[this.worldIdx].name,
      mode: this.mode,
    };
    const key = `${h.score}|${h.hearts}|${h.timeLeft}|${h.multiplier}|${h.world}|${h.combo}`;
    if (force || key !== this.lastHudKey) {
      this.lastHudKey = key;
      this.cb.onHud(h);
    }
  }

  spawnItem(kind: ItemKind, x?: number, speedMul = 1) {
    const s = this.size;
    const r = kind === "rainbow" ? s * 0.62 : kind === "cloud" ? s * 0.72 : kind === "heart" ? s * 0.5 : s * 0.5;
    const margin = r + 12;
    const bx = x ?? margin + Math.random() * (this.W - margin * 2);
    let speed = this.H * Math.min(0.62, 0.3 + this.level * 0.035);
    if (this.mode === "relaxed") speed *= 0.9;
    if (this.slow) speed *= 0.72;
    speed *= (0.88 + Math.random() * 0.24) * speedMul;
    if (kind === "cloud") speed *= 0.9;
    if (kind === "rainbow") speed *= 1.08;
    this.items.push({
      kind,
      x: bx,
      baseX: Math.max(margin, Math.min(this.W - margin, bx)),
      y: -r * 1.6,
      vy: speed,
      r,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 2,
      swayAmp: kind === "cloud" ? s * 0.25 : s * (0.1 + Math.random() * 0.25),
      swayF: 1 + Math.random() * 1.5,
      t: Math.random() * 10,
      spawnT: 0,
    });
  }

  chooseKind(): ItemKind {
    if (this.mode === "relaxed" && this.learningGame === 9) {
      const groups: ItemKind[][] = [["redOrb", "blueOrb", "yellowOrb"], ["circleShape", "squareShape", "triangleShape"], ["animalCow", "animalDuck", "animalFrog"]];
      const group = groups[Math.floor(this.challengeStage / 3) % 3];
      return group[Math.floor(Math.random() * group.length)];
    }
    if (this.mode === "relaxed" && this.learningGame === 8) return (["animalCow", "animalDuck", "animalFrog"] as const)[Math.floor(Math.random() * 3)];
    if (this.mode === "relaxed" && this.learningGame === 7) return (["routineWake", "routineBrush", "routineSleep"] as const)[Math.floor(Math.random() * 3)];
    if (this.mode === "relaxed" && this.learningGame === 6) return (["communicateWater", "communicateFood", "communicateHelp"] as const)[Math.floor(Math.random() * 3)];
    if (this.mode === "relaxed" && this.learningGame === 5) return (["listenBird", "listenCat", "listenDog"] as const)[Math.floor(Math.random() * 3)];
    if (this.mode === "relaxed" && this.learningGame === 4) return (["feelingHappy", "feelingSad", "feelingCalm"] as const)[Math.floor(Math.random() * 3)];
    if (this.mode === "relaxed" && this.learningGame === 3) return (["memorySun", "memoryMoon", "memoryStar"] as const)[Math.floor(Math.random() * 3)];
    if (this.mode === "relaxed" && this.learningGame === 2) return (["oneGroup", "twoGroup", "threeGroup"] as const)[Math.floor(Math.random() * 3)];
    if (this.mode === "relaxed" && this.learningGame === 1) return (["circleShape", "squareShape", "triangleShape", "starShape"] as const)[Math.floor(Math.random() * 4)];
    if (this.mode === "relaxed" && this.learningGame === 0) return (["redOrb", "blueOrb", "yellowOrb"] as const)[Math.floor(Math.random() * 3)];
    const roll = Math.random();
    if (this.mode === "adventure") {
      const cloudChance = this.playT < 3.5 ? 0 : Math.min(0.34, 0.18 + this.level * 0.03);
      if (roll < cloudChance) return "cloud";
      if (this.hearts < MAX_HEARTS && Math.random() < 0.05) return "heart";
    }
    if (Math.random() < (this.mode === "relaxed" ? 0.06 : 0.04)) return "rainbow";
    const r2 = Math.random();
    if (r2 < 0.55) return "star";
    if (r2 < 0.8) return "berry";
    return "blue";
  }

  burst(x: number, y: number, colors: string[], count: number, speed: number, shapeMix = true) {
    const n = this.calm ? Math.ceil(count * 0.4) : count;
    for (let i = 0; i < n; i++) {
      if (this.particles.length > 420) this.particles.shift();
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.4 + Math.random() * 0.8);
      const max = 0.5 + Math.random() * 0.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - speed * 0.35,
        life: max,
        max,
        size: 3 + Math.random() * 5,
        color: colors[(Math.random() * colors.length) | 0],
        shape: shapeMix ? ((Math.random() * 3) | 0) as 0 | 1 | 2 : 0,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 10,
        g: 520,
      });
    }
  }

  ring(x: number, y: number, color: string, maxR: number) {
    this.rings.push({ x, y, r: 4, maxR, life: 0.45, max: 0.45, color });
  }

  floater(x: number, y: number, text: string, color: string, size = 26) {
    this.floaters.push({ x, y, text, life: 0.9, max: 0.9, color, size });
  }

  addShake(px: number) {
    if (this.calm) return;
    this.shake = Math.min(18, this.shake + px);
  }

  // ------------------------------------------------------------ loop
  loop = (ts: number) => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.last) this.last = ts;
    let dt = (ts - this.last) / 1000;
    this.last = ts;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    if (!this.visible) return;
    if (this.state !== "paused") {
      this.time += dt;
      this.update(dt);
    }
    this.render();
  };

  update(dt: number) {
    const s = this.size;
    // --- player movement
    const maxSpeed = Math.max(520, this.W * 1.25);
    if (this.state === "playing") {
      const dir = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
      if (this.targetX !== null) {
        const prev = this.px;
        const k = 1 - Math.exp(-dt * 20);
        this.px += (this.targetX - this.px) * k;
        this.pvx = dt > 0 ? (this.px - prev) / dt : 0;
      } else if (dir !== 0) {
        const accel = maxSpeed * 12;
        // instant turnaround for tight feel
        if (Math.sign(this.pvx) !== dir) this.pvx *= 0.2;
        this.pvx += dir * accel * dt;
        if (Math.abs(this.pvx) > maxSpeed) this.pvx = Math.sign(this.pvx) * maxSpeed;
        this.px += this.pvx * dt;
      } else {
        this.pvx *= Math.exp(-dt * 18);
        this.px += this.pvx * dt;
      }
      const minX = s * 1.05;
      const maxX = this.W - s * 1.05;
      if (this.px < minX) {
        this.px = minX;
        this.pvx = 0;
      } else if (this.px > maxX) {
        this.px = maxX;
        this.pvx = 0;
      }
    } else if (this.state === "ready") {
      this.px += (this.W / 2 + Math.sin(this.time * 0.8) * this.W * 0.12 - this.px) * (1 - Math.exp(-dt * 2));
      this.pvx = Math.cos(this.time * 0.8) * this.W * 0.1;
    } else {
      this.pvx *= Math.exp(-dt * 10);
    }
    const tiltTarget = Math.max(-0.22, Math.min(0.22, (this.pvx / maxSpeed) * 0.3));
    this.tilt += (tiltTarget - this.tilt) * (1 - Math.exp(-dt * 14));

    // squash spring
    this.squashV += (-this.squash * 320 - this.squashV * 16) * dt;
    this.squash += this.squashV * dt;

    // blink & mood
    this.blinkT -= dt;
    if (this.blinkT <= 0) {
      this.blinkOn = 0.13;
      this.blinkT = 2 + Math.random() * 3;
    }
    if (this.blinkOn > 0) this.blinkOn -= dt;
    if (this.moodT > 0) {
      this.moodT -= dt;
      if (this.moodT <= 0) this.mood = "idle";
    }
    if (this.invuln > 0) this.invuln -= dt;

    // dust puffs when running
    if (!this.calm && this.state === "playing" && Math.abs(this.pvx) > maxSpeed * 0.35) {
      this.dustT -= dt;
      if (this.dustT <= 0) {
        this.dustT = 0.05;
        this.particles.push({
          x: this.px - Math.sign(this.pvx) * s * 0.7,
          y: this.py + s * 1.1,
          vx: -Math.sign(this.pvx) * (30 + Math.random() * 40),
          vy: -20 - Math.random() * 30,
          life: 0.4,
          max: 0.4,
          size: 4 + Math.random() * 4,
          color: "rgba(255,255,255,0.8)",
          shape: 0,
          rot: 0,
          vr: 0,
          g: -40,
        });
      }
    }

    // --- game logic
    if (this.state === "playing") {
      this.playT += dt;
      if (this.mode === "relaxed") {
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
          this.timeLeft = 0;
          this.endGame();
        }
      }
      if (this.mode === "cove") {
        this.coveHintT += dt;
        if (!this.calm && Math.random() < dt * 0.9) {
          this.particles.push({
            x: Math.random() * this.W,
            y: this.groundY - this.H * 0.05 - Math.random() * this.H * 0.2,
            vx: (Math.random() - 0.5) * 16,
            vy: -12 - Math.random() * 18,
            life: 2.5 + Math.random() * 1.5,
            max: 4,
            size: 2 + Math.random() * 1.6,
            color: "#fff6a3",
            shape: 0,
            rot: 0,
            vr: 0,
            g: -8,
          });
        }
      } else {
        this.spawnT -= dt;
      }
      if (this.mode !== "cove" && this.spawnT <= 0) {
        let interval = Math.max(0.42, (this.mode === "relaxed" ? 0.78 : 0.82) - this.level * 0.05);
        if (this.slow) interval *= 1.35;
        this.spawnT = interval * (0.8 + Math.random() * 0.4);
        this.spawnItem(this.chooseKind());
      }
    }

    // world crossfade
    if (this.worldFade < 1) this.worldFade = Math.min(1, this.worldFade + dt / 1.2);

    // --- items
    const py = this.py;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      // the list can be emptied mid-loop (e.g. the last heart is lost)
      if (!it) continue;
      it.t += dt;
      it.spawnT += dt;
      it.y += it.vy * dt;
      it.rot += it.vr * dt;
      it.x = it.baseX + Math.sin(it.t * it.swayF) * it.swayAmp;

      if (this.state === "playing") {
        const dx = Math.abs(it.x - this.px);
        if (it.kind === "cloud") {
          if (this.invuln <= 0 && dx < s * 0.75 + it.r * 0.45 && it.y + it.r * 0.5 > py - s * 0.8 && it.y - it.r * 0.5 < py + s * 0.9) {
            this.hitCloud(it);
            this.items.splice(i, 1);
            continue;
          }
        } else if (dx < s * 1.0 + it.r * 0.55 && it.y + it.r > py - s * 1.05 && it.y - it.r < py + s * 1.15) {
          this.catchItem(it);
          this.items.splice(i, 1);
          continue;
        }
      }

      if (it.y - it.r > this.groundY + s) {
        if (this.state === "playing" && it.kind !== "cloud") {
          if (this.combo >= 3) audio.miss();
          this.combo = 0;
          this.burst(it.x, this.groundY + s * 0.6, ["rgba(255,255,255,0.9)"], 5, 90, false);
        }
        this.items.splice(i, 1);
      }
    }

    // --- particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.g * dt;
      p.vx *= 1 - dt * 1.5;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.life -= dt;
      f.y -= 60 * dt;
      if (f.life <= 0) this.floaters.splice(i, 1);
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      r.r += (r.maxR - r.r) * (1 - Math.exp(-dt * 10));
      if (r.life <= 0) this.rings.splice(i, 1);
    }
    if (this.banner) {
      this.banner.t += dt;
      if (this.banner.t > this.banner.dur) this.banner = null;
    }

    this.shake *= Math.exp(-dt * 9);
    if (this.shake < 0.2) this.shake = 0;
    this.flash = Math.max(0, this.flash - dt * 2.5);

    // --- ending
    if (this.state === "ending") {
      this.endT -= dt;
      if (!this.calm && this.mode === "relaxed" && Math.random() < dt * 12) {
        this.burst(Math.random() * this.W, -10, ITEM_COLORS.rainbow, 6, 120);
      }
      if (this.endT <= 0) {
        this.state = "over";
        audio.stopMusic();
        this.cb.onGameOver({
          score: this.score,
          bestCombo: this.bestCombo,
          caught: this.caught,
          mode: this.mode,
          friend: this.friend.kind,
          worldsVisited: this.maxWorldLevel + 1,
        });
      }
    }

    if (this.state === "playing" || this.state === "ending") this.emitHud();
  }

  catchItem(it: Item) {
    if (this.mode === "relaxed" && this.learningGame === 9) {
      const groups: ItemKind[][] = [["redOrb", "blueOrb", "yellowOrb"], ["circleShape", "squareShape", "triangleShape"], ["animalCow", "animalDuck", "animalFrog"]];
      const group = groups[Math.floor(this.challengeStage / 3) % 3];
      const target = group[this.challengeStage % 3];
      if (it.kind !== target) {
        this.floater(it.x, it.y - 18, "Try another one!", "#ffffff", 22);
        audio.miss();
        return;
      }
      this.challengeMatches++;
      if (this.challengeMatches % 5 === 0) {
        this.challengeStage = (this.challengeStage + 1) % 9;
        this.items.length = 0;
        this.spawnItem(this.chooseKind(), this.W / 2, 1.25);
        this.showBanner("Fantastic!", "A new challenge begins!", "#7c5cff", 2.3);
        audio.levelUp();
      }
    }
    if (this.mode === "relaxed" && this.learningGame === 8) {
      const choices: ItemKind[] = ["animalCow", "animalDuck", "animalFrog"];
      if (it.kind !== choices[this.targetAnimal]) {
        this.floater(it.x, it.y - 18, "Try another animal!", "#ffffff", 22);
        audio.miss();
        return;
      }
      this.animalMatches++;
      if (this.animalMatches % 5 === 0) {
        this.targetAnimal = (this.targetAnimal + 1) % 3;
        this.showBanner("Animal expert!", "Find the next animal!", "#7c5cff", 2.3);
        audio.levelUp();
      }
    }
    if (this.mode === "relaxed" && this.learningGame === 7) {
      const choices: ItemKind[] = ["routineWake", "routineBrush", "routineSleep"];
      if (it.kind !== choices[this.targetRoutine]) {
        this.floater(it.x, it.y - 18, "Try another picture!", "#ffffff", 22);
        audio.miss();
        return;
      }
      this.routineMatches++;
      if (this.routineMatches % 5 === 0) {
        this.targetRoutine = (this.targetRoutine + 1) % 3;
        this.showBanner("Great routine!", "Find the next activity!", "#7c5cff", 2.3);
        audio.levelUp();
      }
    }
    if (this.mode === "relaxed" && this.learningGame === 6) {
      const choices: ItemKind[] = ["communicateWater", "communicateFood", "communicateHelp"];
      if (it.kind !== choices[this.targetNeed]) {
        this.floater(it.x, it.y - 18, "Try another picture!", "#ffffff", 22);
        audio.miss();
        return;
      }
      this.communicationMatches++;
      if (this.communicationMatches % 5 === 0) {
        this.targetNeed = (this.targetNeed + 1) % 3;
        this.showBanner("Great communicating!", "Choose the next picture!", "#7c5cff", 2.3);
        audio.levelUp();
      }
    }
    if (this.mode === "relaxed" && this.learningGame === 5) {
      const sounds: ItemKind[] = ["listenBird", "listenCat", "listenDog"];
      if (it.kind !== sounds[this.targetSound]) {
        this.floater(it.x, it.y - 18, "Try another animal!", "#ffffff", 22);
        audio.miss();
        return;
      }
      this.listenMatches++;
      if (this.listenMatches % 5 === 0) {
        this.targetSound = (this.targetSound + 1) % 3;
        this.showBanner("Great listening!", "Listen for the next animal!", "#7c5cff", 2.3);
        audio.levelUp();
        this.speakTarget();
      }
    }
    if (this.mode === "relaxed" && this.learningGame === 4) {
      const feelings: ItemKind[] = ["feelingHappy", "feelingSad", "feelingCalm"];
      if (it.kind !== feelings[this.targetFeeling]) {
        this.floater(it.x, it.y - 18, "Try another face!", "#ffffff", 22);
        audio.miss();
        return;
      }
      this.feelingMatches++;
      if (this.feelingMatches % 5 === 0) {
        this.targetFeeling = (this.targetFeeling + 1) % 3;
        this.showBanner("Great job!", `Find the ${["HAPPY", "SAD", "CALM"][this.targetFeeling]} face!`, "#7c5cff", 2.3);
        audio.levelUp();
      }
    }
    if (this.mode === "relaxed" && this.learningGame === 3) {
      const memories: ItemKind[] = ["memorySun", "memoryMoon", "memoryStar"];
      if (it.kind !== memories[this.targetMemory]) {
        this.floater(it.x, it.y - 18, "Try again!", "#ffffff", 22);
        audio.miss();
        return;
      }
      this.memoryMatches++;
      if (this.memoryMatches % 4 === 0) {
        this.targetMemory = (this.targetMemory + 1) % 3;
        this.memoryRevealUntil = this.playT + 3.5;
        this.showBanner("Great memory!", "Remember the next picture!", "#7c5cff", 2.2);
        audio.levelUp();
      }
    }
    if (this.mode === "relaxed" && this.learningGame === 2) {
      const count = ["oneGroup", "twoGroup", "threeGroup"].indexOf(it.kind);
      if (count + 1 !== this.targetCount) {
        this.floater(it.x, it.y - 18, "Try another number!", "#ffffff", 22);
        audio.miss();
        return;
      }
      this.countingMatches++;
      if (this.countingMatches % 5 === 0) {
        this.targetCount = this.targetCount % 3 + 1;
        this.showBanner("Great counting!", `Now find ${this.targetCount}!`, "#7c5cff", 2.3);
        audio.levelUp();
      }
    }
    if (this.mode === "relaxed" && this.learningGame === 1) {
      const shapes: ItemKind[] = ["circleShape", "squareShape", "triangleShape", "starShape"];
      if (it.kind !== shapes[this.targetShape]) {
        this.floater(it.x, it.y - 18, "Try another shape!", "#ffffff", 22);
        audio.miss();
        return;
      }
      this.shapeMatches++;
      if (this.shapeMatches % 5 === 0) {
        this.targetShape = (this.targetShape + 1) % 4;
        this.showBanner("Great finding!", `Now catch the ${["CIRCLE", "SQUARE", "TRIANGLE", "STAR"][this.targetShape]}!`, "#7c5cff", 2.3);
        audio.levelUp();
      }
    }
    if (this.mode === "relaxed" && this.learningGame === 0) {
      const colors: ItemKind[] = ["redOrb", "blueOrb", "yellowOrb"];
      if (it.kind !== colors[this.targetColor]) {
        this.floater(it.x, it.y - 18, "Try another color!", "#ffffff", 22);
        audio.miss();
        return;
      }
      this.colorMatches++;
      if (this.colorMatches % 5 === 0) {
        this.targetColor = (this.targetColor + 1) % 3;
        this.showBanner("Great matching!", `Now catch ${["RED", "BLUE", "YELLOW"][this.targetColor]}!`, "#7c5cff", 2.3);
        audio.levelUp();
      }
    }
    const s = this.size;
    this.combo++;
    this.caught++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const mult = this.multiplier;
    const pts = ITEM_POINTS[it.kind] * mult;
    this.score += pts;
    this.mood = "happy";
    this.moodT = 0.35;
    this.squashV += it.kind === "rainbow" ? 4.5 : 3;
    const colors = ITEM_COLORS[it.kind];
    if (it.kind === "rainbow") {
      this.burst(it.x, it.y, colors, 34, 340);
      this.ring(it.x, it.y, "#ffffff", s * 3);
      this.addShake(5);
      audio.rainbow();
      this.floater(it.x, it.y - 20, `+${pts}`, "#ff5fa8", 36);
    } else if (it.kind === "heart") {
      if (this.hearts < MAX_HEARTS) this.hearts++;
      this.burst(it.x, it.y, colors, 18, 220);
      this.ring(it.x, it.y, "#ff6fa5", s * 2);
      audio.heart();
      this.floater(it.x, it.y - 20, "+1 ♥", "#ff4f8f", 30);
    } else {
      this.burst(it.x, it.y, colors, 14, 230);
      this.ring(it.x, it.y, colors[0], s * 1.6);
      audio.catch(this.combo);
      this.floater(it.x, it.y - 16, `+${pts}`, mult > 1 ? "#ff7a1a" : "#ffffff", mult > 1 ? 30 : 26);
    }

    const word = COMBO_WORDS[this.combo] || (this.combo > 30 && this.combo % 10 === 0 ? "Superstar!" : "");
    if (word) {
      this.showBanner(word, `${this.combo} in a row!`, "#7c5cff", 1.3);
      this.burst(this.px, this.py - s, ITEM_COLORS.rainbow, 20, 280);
      audio.cheer();
    }

    // Level 1: keep the meadow throughout the Relaxed round.
    if (this.mode === "relaxed") return;

    // world progression
    const lvl = Math.floor(this.caught / CATCHES_PER_WORLD);
    if (lvl > this.worldLevel) {
      this.worldLevel = lvl;
      this.maxWorldLevel = Math.max(this.maxWorldLevel, lvl);
      this.prevWorldIdx = this.worldIdx;
      this.worldIdx = lvl % WORLDS.length;
      this.worldFade = 0;
      this.showBanner(`Welcome to ${WORLDS[this.worldIdx].name}!`, "A new adventure!", "#22a06b", 2.2);
      this.burst(this.W / 2, this.H * 0.35, ITEM_COLORS.rainbow, 40, 380);
      audio.levelUp();
    }
  }

  hitCloud(it: Item) {
    this.hearts--;
    this.combo = 0;
    this.invuln = 1.4;
    this.mood = "oops";
    this.moodT = 0.9;
    this.squashV -= 4;
    this.addShake(14);
    if (!this.calm) this.flash = 0.35;
    this.burst(it.x, it.y, ITEM_COLORS.cloud, 18, 200, false);
    this.floater(this.px, this.py - this.size * 1.6, "Oops!", "#5b6b9a", 30);
    audio.bonk();
    if (this.hearts <= 0) {
      this.hearts = 0;
      this.endGame();
    }
  }

  endGame() {
    if (this.state !== "playing") return;
    this.state = "ending";
    this.endT = this.mode === "relaxed" ? 1.6 : 1.3;
    this.clearInput();
    if (this.mode === "relaxed") {
      this.mood = "happy";
      this.moodT = 2;
      this.showBanner("Time's up!", "What a great adventure!", "#ff7ab6", 1.6);
      audio.tada();
    } else {
      this.showBanner("Phew!", "Great adventure!", "#7c5cff", 1.4);
    }
    // gently pop all remaining items
    for (const it of this.items) this.burst(it.x, it.y, ITEM_COLORS[it.kind], 6, 120);
    this.items.length = 0;
  }

  // ------------------------------------------------------------ render
  render() {
    const ctx = this.ctx;
    const { W, H } = this;
    const s = this.size;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    let ox = 0;
    let oy = 0;
    if (this.shake > 0 && this.state !== "paused") {
      ox = (Math.random() * 2 - 1) * this.shake;
      oy = (Math.random() * 2 - 1) * this.shake;
    }
    ctx.save();
    // overscan so shake never reveals edges
    if (ox || oy) ctx.translate(ox, oy);

    const motion = this.calm ? 0.5 : 1;
    const gy = this.groundY;
    if (this.mode === "cove") {
      drawCoveWorld(ctx, W, H, this.time, gy, motion);
      // flowers grow where little fingers have been
      for (const f of this.coveFlowers) {
        const p = Math.min(1, (this.time - f.born) / 0.6);
        const ease = p < 1 ? 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2) + 0.2 * (p - 1) : 1;
        drawCoveFlower(ctx, f.x, f.y, (s / 46) * ease, f.color, this.time, f.seed);
      }
    } else if (this.worldFade < 1) {
      if (this.prevWorldIdx === 1 && this.mode === "relaxed") drawOceanWorld(ctx, W, H, this.time, gy); else drawWorld(ctx, WORLDS[this.prevWorldIdx], W, H, this.time, gy, motion);
      ctx.globalAlpha = this.worldFade;
      if (this.learningGame === 1 && this.mode === "relaxed") drawOceanWorld(ctx, W, H, this.time, gy); else if (this.learningGame === 2 && this.mode === "relaxed") drawGalaxyWorld(ctx, W, H, this.time, gy); else if (this.learningGame === 3 && this.mode === "relaxed") drawFarmWorld(ctx, W, H, this.time, gy); else if (this.learningGame === 4 && this.mode === "relaxed") drawForestWorld(ctx, W, H, this.time, gy); else if (this.learningGame === 5 && this.mode === "relaxed") drawBambooWorld(ctx, W, H, this.time, gy); else if (this.learningGame === 6 && this.mode === "relaxed") drawSnowWorld(ctx, W, H, this.time, gy); else if (this.learningGame === 7 && this.mode === "relaxed") drawSavannaWorld(ctx, W, H, this.time, gy); else if (this.learningGame === 8 && this.mode === "relaxed") drawDragonWorld(ctx, W, H, this.time, gy); else if (this.learningGame === 9 && this.mode === "relaxed") drawMagicWorld(ctx, W, H, this.time, gy); else drawWorld(ctx, WORLDS[this.worldIdx], W, H, this.time, gy, motion);
      ctx.globalAlpha = 1;
    } else {
      if (this.learningGame === 1 && this.mode === "relaxed") drawOceanWorld(ctx, W, H, this.time, gy);
      else if (this.learningGame === 2 && this.mode === "relaxed") drawGalaxyWorld(ctx, W, H, this.time, gy);
      else if (this.learningGame === 3 && this.mode === "relaxed") drawFarmWorld(ctx, W, H, this.time, gy);
      else if (this.learningGame === 4 && this.mode === "relaxed") drawForestWorld(ctx, W, H, this.time, gy);
      else if (this.learningGame === 5 && this.mode === "relaxed") drawBambooWorld(ctx, W, H, this.time, gy);
      else if (this.learningGame === 6 && this.mode === "relaxed") drawSnowWorld(ctx, W, H, this.time, gy);
      else if (this.learningGame === 7 && this.mode === "relaxed") drawSavannaWorld(ctx, W, H, this.time, gy);
      else if (this.learningGame === 8 && this.mode === "relaxed") drawDragonWorld(ctx, W, H, this.time, gy);
      else if (this.learningGame === 9 && this.mode === "relaxed") drawMagicWorld(ctx, W, H, this.time, gy);
      else drawWorld(ctx, WORLDS[this.worldIdx], W, H, this.time, gy, motion);
    }

    if (this.state === "playing" && this.mode === "relaxed" && this.learningGame === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.94)";
      ctx.beginPath();
      ctx.roundRect(Math.max(8, W / 2 - 135), (W > H ? Math.min(145, H * 0.29) : Math.min(104, H * 0.16)), 270, 52, 22);
      ctx.fill();
      ctx.fillStyle = ["#e33243", "#176be0", "#9b7400"][this.targetColor];
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Catch ${["RED", "BLUE", "YELLOW"][this.targetColor]}!`, W / 2, ((W > H ? Math.min(145, H * 0.29) : Math.min(104, H * 0.16)) + 34));
    }

    if (this.state === "playing" && this.mode === "relaxed" && this.learningGame === 1) {
      const y = (W > H ? Math.min(145, H * 0.29) : Math.min(104, H * 0.16));
      ctx.fillStyle = "rgba(255,255,255,0.94)";
      ctx.beginPath();
      ctx.roundRect(Math.max(8, W / 2 - 145), y, 290, 52, 22);
      ctx.fill();
      ctx.fillStyle = "#593e91";
      ctx.font = "bold 21px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Catch the ${["CIRCLE", "SQUARE", "TRIANGLE", "STAR"][this.targetShape]}!`, W / 2, y + 34);
    }

    if (this.state === "playing" && this.mode === "relaxed" && this.learningGame === 2) {
      const y = (W > H ? Math.min(145, H * 0.29) : Math.min(104, H * 0.16));
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.beginPath(); ctx.roundRect(Math.max(8, W / 2 - 145), y, 290, 56, 22); ctx.fill();
      ctx.fillStyle = "#49357e"; ctx.font = "bold 21px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`Catch ${this.targetCount} stars!`, W / 2, y + 36);
    }
    if (this.state === "playing" && this.mode === "relaxed" && this.learningGame === 3) {
      const y = (W > H ? Math.min(145, H * 0.29) : Math.min(104, H * 0.16));
      const pictures = ["☀️", "🌙", "⭐"];
      const showing = this.playT < this.memoryRevealUntil;
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.beginPath(); ctx.roundRect(Math.max(8, W / 2 - 145), y, 290, 72, 22); ctx.fill();
      ctx.fillStyle = "#49357e"; ctx.textAlign = "center";
      ctx.font = "bold 17px sans-serif";
      ctx.fillText(showing ? "Remember this picture!" : "Catch the picture you saw!", W / 2, y + 22);
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(showing ? pictures[this.targetMemory] : "❓", W / 2, y + 57);
    }
    if (this.state === "playing" && this.mode === "relaxed" && this.learningGame === 4) {
      const y = (W > H ? Math.min(145, H * 0.29) : Math.min(104, H * 0.16));
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.beginPath(); ctx.roundRect(Math.max(8, W / 2 - 145), y, 290, 58, 22); ctx.fill();
      ctx.fillStyle = "#365947"; ctx.textAlign = "center"; ctx.font = "bold 21px sans-serif";
      ctx.fillText(`Find the ${["HAPPY", "SAD", "CALM"][this.targetFeeling]} face!`, W / 2, y + 36);
    }
    if (this.state === "playing" && this.mode === "relaxed" && this.learningGame === 5) {
      const y = (W > H ? Math.min(145, H * 0.29) : Math.min(104, H * 0.16));
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.beginPath(); ctx.roundRect(Math.max(8, W / 2 - 145), y, 290, 62, 22); ctx.fill();
      ctx.fillStyle = "#315c45"; ctx.textAlign = "center"; ctx.font = "bold 20px sans-serif";
      ctx.fillText(`Listen! Find the ${["BIRD", "CAT", "DOG"][this.targetSound]}!`, W / 2, y + 37);
    }
    if (this.state === "playing" && this.mode === "relaxed" && this.learningGame === 6) {
      const y = (W > H ? Math.min(145, H * 0.29) : Math.min(104, H * 0.16));
      ctx.fillStyle = "rgba(255,255,255,0.97)";
      ctx.beginPath(); ctx.roundRect(Math.max(8, W / 2 - 145), y, 290, 100, 22); ctx.fill();
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = '39px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.fillText(["💧", "🍎", "🙋"][this.targetNeed], W / 2, y + 30);
      ctx.fillStyle = "#375d85"; ctx.font = "bold 18px sans-serif";
      ctx.fillText(`I need ${["WATER", "FOOD", "HELP"][this.targetNeed]}!`, W / 2, y + 65);
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("Catch the matching picture", W / 2, y + 86);
      ctx.textBaseline = "alphabetic";
    }
    if (this.state === "playing" && this.mode === "relaxed" && this.learningGame === 7) {
      const y = (W > H ? Math.min(145, H * 0.29) : Math.min(104, H * 0.16));
      ctx.fillStyle = "rgba(255,255,255,0.97)";
      ctx.beginPath(); ctx.roundRect(Math.max(8, W / 2 - 145), y, 290, 100, 22); ctx.fill();
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = '39px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.fillText(["🌅", "🪥", "🛏️"][this.targetRoutine], W / 2, y + 30);
      ctx.fillStyle = "#76532c"; ctx.font = "bold 18px sans-serif";
      ctx.fillText(`Find ${["WAKE UP", "BRUSH TEETH", "BEDTIME"][this.targetRoutine]}!`, W / 2, y + 65);
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("Catch the matching picture", W / 2, y + 86);
      ctx.textBaseline = "alphabetic";
    }
    if (this.state === "playing" && this.mode === "relaxed" && this.learningGame === 8) {
      const y = (W > H ? Math.min(145, H * 0.29) : Math.min(104, H * 0.16));
      ctx.fillStyle = "rgba(255,255,255,0.97)";
      ctx.beginPath(); ctx.roundRect(Math.max(8, W / 2 - 145), y, 290, 65, 22); ctx.fill();
      ctx.fillStyle = "#5a4d87"; ctx.textAlign = "center"; ctx.font = "bold 20px sans-serif";
      ctx.fillText(`Find the ${["COW", "DUCK", "FROG"][this.targetAnimal]}!`, W / 2, y + 27);
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("Catch the matching animal", W / 2, y + 50);
    }
    if (this.state === "playing" && this.mode === "relaxed" && this.learningGame === 9) {
      const labels = ["RED", "BLUE", "YELLOW", "CIRCLE", "SQUARE", "TRIANGLE", "COW", "DUCK", "FROG"];
      const y = (W > H ? Math.min(145, H * 0.29) : Math.min(104, H * 0.16));
      ctx.fillStyle = "rgba(255,255,255,0.97)";
      ctx.beginPath(); ctx.roundRect(Math.max(8, W / 2 - 145), y, 290, 66, 22); ctx.fill();
      ctx.fillStyle = "#7752a4"; ctx.textAlign = "center"; ctx.font = "bold 20px sans-serif";
      ctx.fillText(`Find the ${labels[this.challengeStage]}!`, W / 2, y + 27);
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("Niko's Big Challenge", W / 2, y + 50);
    }
    // items
    for (const it of this.items) {
      const pop = Math.min(1, it.spawnT * 5);
      const r = it.r * (0.6 + 0.4 * pop);
      switch (it.kind) {
        case "animalCow":
        case "animalDuck":
        case "animalFrog": {
          const animal = it.kind === "animalCow" ? "🐮" : it.kind === "animalDuck" ? "🦆" : "🐸";
          ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.font = `${Math.round(r * 1.8)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.fillText(animal, it.x, it.y); ctx.restore(); break;
        }
        case "routineWake":
        case "routineBrush":
        case "routineSleep": {
          const picture = it.kind === "routineWake" ? "🌅" : it.kind === "routineBrush" ? "🪥" : "🛏️";
          ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.font = `${Math.round(r * 1.8)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.fillText(picture, it.x, it.y); ctx.restore(); break;
        }
        case "communicateWater":
        case "communicateFood":
        case "communicateHelp": {
          const picture = it.kind === "communicateWater" ? "💧" : it.kind === "communicateFood" ? "🍎" : "🙋";
          ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.font = `${Math.round(r * 1.8)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.fillText(picture, it.x, it.y); ctx.restore(); break;
        }
        case "listenBird":
        case "listenCat":
        case "listenDog": {
          const animal = it.kind === "listenBird" ? "🐦" : it.kind === "listenCat" ? "🐱" : "🐶";
          ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.font = `${Math.round(r * 1.8)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.fillText(animal, it.x, it.y); ctx.restore(); break;
        }
        case "feelingHappy":
        case "feelingSad":
        case "feelingCalm": {
          const face = it.kind === "feelingHappy" ? "😊" : it.kind === "feelingSad" ? "😢" : "😌";
          ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.font = `${Math.round(r * 1.8)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.fillText(face, it.x, it.y);
          ctx.restore(); break;
        }
        case "memorySun":
        case "memoryMoon":
        case "memoryStar": {
          const picture = it.kind === "memorySun" ? "☀️" : it.kind === "memoryMoon" ? "🌙" : "⭐";
          ctx.save();
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.font = `${Math.round(r * 1.65)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.fillText(picture, it.x, it.y);
          ctx.restore();
          break;
        }
        case "oneGroup":
        case "twoGroup":
        case "threeGroup": {
          const count = it.kind === "oneGroup" ? 1 : it.kind === "twoGroup" ? 2 : 3;
          ctx.save(); ctx.translate(it.x, it.y);
          ctx.fillStyle = "#fff9eb"; ctx.strokeStyle = "#f1b65b"; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.roundRect(-r * 1.05, -r * 0.83, r * 2.1, r * 1.66, 13); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#ffbd3b";
          for (let n = 0; n < count; n++) {
            const cx = (n - (count - 1) / 2) * r * 0.58;
            ctx.beginPath();
            for (let k = 0; k < 10; k++) {
              const ang = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.18 : r * 0.38;
              if (k === 0) ctx.moveTo(cx + Math.cos(ang) * rr, Math.sin(ang) * rr);
              else ctx.lineTo(cx + Math.cos(ang) * rr, Math.sin(ang) * rr);
            }
            ctx.closePath(); ctx.fill();
          }
          ctx.restore(); break;
        }
        case "circleShape":
        case "squareShape":
        case "triangleShape":
        case "starShape": {
          ctx.save();
          ctx.translate(it.x, it.y);
          ctx.fillStyle = it.kind === "circleShape" ? "#ff668c" : it.kind === "squareShape" ? "#5f91ff" : it.kind === "triangleShape" ? "#ffc44d" : "#a875ef";
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 4;
          ctx.beginPath();
          if (it.kind === "circleShape") ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
          else if (it.kind === "squareShape") ctx.rect(-r * 0.75, -r * 0.75, r * 1.5, r * 1.5);
          else {
            const points = it.kind === "triangleShape" ? 3 : 10;
            for (let i = 0; i < points; i++) {
              const angle = -Math.PI / 2 + i * Math.PI * 2 / points;
              const radius = it.kind === "starShape" && i % 2 ? r * 0.38 : r * 0.85;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
          }
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          break;
        }
        case "redOrb":
        case "blueOrb":
        case "yellowOrb": {
          const fill = it.kind === "redOrb" ? "#ff5b68" : it.kind === "blueOrb" ? "#428bff" : "#ffcf3b";
          ctx.beginPath();
          ctx.arc(it.x, it.y, r * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(it.x - r * 0.25, it.y - r * 0.28, r * 0.18, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.65)";
          ctx.fill();
          break;
        }
        case "star":
          drawStar(ctx, it.x, it.y, r, it.rot * 0.5);
          break;
        case "berry":
          drawStrawberry(ctx, it.x, it.y, r * 0.85, Math.sin(it.t * 2) * 0.6);
          break;
        case "blue":
          drawBlueberry(ctx, it.x, it.y, r * 0.8);
          break;
        case "rainbow":
          drawRainbowStar(ctx, it.x, it.y, r, it.rot, this.time);
          break;
        case "heart":
          drawHeart(ctx, it.x, it.y, r * 0.85, it.t * 6);
          break;
        case "cloud":
          drawGrumpyCloud(ctx, it.x, it.y, r, it.t);
          break;
      }
    }

    // player
    let alpha = 1;
    if (this.invuln > 0) alpha = this.calm ? 0.6 : 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(this.invuln * Math.PI * 6));
    const bob = this.state === "ready" ? Math.abs(Math.sin(this.time * 3)) * -s * 0.25 : 0;
    const breathe = Math.sin(this.time * 3) * 0.02;
    if (this.mode === "relaxed" && (this.learningGame === 1 || this.learningGame === 2 || this.learningGame === 3 || this.learningGame === 4 || this.learningGame === 5 || this.learningGame === 6 || this.learningGame === 7 || this.learningGame === 8 || this.learningGame === 9)) {
      // Use the same character emoji as the homepage displayed on the Level 2 homepage card.
      // Browser-native color emoji rendering keeps the selected friend consistent.
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${Math.round(s * 2.15)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.fillText(this.learningGame === 9 ? "🦄" : this.learningGame === 8 ? "🐉" : this.learningGame === 7 ? "🦁" : this.learningGame === 6 ? "🐧" : this.learningGame === 5 ? "🐼" : this.learningGame === 4 ? "🦊" : this.learningGame === 3 ? "🐷" : this.learningGame === 2 ? "👽" : "🐠", this.px, this.py + bob);
      ctx.restore();
    } else {
    drawFriend(ctx, this.friend, this.px, this.py + bob, s, {
      t: this.time,
      mood: this.state === "ready" ? "happy" : this.mood,
      blink: this.blinkOn > 0,
      squash: Math.max(-0.35, Math.min(0.35, this.squash + breathe)),
      tilt: this.tilt,
      basket: this.state !== "ready" && this.mode !== "cove",
      alpha,
    });
    }

    // movement hint at start
    if (this.state === "playing" && this.playT < 4.5 && !this.movedOnce) {
      const a = Math.min(1, this.playT * 2) * Math.min(1, (4.5 - this.playT) * 2);
      ctx.globalAlpha = a;
      const off = Math.sin(this.time * 5) * 6;
      ctx.font = `700 ${Math.round(s * 0.9)}px Fredoka, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#7c5cff";
      ctx.strokeText("◀", this.px - s * 1.9 - off, this.py);
      ctx.fillText("◀", this.px - s * 1.9 - off, this.py);
      ctx.strokeText("▶", this.px + s * 1.9 + off, this.py);
      ctx.fillText("▶", this.px + s * 1.9 + off, this.py);
      const msg = this.coarse ? "Slide your finger!" : "Use ← → arrow keys!";
      ctx.font = `600 ${Math.round(Math.max(16, s * 0.5))}px Fredoka, sans-serif`;
      ctx.strokeText(msg, this.px, this.py - s * 2.2);
      ctx.fillText(msg, this.px, this.py - s * 2.2);
      ctx.globalAlpha = 1;
    }

    // rings
    for (const r of this.rings) {
      ctx.globalAlpha = Math.max(0, r.life / r.max);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // particles
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      const sz = p.size * (0.5 + a * 0.5);
      if (p.shape === 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 1) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI) / 4;
          const rr = i % 2 === 0 ? sz * 1.4 : sz * 0.5;
          ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * 0.2);
        heartPath(ctx, sz);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;

    // floaters
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const f of this.floaters) {
      const k = f.life / f.max;
      const sc = k > 0.8 ? 1 + (k - 0.8) * 2.5 : 1;
      ctx.globalAlpha = Math.min(1, k * 2);
      ctx.font = `700 ${Math.round(f.size * sc)}px Fredoka, sans-serif`;
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(59,47,74,0.85)";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;

    // banner
    if (this.banner) {
      const b = this.banner;
      const tIn = Math.min(1, b.t / 0.25);
      const tOut = Math.min(1, (b.dur - b.t) / 0.3);
      const ease = 1 - Math.pow(1 - tIn, 3);
      const over = tIn < 1 ? 1 + Math.sin(tIn * Math.PI) * 0.15 : 1;
      const sc = this.calm ? 1 : ease * over;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(tIn * 1.5, tOut));
      ctx.translate(W / 2, H * 0.3);
      ctx.scale(sc, sc);
      const big = Math.round(Math.min(W * 0.085, 54));
      ctx.font = `700 ${big}px Fredoka, sans-serif`;
      ctx.lineJoin = "round";
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#ffffff";
      ctx.strokeText(b.text, 0, 0);
      ctx.fillStyle = b.color;
      ctx.fillText(b.text, 0, 0);
      if (b.sub) {
        ctx.font = `600 ${Math.round(big * 0.45)}px Fredoka, sans-serif`;
        ctx.lineWidth = 6;
        ctx.strokeText(b.sub, 0, big * 0.85);
        ctx.fillStyle = "#3b2f4a";
        ctx.fillText(b.sub, 0, big * 0.85);
      }
      ctx.restore();
    }

    ctx.restore();

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,200,220,${this.flash * 0.5})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
}
