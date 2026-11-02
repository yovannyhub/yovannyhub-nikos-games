import { useEffect, useRef } from "react";
import { drawFriend } from "../game/draw";
import { FRIENDS, type FriendKind } from "../game/types";

export function FriendPreview({ kind, size = 72, basket = false }: { kind: FriendKind; size?: number; basket?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = size * dpr;
    c.height = size * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const f = FRIENDS.find((x) => x.kind === kind) || FRIENDS[0];
    drawFriend(ctx, f, size / 2, size * 0.6, size * 0.28, { t: 0, mood: "happy", blink: false, squash: 0, tilt: 0, basket });
  }, [kind, size, basket]);
  return <canvas ref={ref} style={{ width: size, height: size }} aria-hidden="true" />;
}
