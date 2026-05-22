import { extend } from "@pixi/react";
import { Sprite, Texture } from "pixi.js";

extend({ Sprite });

type PixiSpriteProps = {
  texture?: Texture;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  anchor?: number | { x: number; y: number } | [number, number];
  angle?: number;
  rotation?: number;
  alpha?: number;
  tint?: number;
  interactive?: boolean;
  cursor?: string;
  eventMode?: "none" | "passive" | "auto" | "static" | "dynamic";
  onPointerDown?: (event: any) => void;
  onPointerMove?: (event: any) => void;
  onPointerTap?: (event: any) => void;
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
      anchor={anchor as any}
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
