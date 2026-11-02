import { useEffect, useRef } from "react";
import { drawBlueberry, drawHeart, drawStar, drawStrawberry } from "../game/draw";

export type CountItem = "strawberry" | "blueberry" | "star" | "heart";

export const ITEM_INFO: Record<CountItem, { one: string; plural: string }> = {
  strawberry: { one: "strawberry", plural: "strawberries" },
  blueberry: { one: "blueberry", plural: "blueberries" },
  star: { one: "star", plural: "stars" },
  heart: { one: "heart", plural: "hearts" },
};

export function ItemPreview({ kind, size = 48 }: { kind: CountItem; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(size * dpr);
    c.height = Math.round(size * dpr);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size * 0.56;
    if (kind === "strawberry") drawStrawberry(ctx, cx, cy, size * 0.29, 0);
    else if (kind === "blueberry") drawBlueberry(ctx, cx, cy, size * 0.32);
    else if (kind === "star") drawStar(ctx, cx, cy, size * 0.34, -0.15);
    else drawHeart(ctx, cx, cy, size * 0.29, 0);
  }, [kind, size]);
  return <canvas ref={ref} style={{ width: size, height: size }} aria-hidden="true" />;
}
