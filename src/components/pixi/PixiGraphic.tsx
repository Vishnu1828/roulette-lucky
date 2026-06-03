import { FederatedPointerEvent, Graphics } from "pixi.js";
import { useCallback } from "react";
import { extend } from "@pixi/react";

extend({ Graphics });

type PixiGraphicProps = {
  draw: (g: Graphics) => void;
  x?: number;
  y?: number;
  alpha?: number;
  eventMode?: "none" | "passive" | "auto" | "static" | "dynamic";
  cursor?: string;

  onPointerDown?: (e: FederatedPointerEvent) => void;
  onPointerMove?: (e: FederatedPointerEvent) => void;
  onPointerUp?: (e: FederatedPointerEvent) => void;
  onPointerUpOutside?: (e: FederatedPointerEvent) => void;
  onPointerCancel?: (e: FederatedPointerEvent) => void;
  onPointerTap?: (e: FederatedPointerEvent) => void;
  onPointerEnter?: (e: FederatedPointerEvent) => void;
  onPointerLeave?: (e: FederatedPointerEvent) => void;
};

export function PixiGraphic({
  draw,
  x = 0,
  y = 0,
  alpha = 1,
  eventMode = "none",
  cursor,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerUpOutside,
  onPointerCancel,
  onPointerTap,
  onPointerEnter,
  onPointerLeave,
}: PixiGraphicProps) {
  const drawCallback = useCallback(
    (g: Graphics) => {
      g.clear();
      draw(g);
    },
    [draw],
  );

  return (
    <pixiGraphics
      x={x}
      y={y}
      alpha={alpha}
      draw={drawCallback}
      eventMode={eventMode}
      cursor={cursor}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerUpOutside={onPointerUpOutside}
      onPointerCancel={onPointerCancel}
      onPointerTap={onPointerTap}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    />
  );
}
