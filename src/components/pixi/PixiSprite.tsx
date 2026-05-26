import { extend } from "@pixi/react";
import { FederatedPointerEvent, PointData, Sprite, Texture } from "pixi.js";

extend({ Sprite });

type PixiSpriteProps = {
  texture?: Texture;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  anchor?: number | PointData;
  angle?: number;
  rotation?: number;
  alpha?: number;
  tint?: number;
  interactive?: boolean;
  cursor?: string;
  eventMode?: "none" | "passive" | "auto" | "static" | "dynamic";
  onPointerDown?: (event: FederatedPointerEvent) => void;
  onPointerMove?: (event: FederatedPointerEvent) => void;
  onPointerTap?: (event: FederatedPointerEvent) => void;
  scale?: number;
};

const PixiSprite = ({
  texture,
  x,
  y,
  width,
  height,
  anchor,
  angle,
  rotation,
  alpha,
  tint,
  interactive = false,
  cursor,
  eventMode,
  onPointerDown,
  onPointerMove,
  onPointerTap,
  scale,
}: PixiSpriteProps) => {
  if (!texture) return null;
  return (
    <pixiSprite
      texture={texture}
      x={x}
      y={y}
      width={width}
      height={height}
      anchor={anchor}
      angle={angle}
      rotation={rotation}
      alpha={alpha}
      tint={tint}
      interactive={interactive}
      cursor={cursor}
      eventMode={eventMode}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      scale={scale}
      onPointerTap={onPointerTap}
    />
  );
};

export default PixiSprite;
