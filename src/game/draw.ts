import type { FriendInfo, World } from "./types";

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

export function prand(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU);
  ctx.fill();
}

// ---------------------------------------------------------------- Friend
export type Mood = "idle" | "happy" | "oops";

export interface FriendDrawOpts {
  t: number;
  mood: Mood;
  blink: boolean;
  squash: number;
  tilt: number;
  basket: boolean;
  alpha?: number;
}

export function drawFriend(ctx: Ctx, f: FriendInfo, x: number, y: number, s: number, o: FriendDrawOpts) {
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  // shadow
  ellipse(ctx, x, y + s * 1.18, s * 1.05, s * 0.16, "rgba(0,0,0,0.13)");

  ctx.translate(x, y + s);
  ctx.rotate(o.tilt);
  ctx.scale(1 + o.squash, 1 - o.squash);
  ctx.translate(0, -s);

  const ink = "#3b2f4a";

  // Finn is a fish, not a recolored version of Mochi's round cat body.
  // Draw a recognizable side-facing fish with a tail, fins, gills, and eyes.
  if (f.kind === "fish") {
    const wag = Math.sin(o.t * 5) * s * 0.12;
    ctx.fillStyle = "#f57b65";
    ctx.beginPath();
    ctx.moveTo(-s * 0.65, 0);
    ctx.lineTo(-s * 1.65, -s * 0.68 + wag);
    ctx.lineTo(-s * 1.58, s * 0.75 + wag);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f9a75c";
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, -s * 0.53);
    ctx.lineTo(s * 0.05, -s * 1.15);
    ctx.lineTo(s * 0.4, -s * 0.54);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, 0, 0, s * 1.12, s * 0.72, "#ffae65");
    ellipse(ctx, s * 0.28, s * 0.21, s * 0.65, s * 0.34, "#ffe5b0");
    ctx.fillStyle = "#f57b65";
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, s * 0.52);
    ctx.lineTo(-s * 0.4, s * 1.03);
    ctx.lineTo(s * 0.35, s * 0.6);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, s * 0.48, -s * 0.18, s * 0.18, s * 0.2, "#ffffff");
    ellipse(ctx, s * 0.53, -s * 0.17, s * 0.1, s * 0.12, "#30304e");
    ellipse(ctx, s * 0.57, -s * 0.22, s * 0.035, s * 0.04, "#ffffff");
    ctx.strokeStyle = "#d67c4f";
    ctx.lineWidth = s * 0.045;
    ctx.beginPath();
    ctx.arc(-s * 0.22, s * 0.03, s * 0.23, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.stroke();
    ctx.strokeStyle = "#70435c";
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.arc(s * 0.83, s * 0.17, s * 0.13, 0.1, Math.PI * 0.85);
    ctx.stroke();
    if (o.basket) {
      ctx.fillStyle = "#e4a75e";
      ctx.beginPath();
      ctx.roundRect(-s * 0.65, s * 0.57, s * 1.35, s * 0.46, s * 0.14);
      ctx.fill();
      ctx.strokeStyle = "#c9873f";
      ctx.lineWidth = s * 0.045;
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (f.kind === "fish") {
    ctx.fillStyle = f.dark;
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, s * 0.1);
    ctx.lineTo(-s * 1.12, -s * 0.55);
    ctx.lineTo(-s * 1.08, s * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.12, -s * 0.55);
    ctx.lineTo(s * 0.22, -s * 1.2);
    ctx.lineTo(s * 0.42, -s * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  // ---- ears / top features (behind body)
  if (f.kind === "bunny") {
    const sway = Math.sin(o.t * 3) * 0.08;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * s * 0.38, -s * 0.7);
      ctx.rotate(side * 0.18 + sway * side);
      ellipse(ctx, 0, -s * 0.55, s * 0.24, s * 0.62, f.body);
      ellipse(ctx, 0, -s * 0.5, s * 0.12, s * 0.45, f.inner);
      ctx.restore();
    }
  } else if (f.kind === "kitty") {
    for (const side of [-1, 1]) {
      ctx.fillStyle = f.body;
      ctx.beginPath();
      ctx.moveTo(side * s * 0.82, -s * 0.35);
      ctx.lineTo(side * s * 0.62, -s * 1.12);
      ctx.lineTo(side * s * 0.15, -s * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = f.inner;
      ctx.beginPath();
      ctx.moveTo(side * s * 0.68, -s * 0.5);
      ctx.lineTo(side * s * 0.58, -s * 0.95);
      ctx.lineTo(side * s * 0.3, -s * 0.75);
      ctx.closePath();
      ctx.fill();
    }
    // tail
    ctx.strokeStyle = f.body;
    ctx.lineWidth = s * 0.18;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s * 0.8, s * 0.4);
    ctx.quadraticCurveTo(s * 1.35, s * 0.1 + Math.sin(o.t * 4) * s * 0.15, s * 1.15, -s * 0.4);
    ctx.stroke();
  } else if (f.kind === "bear") {
    for (const side of [-1, 1]) {
      ellipse(ctx, side * s * 0.68, -s * 0.72, s * 0.3, s * 0.3, f.body);
      ellipse(ctx, side * s * 0.68, -s * 0.72, s * 0.16, s * 0.16, f.inner);
    }
  } else if (f.kind === "frog") {
    for (const side of [-1, 1]) ellipse(ctx, side * s * 0.45, -s * 0.72, s * 0.34, s * 0.32, f.body);
  } else if (f.kind === "niko") {
    // big fluffy tail behind the body
    ctx.save();
    ctx.translate(-s * 0.72, s * 0.2);
    ctx.rotate(Math.sin(o.t * 2.2) * 0.12);
    ctx.fillStyle = f.body;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-s * 0.55, s * 0.25, -s * 1.05, -s * 0.2, -s * 0.62, -s * 0.6);
    ctx.bezierCurveTo(-s * 0.38, -s * 0.86, -s * 0.02, -s * 0.5, 0, 0);
    ctx.fill();
    ellipse(ctx, -s * 0.58, -s * 0.56, s * 0.2, s * 0.18, f.belly);
    ctx.restore();
    // pointed ears
    for (const side of [-1, 1]) {
      ctx.fillStyle = f.body;
      ctx.beginPath();
      ctx.moveTo(side * s * 0.22, -s * 0.78);
      ctx.lineTo(side * s * 0.76, -s * 1.22);
      ctx.lineTo(side * s * 0.84, -s * 0.52);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = f.inner;
      ctx.beginPath();
      ctx.moveTo(side * s * 0.36, -s * 0.76);
      ctx.lineTo(side * s * 0.7, -s * 1.02);
      ctx.lineTo(side * s * 0.72, -s * 0.6);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ---- body
  ellipse(ctx, 0, 0, s, s * 0.95, f.body);
  ellipse(ctx, 0, s * 0.38, s * 0.62, s * 0.48, f.belly);
  // tiny highlight
  ellipse(ctx, -s * 0.45, -s * 0.5, s * 0.16, s * 0.1, "rgba(255,255,255,0.55)");

  // ---- face
  const eyeY = f.kind === "frog" ? -s * 0.72 : -s * 0.12;
  const eyeX = f.kind === "frog" ? s * 0.45 : s * 0.36;
  const er = s * 0.13;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (f.kind === "frog") {
    for (const side of [-1, 1]) ellipse(ctx, side * eyeX, eyeY, s * 0.24, s * 0.22, "#ffffff");
  }
  if (o.mood === "happy") {
    ctx.strokeStyle = ink;
    ctx.lineWidth = s * 0.08;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * eyeX, eyeY + er * 0.4, er, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
  } else if (o.blink) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = s * 0.07;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * eyeX - er, eyeY);
      ctx.lineTo(side * eyeX + er, eyeY);
      ctx.stroke();
    }
  } else {
    const big = o.mood === "oops" ? 1.2 : 1;
    for (const side of [-1, 1]) {
      ellipse(ctx, side * eyeX, eyeY, er * big, er * 1.15 * big, ink);
      ellipse(ctx, side * eyeX - er * 0.3, eyeY - er * 0.4, er * 0.38, er * 0.38, "#ffffff");
      ellipse(ctx, side * eyeX + er * 0.35, eyeY + er * 0.35, er * 0.16, er * 0.16, "#ffffff");
    }
  }

  // cheeks
  ellipse(ctx, -s * 0.62, s * 0.1, s * 0.15, s * 0.09, "rgba(255,120,150,0.45)");
  ellipse(ctx, s * 0.62, s * 0.1, s * 0.15, s * 0.09, "rgba(255,120,150,0.45)");

  // snout / nose
  const mouthY = f.kind === "frog" ? -s * 0.15 : f.kind === "niko" ? s * 0.24 : s * 0.12;
  if (f.kind === "niko") {
    // cream muzzle
    ellipse(ctx, 0, s * 0.2, s * 0.44, s * 0.29, f.belly);
    ellipse(ctx, 0, s * 0.02, s * 0.1, s * 0.07, ink);
    ellipse(ctx, -s * 0.12, s * 0.02, s * 0.03, s * 0.02, "rgba(255,255,255,0.6)");
  } else if (f.kind === "bear") {
    ellipse(ctx, 0, s * 0.12, s * 0.28, s * 0.2, f.belly);
    ellipse(ctx, 0, s * 0.04, s * 0.09, s * 0.06, ink);
  } else if (f.kind === "bunny" || f.kind === "kitty") {
    ctx.fillStyle = f.inner;
    ctx.beginPath();
    ctx.moveTo(-s * 0.07, s * 0.0);
    ctx.lineTo(s * 0.07, s * 0.0);
    ctx.lineTo(0, s * 0.07);
    ctx.closePath();
    ctx.fill();
  }

  // mouth
  ctx.strokeStyle = ink;
  ctx.lineWidth = s * 0.055;
  const my = mouthY + (f.kind === "bear" ? s * 0.06 : 0);
  if (o.mood === "happy") {
    ctx.fillStyle = "#ff7a9a";
    ctx.beginPath();
    ctx.moveTo(-s * 0.14, my);
    ctx.quadraticCurveTo(0, my + s * 0.3, s * 0.14, my);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (o.mood === "oops") {
    ellipse(ctx, 0, my + s * 0.06, s * 0.07, s * 0.09, ink);
    // sweat drop
    ctx.fillStyle = "#8fd3ff";
    ctx.beginPath();
    ctx.moveTo(s * 0.72, -s * 0.55);
    ctx.quadraticCurveTo(s * 0.86, -s * 0.3, s * 0.72, -s * 0.25);
    ctx.quadraticCurveTo(s * 0.58, -s * 0.3, s * 0.72, -s * 0.55);
    ctx.fill();
  } else if (f.kind === "frog") {
    ctx.beginPath();
    ctx.arc(0, my - s * 0.1, s * 0.3, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  } else if (f.kind === "niko") {
    ctx.beginPath();
    ctx.arc(0, my - s * 0.06, s * 0.11, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(-s * 0.07, my, s * 0.07, 0, Math.PI);
    ctx.arc(s * 0.07, my, s * 0.07, 0, Math.PI);
    ctx.stroke();
  }

  if (f.kind === "kitty") {
    ctx.strokeStyle = "rgba(59,47,74,0.5)";
    ctx.lineWidth = s * 0.03;
    for (const side of [-1, 1]) {
      for (let i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.moveTo(side * s * 0.3, s * 0.08 + i * s * 0.04);
        ctx.lineTo(side * s * 0.7, s * 0.04 + i * s * 0.1);
        ctx.stroke();
      }
    }
  }

  // little star charm for Niko
  if (f.kind === "niko" && !o.basket) {
    ctx.save();
    ctx.translate(0, s * 0.62);
    starPath(ctx, s * 0.16);
    ctx.fillStyle = "#ffd23f";
    ctx.fill();
    ctx.strokeStyle = "#e8a800";
    ctx.lineWidth = s * 0.035;
    ctx.stroke();
    ctx.restore();
  }

  // ---- basket
  if (o.basket) {
    const by = s * 0.55;
    const bw = s * 0.95;
    ctx.fillStyle = "#e4a75e";
    ctx.beginPath();
    ctx.moveTo(-bw, by);
    ctx.lineTo(bw, by);
    ctx.quadraticCurveTo(bw * 0.92, by + s * 0.62, 0, by + s * 0.66);
    ctx.quadraticCurveTo(-bw * 0.92, by + s * 0.62, -bw, by);
    ctx.fill();
    ctx.strokeStyle = "#c9873f";
    ctx.lineWidth = s * 0.05;
    for (let i = 1; i < 3; i++) {
      const yy = by + i * s * 0.2;
      const w = bw * (1 - i * 0.12);
      ctx.beginPath();
      ctx.moveTo(-w, yy);
      ctx.quadraticCurveTo(0, yy + s * 0.08, w, yy);
      ctx.stroke();
    }
    // rim
    ctx.fillStyle = "#b8742f";
    ctx.beginPath();
    ctx.ellipse(0, by, bw * 1.04, s * 0.11, 0, 0, TAU);
    ctx.fill();
    ellipse(ctx, 0, by - s * 0.01, bw * 0.92, s * 0.06, "#7a4b1e");
    // paws
    ellipse(ctx, -bw * 0.78, by - s * 0.02, s * 0.17, s * 0.14, f.body);
    ellipse(ctx, bw * 0.78, by - s * 0.02, s * 0.17, s * 0.14, f.body);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- Items
function starPath(ctx: Ctx, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.5;
    if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}

function tinyFace(ctx: Ctx, r: number, yOff = 0) {
  const ink = "#3b2f4a";
  ellipse(ctx, -r * 0.25, yOff - r * 0.02, r * 0.09, r * 0.11, ink);
  ellipse(ctx, r * 0.25, yOff - r * 0.02, r * 0.09, r * 0.11, ink);
  ellipse(ctx, -r * 0.28, yOff - r * 0.06, r * 0.035, r * 0.035, "#fff");
  ellipse(ctx, r * 0.22, yOff - r * 0.06, r * 0.035, r * 0.035, "#fff");
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, yOff + r * 0.1, r * 0.13, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ellipse(ctx, -r * 0.45, yOff + r * 0.15, r * 0.1, r * 0.06, "rgba(255,110,140,0.55)");
  ellipse(ctx, r * 0.45, yOff + r * 0.15, r * 0.1, r * 0.06, "rgba(255,110,140,0.55)");
}

export function drawStar(ctx: Ctx, x: number, y: number, r: number, rot: number, fill = "#ffd23f", edge = "#ffb000") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.lineJoin = "round";
  starPath(ctx, r);
  ctx.strokeStyle = edge;
  ctx.lineWidth = r * 0.35;
  ctx.stroke();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.rotate(-rot * 0.7);
  tinyFace(ctx, r, r * 0.05);
  ctx.restore();
}

export function drawRainbowStar(ctx: Ctx, x: number, y: number, r: number, rot: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
  // glow ring
  ctx.globalAlpha = 0.35;
  ellipse(ctx, 0, 0, r * 1.55, r * 1.55, `hsl(${(t * 200) % 360},100%,80%)`);
  ctx.globalAlpha = 1;
  ctx.rotate(rot);
  ctx.lineJoin = "round";
  starPath(ctx, r);
  ctx.strokeStyle = `hsl(${(t * 200 + 60) % 360},95%,62%)`;
  ctx.lineWidth = r * 0.35;
  ctx.stroke();
  ctx.fillStyle = `hsl(${(t * 200) % 360},100%,72%)`;
  ctx.fill();
  ctx.rotate(-rot);
  tinyFace(ctx, r, r * 0.05);
  ctx.restore();
}

export function drawStrawberry(ctx: Ctx, x: number, y: number, r: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot * 0.3);
  ctx.fillStyle = "#ff5a6e";
  ctx.beginPath();
  ctx.moveTo(0, r * 1.05);
  ctx.bezierCurveTo(-r * 1.25, r * 0.4, -r * 1.05, -r * 0.85, 0, -r * 0.7);
  ctx.bezierCurveTo(r * 1.05, -r * 0.85, r * 1.25, r * 0.4, 0, r * 1.05);
  ctx.fill();
  ctx.fillStyle = "#ffe9a8";
  const seeds = [[-0.45, -0.2], [0.45, -0.2], [-0.3, 0.35], [0.3, 0.35], [0, 0.7], [-0.6, 0.15], [0.6, 0.15]];
  for (const [sx, sy] of seeds) ellipse(ctx, sx * r, sy * r, r * 0.06, r * 0.09, "#ffe9a8");
  ctx.fillStyle = "#4fc26a";
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.55;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * r * 0.3, -r * 0.72 + Math.sin(a) * r * 0.1, r * 0.32, r * 0.13, a, 0, TAU);
    ctx.fill();
  }
  tinyFace(ctx, r * 0.9, r * 0.05);
  ctx.restore();
}

export function drawBlueberry(ctx: Ctx, x: number, y: number, r: number) {
  ctx.save();
  ctx.translate(x, y);
  ellipse(ctx, 0, 0, r, r, "#6a83ff");
  ellipse(ctx, -r * 0.35, -r * 0.4, r * 0.25, r * 0.16, "rgba(255,255,255,0.45)");
  ctx.fillStyle = "#3f55c9";
  ctx.beginPath();
  ctx.arc(0, -r * 0.82, r * 0.18, 0, TAU);
  ctx.fill();
  tinyFace(ctx, r * 0.9, r * 0.1);
  ctx.restore();
}

export function heartPath(ctx: Ctx, r: number) {
  ctx.beginPath();
  ctx.moveTo(0, r * 0.95);
  ctx.bezierCurveTo(-r * 1.4, 0, -r * 0.85, -r * 1.15, 0, -r * 0.45);
  ctx.bezierCurveTo(r * 0.85, -r * 1.15, r * 1.4, 0, 0, r * 0.95);
  ctx.closePath();
}

export function drawHeart(ctx: Ctx, x: number, y: number, r: number, pulse: number, fill = "#ff6fa5") {
  ctx.save();
  ctx.translate(x, y);
  const sc = 1 + Math.sin(pulse) * 0.08;
  ctx.scale(sc, sc);
  heartPath(ctx, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ellipse(ctx, -r * 0.45, -r * 0.35, r * 0.18, r * 0.12, "rgba(255,255,255,0.6)");
  tinyFace(ctx, r * 0.8, r * 0.05);
  ctx.restore();
}

export function drawGrumpyCloud(ctx: Ctx, x: number, y: number, r: number, t: number) {
  ctx.save();
  ctx.translate(x, y);
  const c = "#9aa4bf";
  ellipse(ctx, -r * 0.55, r * 0.1, r * 0.55, r * 0.45, c);
  ellipse(ctx, r * 0.55, r * 0.1, r * 0.55, r * 0.45, c);
  ellipse(ctx, 0, -r * 0.2, r * 0.7, r * 0.62, c);
  ellipse(ctx, 0, r * 0.25, r * 0.95, r * 0.35, c);
  ellipse(ctx, -r * 0.25, -r * 0.45, r * 0.25, r * 0.12, "rgba(255,255,255,0.35)");
  // rain drops
  ctx.fillStyle = "#7fc4ff";
  for (let i = -1; i <= 1; i++) {
    const dy = ((t * 2 + i * 0.33) % 1) * r * 0.6;
    ctx.globalAlpha = 1 - dy / (r * 0.6);
    ellipse(ctx, i * r * 0.4, r * 0.65 + dy, r * 0.07, r * 0.12, "#7fc4ff");
  }
  ctx.globalAlpha = 1;
  // pouty face
  const ink = "#3b3f5c";
  ctx.strokeStyle = ink;
  ctx.lineWidth = r * 0.07;
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ellipse(ctx, side * r * 0.28, -r * 0.05, r * 0.08, r * 0.1, ink);
    ctx.beginPath();
    ctx.moveTo(side * r * 0.4, -r * 0.28);
    ctx.lineTo(side * r * 0.16, -r * 0.2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, r * 0.3, r * 0.14, 1.15 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- World
function puffyCloud(ctx: Ctx, x: number, y: number, s: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, s, s * 0.45, 0, 0, TAU);
  ctx.ellipse(x - s * 0.45, y - s * 0.12, s * 0.45, s * 0.4, 0, 0, TAU);
  ctx.ellipse(x + s * 0.3, y - s * 0.25, s * 0.5, s * 0.48, 0, 0, TAU);
  ctx.fill();
}

function hill(ctx: Ctx, W: number, H: number, baseY: number, amp: number, freq: number, phase: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, H);
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    const y = baseY + Math.sin((x / W) * freq * TAU + phase) * amp + Math.sin((x / W) * freq * 2.3 * TAU + phase * 1.7) * amp * 0.3;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
}

export function drawWorld(ctx: Ctx, w: World, W: number, H: number, t: number, groundY: number, motion: number) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, w.skyTop);
  g.addColorStop(1, w.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const m = t * motion;
  const u = Math.min(W, H);

  // celestial body
  const cx = W * 0.82;
  const cy = H * 0.15;
  const cr = u * 0.075;
  if (w.celestial === "sun") {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(m * 0.15);
    ctx.fillStyle = "rgba(255,226,120,0.45)";
    for (let i = 0; i < 10; i++) {
      ctx.rotate(TAU / 10);
      ctx.beginPath();
      ctx.moveTo(-cr * 0.25, -cr * 1.15);
      ctx.lineTo(0, -cr * 1.65);
      ctx.lineTo(cr * 0.25, -cr * 1.15);
      ctx.fill();
    }
    ctx.restore();
    ellipse(ctx, cx, cy, cr, cr, "#ffe066");
    ellipse(ctx, cx - cr * 0.3, cy - cr * 0.1, cr * 0.09, cr * 0.11, "#7a5a16");
    ellipse(ctx, cx + cr * 0.3, cy - cr * 0.1, cr * 0.09, cr * 0.11, "#7a5a16");
    ctx.strokeStyle = "#7a5a16";
    ctx.lineWidth = cr * 0.07;
    ctx.beginPath();
    ctx.arc(cx, cy + cr * 0.12, cr * 0.25, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ellipse(ctx, cx - cr * 0.55, cy + cr * 0.2, cr * 0.14, cr * 0.08, "rgba(255,140,90,0.5)");
    ellipse(ctx, cx + cr * 0.55, cy + cr * 0.2, cr * 0.14, cr * 0.08, "rgba(255,140,90,0.5)");
  } else {
    ellipse(ctx, cx, cy, cr * 1.5, cr * 1.5, "rgba(255,250,210,0.12)");
    ellipse(ctx, cx, cy, cr, cr, "#fff6c9");
    ellipse(ctx, cx + cr * 0.4, cy - cr * 0.15, cr * 0.8, cr * 0.85, w.skyTop);
    ctx.strokeStyle = "#8a7d4a";
    ctx.lineWidth = cr * 0.06;
    ctx.beginPath();
    ctx.arc(cx - cr * 0.55, cy + cr * 0.05, cr * 0.1, 0, Math.PI);
    ctx.stroke();
  }

  // twinkles for night
  if (w.decor === "twinkles") {
    for (let i = 0; i < 40; i++) {
      const x = prand(i) * W;
      const y = prand(i + 100) * groundY * 0.8;
      const a = 0.45 + 0.55 * Math.abs(Math.sin(m * 1.2 + i));
      ctx.globalAlpha = a;
      const r = 1 + prand(i + 200) * 2.2;
      ellipse(ctx, x, y, r, r, "#fff7c2");
    }
    ctx.globalAlpha = 1;
  }

  // drifting puffy clouds
  const cloudColor = w.decor === "twinkles" ? "rgba(180,170,255,0.25)" : w.decor === "candy" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.9)";
  for (let i = 0; i < 4; i++) {
    const s = u * (0.07 + prand(i + 7) * 0.06);
    const speed = 8 + prand(i + 3) * 14;
    const span = W + s * 4;
    const x = ((prand(i) * span + m * speed) % span) - s * 2;
    const y = H * (0.08 + prand(i + 11) * 0.3);
    puffyCloud(ctx, x, y, s, cloudColor);
  }

  // hills
  const phaseBack = m * 0.05;
  if (w.decor === "waves") {
    // sea
    ctx.fillStyle = w.hillBack;
    ctx.fillRect(0, groundY - u * 0.16, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let row = 0; row < 2; row++) {
      const yy = groundY - u * 0.16 + row * u * 0.06;
      ctx.beginPath();
      ctx.moveTo(0, yy + 4);
      for (let x = 0; x <= W; x += W / 24) ctx.lineTo(x, yy + Math.sin(x * 0.03 + m * (1.5 + row)) * 3);
      ctx.lineTo(W, yy + 6);
      for (let x = W; x >= 0; x -= W / 24) ctx.lineTo(x, yy + 5 + Math.sin(x * 0.03 + m * (1.5 + row)) * 3);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    hill(ctx, W, H, groundY - u * 0.13, u * 0.05, 1.3, phaseBack, w.hillBack);
  }
  hill(ctx, W, H, groundY - u * 0.02, u * 0.025, 0.9, 1.3, w.hillFront);

  // decor on front hill
  if (w.decor === "flowers") {
    for (let i = 0; i < 9; i++) {
      const x = ((i + 0.5) / 9) * W + (prand(i) - 0.5) * 30;
      const y = groundY + 4 + prand(i + 5) * u * 0.05;
      const sway = Math.sin(m * 2 + i) * 3;
      ctx.strokeStyle = "#3e9a45";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 8);
      ctx.lineTo(x + sway, y - 6);
      ctx.stroke();
      const col = ["#ff8fb8", "#ffd23f", "#ffffff", "#c9a3ff"][i % 4];
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * TAU + m * 0.5;
        ellipse(ctx, x + sway + Math.cos(a) * 4.5, y - 6 + Math.sin(a) * 4.5, 3.4, 3.4, col);
      }
      ellipse(ctx, x + sway, y - 6, 2.8, 2.8, "#ffb000");
    }
  } else if (w.decor === "waves") {
    for (let i = 0; i < 5; i++) {
      const x = ((i + 0.5) / 5) * W;
      const y = groundY + 10 + prand(i + 2) * 12;
      // seashell
      ctx.fillStyle = i % 2 ? "#ffb3c7" : "#fff3e0";
      ctx.beginPath();
      ctx.arc(x, y, 6, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
    }
  } else if (w.decor === "candy") {
    for (let i = 0; i < 5; i++) {
      const x = ((i + 0.5) / 5) * W + (prand(i) - 0.5) * 40;
      const y = groundY - 6;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + 14);
      ctx.lineTo(x, y - 14);
      ctx.stroke();
      ctx.save();
      ctx.translate(x, y - 22);
      ctx.rotate(m * 0.6 + i);
      ellipse(ctx, 0, 0, 10, 10, ["#ff7ab6", "#7ad7ff", "#ffd23f", "#a98bff", "#7be08f"][i]);
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 1.3);
      ctx.stroke();
      ctx.restore();
    }
  } else if (w.decor === "twinkles") {
    for (let i = 0; i < 6; i++) {
      const x = ((i + 0.5) / 6) * W;
      const y = groundY - 10 - Math.sin(m * 1.5 + i * 2) * 14;
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(m * 3 + i);
      ellipse(ctx, x, y, 3, 3, "#fff59a");
      ellipse(ctx, x, y, 7, 7, "rgba(255,245,154,0.25)");
    }
    ctx.globalAlpha = 1;
  }

  // ground strip
  ctx.fillStyle = w.ground;
  ctx.fillRect(0, groundY + u * 0.06, W, H);
}

// ---------------------------------------------------------------- Calm Cove
export function drawCoveWorld(ctx: Ctx, W: number, H: number, t: number, groundY: number, motion: number) {
  const m = t * motion;
  const u = Math.min(W, H);
  const horizon = groundY - Math.max(H * 0.14, u * 0.12);

  // dusk sky
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, "#2f3a78");
  sky.addColorStop(0.55, "#7d7bc4");
  sky.addColorStop(1, "#ffc7b2");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // stars, soft and twinkling
  for (let i = 0; i < 46; i++) {
    const x = prand(i + 3) * W;
    const y = prand(i + 51) * horizon * 0.85;
    const a = 0.25 + 0.5 * Math.abs(Math.sin(m * 0.9 + i * 1.7));
    ctx.globalAlpha = a;
    const r = 1 + prand(i + 91) * 1.8;
    ellipse(ctx, x, y, r, r, "#fff4cf");
  }
  ctx.globalAlpha = 1;

  // friendly moon
  const mx = W * 0.8;
  const my = horizon * 0.26;
  const mr = Math.max(18, u * 0.065);
  ellipse(ctx, mx, my, mr * 1.9, mr * 1.9, "rgba(255,243,200,0.12)");
  ellipse(ctx, mx, my, mr * 1.35, mr * 1.35, "rgba(255,243,200,0.16)");
  ellipse(ctx, mx, my, mr, mr, "#fff3c4");
  ellipse(ctx, mx - mr * 0.32, my - mr * 0.05, mr * 0.09, mr * 0.11, "#8a7a4e");
  ellipse(ctx, mx + mr * 0.32, my - mr * 0.05, mr * 0.09, mr * 0.11, "#8a7a4e");
  ctx.strokeStyle = "#8a7a4e";
  ctx.lineWidth = mr * 0.07;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(mx, my + mr * 0.15, mr * 0.26, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ellipse(ctx, mx - mr * 0.58, my + mr * 0.22, mr * 0.14, mr * 0.08, "rgba(255,160,150,0.45)");
  ellipse(ctx, mx + mr * 0.58, my + mr * 0.22, mr * 0.14, mr * 0.08, "rgba(255,160,150,0.45)");

  // distant hills
  hill(ctx, W, H, horizon + u * 0.01, u * 0.045, 1.1, 0.6, "#4b4f8c");
  hill(ctx, W, H, horizon + u * 0.035, u * 0.03, 0.8, 2.4, "#3d4179");

  // sea
  const sea = ctx.createLinearGradient(0, horizon, 0, groundY);
  sea.addColorStop(0, "#6f9fc4");
  sea.addColorStop(1, "#8fd9d2");
  ctx.fillStyle = sea;
  ctx.fillRect(0, horizon, W, groundY - horizon);
  // moon path and shimmer
  ctx.strokeStyle = "rgba(255,246,205,0.5)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const yy = horizon + 8 + i * ((groundY - horizon - 16) / 6);
    const w = u * (0.05 + i * 0.02);
    const xx = mx + Math.sin(m * 0.8 + i) * 6;
    ctx.beginPath();
    ctx.moveTo(xx - w, yy);
    ctx.lineTo(xx + w, yy);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const yy = horizon + 12 + i * ((groundY - horizon - 20) / 5);
    const off = ((m * (10 + i * 4)) % (W + 80)) - 40;
    ctx.beginPath();
    ctx.moveTo(off, yy);
    ctx.quadraticCurveTo(off + 20, yy - 3, off + 40, yy);
    ctx.stroke();
  }

  // sandy shore
  const sand = ctx.createLinearGradient(0, groundY, 0, H);
  sand.addColorStop(0, "#f4ddb4");
  sand.addColorStop(1, "#e9c894");
  ctx.fillStyle = sand;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= W; x += W / 18) ctx.lineTo(x, groundY + Math.sin(x * 0.02 + 1) * 2);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // foam at the waterline
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.beginPath();
  ctx.moveTo(0, groundY + 1);
  for (let x = 0; x <= W; x += W / 20) {
    const y = groundY + Math.sin(x * 0.03 + m * 1.4) * 2.5;
    ctx.lineTo(x, y);
  }
  for (let x = W; x >= 0; x -= W / 20) {
    const y = groundY + 5 + Math.sin(x * 0.03 + m * 1.4) * 2.5;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // shells & speckles
  for (let i = 0; i < 12; i++) {
    const x = prand(i + 200) * W;
    const y = groundY + 14 + prand(i + 300) * (H - groundY - 20);
    if (i % 4 === 0) {
      ctx.fillStyle = ["#ffc2d4", "#fff6e6", "#cbb6ff"][i % 3];
      ctx.beginPath();
      ctx.arc(x, y, 5, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ellipse(ctx, x, y, 1.6, 1.2, "rgba(180,140,90,0.35)");
    }
  }

  // grass tufts at the sides
  for (const side of [0, 1]) {
    const baseX = side ? W - u * 0.07 : u * 0.07;
    for (let i = 0; i < 4; i++) {
      const bx = baseX + (i - 1.5) * 9;
      const sway = Math.sin(m * 1.2 + i) * 3;
      ctx.strokeStyle = "#6fae86";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, groundY + 8);
      ctx.quadraticCurveTo(bx + sway, groundY - 10, bx + sway * 2, groundY - 22 - i * 4);
      ctx.stroke();
    }
  }

  // fireflies
  for (let i = 0; i < 16; i++) {
    const x = prand(i + 11) * W + Math.sin(m * 0.5 + i) * u * 0.03;
    const y = horizon + (prand(i + 71) * (groundY - horizon - 10)) + Math.sin(m * 0.9 + i * 2) * 8;
    const a = 0.35 + 0.65 * Math.abs(Math.sin(m * 1.3 + i));
    ctx.globalAlpha = a;
    ellipse(ctx, x, y, 7, 7, "rgba(255,246,150,0.16)");
    ellipse(ctx, x, y, 2.2, 2.2, "#fff6a3");
  }
  ctx.globalAlpha = 1;
}

const FLOWER_COLORS = [
  ["#ff9ec7", "#ffd1e6"],
  ["#ffd76a", "#fff0b3"],
  ["#b6a4ff", "#e0d6ff"],
  ["#8fe6c2", "#d6fff0"],
  ["#8fd3ff", "#d9f1ff"],
];

export function drawCoveFlower(ctx: Ctx, x: number, y: number, scale: number, colorIdx: number, t: number, seed: number) {
  if (scale <= 1) return;
  const sway = Math.sin(t * 1.4 + seed) * 0.09;
  const [petal, light] = FLOWER_COLORS[colorIdx % FLOWER_COLORS.length];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(sway * 0.4);
  ctx.scale(scale, scale);
  // glow pad
  ellipse(ctx, 0, 2, 20, 6, "rgba(90,160,130,0.18)");
  // stem
  ctx.strokeStyle = "#5aab77";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(sway * 20, -20, 0, -38);
  ctx.stroke();
  // leaves
  ellipse(ctx, -8, -18, 8, 3.5, "#6fc18c");
  ellipse(ctx, 9, -26, 8, 3.5, "#7ed09a");
  // petals
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    ellipse(ctx, Math.cos(a) * 9 + sway * 6, -44 + Math.sin(a) * 9, 7.5, 7.5, petal);
    ellipse(ctx, Math.cos(a) * 9 + sway * 6 - 1.5, -46 + Math.sin(a) * 9, 2.2, 2.2, light);
  }
  // smiling centre
  ellipse(ctx, sway * 6, -44, 8, 8, "#ffcf5c");
  ellipse(ctx, sway * 6 - 2.4, -45, 1.4, 1.8, "#7a5a16");
  ellipse(ctx, sway * 6 + 2.4, -45, 1.4, 1.8, "#7a5a16");
  ctx.strokeStyle = "#7a5a16";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(sway * 6, -43, 2.6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- Find a Friend
export function drawButterfly(ctx: Ctx, x: number, y: number, r: number, t: number, color = "#ffc2da") {
  ctx.save();
  ctx.translate(x, y);
  const flap = 0.55 + 0.45 * Math.abs(Math.sin(t * 4));
  // wings
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side * flap, 1);
    ellipse(ctx, r * 0.55, -r * 0.42, r * 0.55, r * 0.45, color);
    ellipse(ctx, r * 0.5, r * 0.38, r * 0.42, r * 0.32, color);
    ctx.globalAlpha = 0.5;
    ellipse(ctx, r * 0.62, -r * 0.44, r * 0.2, r * 0.16, "#ffffff");
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  // body
  ellipse(ctx, 0, r * 0.02, r * 0.14, r * 0.62, "#6b4a86");
  ellipse(ctx, 0, -r * 0.5, r * 0.17, r * 0.17, "#6b4a86");
  // antennae
  ctx.strokeStyle = "#6b4a86";
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * r * 0.06, -r * 0.6);
    ctx.quadraticCurveTo(side * r * 0.3, -r * 1.0, side * r * 0.42, -r * 0.92);
    ctx.stroke();
    ellipse(ctx, side * r * 0.44, -r * 0.93, r * 0.07, r * 0.07, "#6b4a86");
  }
  // tiny face
  ellipse(ctx, -r * 0.06, -r * 0.53, r * 0.03, r * 0.04, "#fff");
  ellipse(ctx, r * 0.06, -r * 0.53, r * 0.03, r * 0.04, "#fff");
  ctx.restore();
}

export function drawFindScene(
  ctx: Ctx,
  key: string,
  W: number,
  H: number,
  t: number,
  found: Set<string>,
  things: { id: string; kind: string; x: number; y: number; size: number; rot: number }[],
  friends: Record<string, FriendInfo>,
  calm: boolean,
  celebratingId: string | null,
) {
  const night = key === "party";
  const meadow = key === "meadow";
  const u = Math.min(W, H);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  if (night) {
    sky.addColorStop(0, "#3a3f7d");
    sky.addColorStop(0.6, "#8b83c9");
    sky.addColorStop(1, "#f7d6c4");
  } else if (meadow) {
    sky.addColorStop(0, "#ffd9f0");
    sky.addColorStop(0.55, "#f3ecff");
    sky.addColorStop(1, "#e9ffd9");
  } else {
    sky.addColorStop(0, "#bdeaff");
    sky.addColorStop(0.6, "#eaf9ff");
    sky.addColorStop(1, "#f0ffe4");
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  const m = t * (calm ? 0.4 : 1);

  // sun or moon
  if (night) {
    const mx = W * 0.82;
    const my = H * 0.16;
    ellipse(ctx, mx, my, u * 0.1, u * 0.1, "rgba(255,246,200,0.18)");
    ellipse(ctx, mx, my, u * 0.065, u * 0.065, "#fff3c4");
    ellipse(ctx, mx + u * 0.025, my - u * 0.01, u * 0.052, u * 0.055, "#4c518f");
    ellipse(ctx, mx - u * 0.05, my + u * 0.02, u * 0.012, u * 0.006, "rgba(255,160,150,0.5)");
    ellipse(ctx, mx + u * 0.055, my + u * 0.04, u * 0.012, u * 0.006, "rgba(255,160,150,0.5)");
    ctx.strokeStyle = "#8a7d4a";
    ctx.lineWidth = u * 0.005;
    ctx.beginPath();
    ctx.arc(mx - u * 0.02, my + u * 0.012, u * 0.018, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    for (let i = 0; i < 44; i++) {
      const x = prand(i) * W;
      const y = prand(i + 90) * H * 0.5;
      ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(m * 1.1 + i));
      ellipse(ctx, x, y, 1.3, 1.3, "#fff7c2");
    }
    ctx.globalAlpha = 1;
  } else {
    const sx = W * 0.84;
    const sy = H * 0.14;
    ellipse(ctx, sx, sy, u * 0.09, u * 0.09, "#ffe066");
    ellipse(ctx, sx, sy, u * 0.135, u * 0.135, "rgba(255,224,102,0.22)");
    ellipse(ctx, sx - u * 0.03, sy - u * 0.01, u * 0.08, u * 0.008, "#ffe066");
    ellipse(ctx, sx + u * 0.03, sy - u * 0.01, u * 0.08, u * 0.008, "#ffe066");
    ellipse(ctx, sx - u * 0.012, sy - u * 0.012, u * 0.008, u * 0.01, "#7a5a16");
    ellipse(ctx, sx + u * 0.014, sy - u * 0.012, u * 0.008, u * 0.01, "#7a5a16");
    ctx.strokeStyle = "#7a5a16";
    ctx.lineWidth = u * 0.005;
    ctx.beginPath();
    ctx.arc(sx, sy + u * 0.012, u * 0.02, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ellipse(ctx, sx - u * 0.045, sy + u * 0.03, u * 0.012, u * 0.006, "rgba(255,150,120,0.5)");
    ellipse(ctx, sx + u * 0.045, sy + u * 0.03, u * 0.012, u * 0.006, "rgba(255,150,120,0.5)");
  }
  // clouds / balloons
  for (let i = 0; i < 3; i++) {
    const cw = u * (0.07 + prand(i) * 0.04);
    const x = (((prand(i + 4) * (W + cw * 2) + m * (6 + i * 4)) % (W + cw * 2)) - cw);
    const y = H * (0.14 + prand(i + 8) * 0.24);
    ctx.fillStyle = night ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.ellipse(x, y, cw, cw * 0.42, 0, 0, Math.PI * 2);
    ctx.ellipse(x + cw * 0.55, y - cw * 0.18, cw * 0.45, cw * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // hills
  const hillY = H * 0.62;
  ctx.fillStyle = night ? "#6e6aa8" : meadow ? "#b9dcf5" : "#b7e2a6";
  ctx.beginPath();
  ctx.ellipse(W * 0.25, hillY + H * 0.13, W * 0.55, H * 0.16, 0, 0, Math.PI * 2);
  ctx.ellipse(W * 0.8, hillY + H * 0.14, W * 0.5, H * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = night ? "#4f4b86" : meadow ? "#cdefa9" : "#a5db92";
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 1.02, W * 0.95, H * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = night ? "#3f3c72" : meadow ? "#b3e58f" : "#8fd47c";
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 1.12, W * 1.0, H * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();

  // friendly scenery details that are never asked about
  const decor = meadow ? 10 : 9;
  for (let i = 0; i < decor; i++) {
    const x = (i + 0.5) * (W / decor) + Math.sin(i * 7) * W * 0.02;
    const y = H * (0.8 + prand(i + 3) * 0.14);
    const r = u * (0.012 + prand(i + 5) * 0.008);
    ctx.strokeStyle = night ? "#8fd6a0" : "#5faa5a";
    ctx.lineWidth = Math.max(1.5, u * 0.005);
    ctx.beginPath();
    ctx.moveTo(x, y + r * 2);
    ctx.lineTo(x + Math.sin(m + i) * r, y - r * 2);
    ctx.stroke();
    const petal = night ? ["#c9a3ff", "#fff3c4", "#bbd6ff"][i % 3] : meadow ? ["#ffb3d1", "#ffd6e8", "#e0d0ff"][i % 3] : ["#ffcf5c", "#ffffff", "#ffb3c7"][i % 3];
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2 + m * 0.3;
      ellipse(ctx, x + Math.cos(a) * r, y - r * 2 + Math.sin(a) * r, r, r, petal);
    }
    ellipse(ctx, x, y - r * 2, r * 0.8, r * 0.8, "#ffcf5c");
  }

  // the hidden things
  const fish = things.map((thing) => {
    // keep every hidden thing comfortably visible and tappable, even on small phones
    const scale = Math.max(u * 0.068, thing.size * Math.min(W, H * 1.15));
    const tw = Math.min(W - scale, Math.max(scale, thing.x * W));
    const th = Math.min(H - scale, Math.max(scale, thing.y * H));
    return { ...thing, px: tw, py: th, sh: scale };
  });
  // back-to-front so larger pals sit in front of small treats
  fish.sort((a, b) => a.sh - b.sh);
  for (const f of fish) {
    const alpha = found.has(f.id) ? 0.28 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (found.has(f.id)) {
      ctx.translate(f.px, f.py);
      ctx.rotate(f.rot);
      ctx.scale(0.86, 0.86);
      ctx.translate(-f.px, -f.py);
    }
    const s = f.sh;
    switch (f.kind) {
      case "strawberry":
        drawStrawberry(ctx, f.px, f.py, s * 0.42, f.rot);
        break;
      case "blueberry":
        drawBlueberry(ctx, f.px, f.py, s * 0.44);
        break;
      case "star":
        drawStar(ctx, f.px, f.py, s * 0.5, f.rot);
        break;
      case "heart":
        drawHeart(ctx, f.px, f.py, s * 0.42, t * 3, night ? "#c9a3ff" : "#ff9ec7");
        break;
      case "butterfly":
        drawButterfly(ctx, f.px, f.py, s * 0.45, t + f.rot, meadow ? "#ffe066" : "#c9a3ff");
        break;
      default: {
        const friend = friends[f.kind];
        if (friend) drawFriend(ctx, friend, f.px, f.py, s * 0.46, { t: t + f.rot * 2, mood: found.has(f.id) ? "happy" : "idle", blink: false, squash: 0, tilt: f.rot * 0.4, basket: false });
      }
    }
    ctx.restore();
    if (found.has(f.id)) {
      ctx.strokeStyle = "rgba(60,198,138,0.85)";
      ctx.lineWidth = Math.max(2, u * 0.007);
      ctx.setLineDash([u * 0.012, u * 0.012]);
      ctx.beginPath();
      ctx.arc(f.px, f.py, f.sh * 0.52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (celebratingId === f.id) {
      ctx.strokeStyle = "rgba(255,210,63,0.9)";
      ctx.lineWidth = Math.max(2, u * 0.01);
      ctx.beginPath();
      ctx.arc(f.px, f.py, f.sh * (0.6 + 0.12 * Math.sin(t * 8)), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

/** Distinct gentle underwater backdrop for Shape Finder. */
export function drawOceanWorld(ctx: Ctx, W: number, H: number, time: number, groundY: number) {
  const water = ctx.createLinearGradient(0, 0, 0, H);
  water.addColorStop(0, "#74d9f8");
  water.addColorStop(0.65, "#1c9bc8");
  water.addColorStop(1, "#12678f");
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  for (let i = 0; i < 7; i++) {
    const x = W * (0.1 + i * 0.145) + Math.sin(time * 0.3 + i) * 8;
    ctx.fillStyle = "rgba(255,255,255,0.13)";
    ctx.beginPath();
    ctx.moveTo(x - 28, 0);
    ctx.lineTo(x + 14, 0);
    ctx.lineTo(x + H * 0.15, groundY);
    ctx.lineTo(x - H * 0.06, groundY);
    ctx.fill();
  }
  ctx.fillStyle = "#f4d9a2";
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= W + 20; x += 20) ctx.lineTo(x, groundY + Math.sin(x * 0.025) * 8);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
  for (let i = 0; i < 22; i++) {
    const x = ((i * 137 + 31) % Math.max(1, W));
    const y = ((i * 97 - time * (7 + i % 4) + H * 40) % Math.max(1, groundY));
    const radius = 3 + i % 6;
    ctx.strokeStyle = "rgba(225,250,255,0.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 12; i++) {
    const x = W * (i + 0.5) / 12;
    const y = groundY + 12;
    const sway = Math.sin(time * 1.4 + i) * 7;
    ctx.strokeStyle = i % 2 ? "#2da68c" : "#2fc1a4";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + 45);
    ctx.quadraticCurveTo(x + sway, y + 5, x + sway * 2, y - 35 - i % 3 * 12);
    ctx.stroke();
    ctx.fillStyle = ["#ff8b9e", "#ffbd68", "#a997f9"][i % 3];
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.arc(x + sway + j * 9 - 9, y + 28 - j * 14, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawGalaxyWorld(ctx: Ctx, W: number, H: number, time: number, groundY: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#171747"); sky.addColorStop(0.6, "#43337e"); sky.addColorStop(1, "#7059a7");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 85; i++) {
    const x = (i * 157 + 29) % Math.max(1, W), y = (i * 101 + 47) % Math.max(1, groundY);
    ctx.globalAlpha = 0.55 + 0.3 * Math.sin(time * 1.2 + i * 2);
    ctx.fillStyle = i % 3 ? "#ffffff" : "#ffdc8b";
    ctx.beginPath(); ctx.arc(x, y, i % 9 === 0 ? 2.3 : 1.1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#d0a3ec"; ctx.beginPath();
  ctx.arc(W * 0.8, H * 0.23, Math.min(W * 0.14, 65), 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(249,218,255,0.8)"; ctx.lineWidth = 7; ctx.beginPath();
  ctx.ellipse(W * 0.8, H * 0.23, Math.min(W * 0.21, 98), Math.min(W * 0.05, 25), -0.35, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#6152a1"; ctx.beginPath(); ctx.moveTo(0, groundY);
  for (let x = 0; x <= W + 16; x += 16) ctx.lineTo(x, groundY - 12 + Math.sin(x * 0.018) * 11);
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
}

export function drawFarmWorld(ctx: Ctx, W: number, H: number, time: number, groundY: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#a7e6ff"); sky.addColorStop(1, "#e8f8d6");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#ffe38d"; ctx.beginPath(); ctx.arc(W * 0.8, H * 0.17, 37, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8bd19b"; ctx.beginPath(); ctx.ellipse(W * 0.25, groundY + 20, W * 0.75, H * 0.24, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#60b883"; ctx.beginPath(); ctx.ellipse(W * 0.8, groundY + 30, W * 0.7, H * 0.22, 0, Math.PI, Math.PI * 2); ctx.fill();
  const bx = W * 0.22, by = groundY - H * 0.21, bw = Math.min(130, W * 0.27), bh = H * 0.2;
  ctx.fillStyle = "#df6f63"; ctx.fillRect(bx, by, bw, bh);
  ctx.beginPath(); ctx.moveTo(bx - 10, by); ctx.lineTo(bx + bw / 2, by - bh * 0.45); ctx.lineTo(bx + bw + 10, by); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff4d9"; ctx.fillRect(bx + bw * 0.35, by + bh * 0.38, bw * 0.3, bh * 0.62);
  ctx.fillStyle = "#75bd78"; ctx.fillRect(0, groundY, W, H - groundY);
  ctx.strokeStyle = "#fff7e8"; ctx.lineWidth = 5;
  for (let x = 0; x < W; x += 55) {
    ctx.beginPath(); ctx.moveTo(x, groundY - 12); ctx.lineTo(x, groundY + 30); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, groundY + 2); ctx.lineTo(W, groundY + 2); ctx.stroke();
  for (let i = 0; i < 13; i++) {
    const x = (i * 83 + 17) % Math.max(1, W);
    ctx.fillStyle = i % 2 ? "#ffd66e" : "#ff9ab5";
    ctx.beginPath(); ctx.arc(x, groundY + 32 + Math.sin(time + i) * 2, 4, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawForestWorld(ctx: Ctx, W: number, H: number, time: number, groundY: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#a8dccc"); sky.addColorStop(1, "#e8f6cb");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#b6dfac"; ctx.beginPath();
  ctx.ellipse(W * 0.5, groundY + 25, W * 0.8, H * 0.26, 0, Math.PI, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 9; i++) {
    const x = (i + 0.35) * W / 9, h = H * (0.25 + (i % 3) * 0.06);
    ctx.fillStyle = "#92735f"; ctx.fillRect(x - 9, groundY - h, 18, h + 20);
    ctx.fillStyle = i % 2 ? "#5da982" : "#70b98b";
    for (let j = 0; j < 3; j++) {
      ctx.beginPath(); ctx.arc(x + (j - 1) * 22, groundY - h + 8 + Math.sin(time * 0.5 + i + j) * 2, 32, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.fillStyle = "#8dcc91"; ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = "#d9caa1"; ctx.beginPath(); ctx.ellipse(W * 0.5, H + 25, W * 0.28, H - groundY + 40, 0, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 12; i++) {
    const x = (i * 83 + 19) % Math.max(1, W), y = groundY + 18 + (i % 4) * 13;
    ctx.fillStyle = i % 2 ? "#ffe9a5" : "#ffc6d9";
    ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawBambooWorld(ctx: Ctx, W: number, H: number, time: number, groundY: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#c7f2d6"); sky.addColorStop(1, "#f1f8ce");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#b5e4b0"; ctx.beginPath();
  ctx.ellipse(W / 2, groundY + 20, W * 0.8, H * 0.19, 0, Math.PI, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 11; i++) {
    const x = (i + 0.5) * W / 11, top = groundY - H * (0.22 + (i % 4) * 0.06);
    ctx.fillStyle = i % 2 ? "#6fbf7d" : "#84ce88";
    ctx.fillRect(x - 7, top, 14, groundY - top + 12);
    ctx.strokeStyle = "#4f9b67"; ctx.lineWidth = 3;
    for (let y = top + 28; y < groundY; y += 37) {
      ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y); ctx.stroke();
    }
    ctx.fillStyle = "#59aa70";
    for (let j = 0; j < 4; j++) {
      const y = top + 22 + j * 47, side = j % 2 ? -1 : 1;
      ctx.beginPath(); ctx.ellipse(x + side * 19, y, 25, 7, side * 0.4, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.fillStyle = "#83c98c"; ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = "#d3dfac"; ctx.beginPath();
  ctx.ellipse(W * 0.5, H + 25, W * 0.3, H - groundY + 42, 0, 0, Math.PI * 2); ctx.fill();
}

export function drawSnowWorld(ctx: Ctx, W: number, H: number, time: number, groundY: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#87b8e6");
  sky.addColorStop(1, "#e3f5ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#d1e9f5";
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= W + 12; x += 12) ctx.lineTo(x, groundY - H * 0.17 - Math.sin(x * 0.014) * 30);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
  ctx.fillStyle = "#f8fcff";
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= W + 12; x += 12) ctx.lineTo(x, groundY - 8 + Math.sin(x * 0.023) * 8);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
  for (let i = 0; i < 12; i++) {
    const x = (i * 137 + 23) % Math.max(1, W);
    const y = (i * 89 + time * (i % 3 + 1) * 3) % Math.max(1, groundY);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(x, y, 2 + i % 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
