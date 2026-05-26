import { extend } from "@pixi/react";
import { Container, FederatedPointerEvent } from "pixi.js";
import { useRef, useEffect } from "react";
import type { ReactNode } from "react";

extend({ Container });

type PixiContainerProps = {
  children?: ReactNode;
  x?: number;
  y?: number;
  offsetX?: number;
  offsetY?: number;
  width?: number;
  height?: number;
  alpha?: number;
  interactive?: boolean;
  eventMode?: "none" | "passive" | "auto" | "static" | "dynamic";
  cursor?: string;
  onPointerDown?: (e: FederatedPointerEvent) => void;
  onPointerMove?: (e: FederatedPointerEvent) => void;
  onPointerUp?: (e: FederatedPointerEvent) => void;
  onPointerUpOutside?: (e: FederatedPointerEvent) => void;
  onPointerTap?: (e: FederatedPointerEvent) => void;
  sortableChildren?: boolean;
  zIndex?: number;
};

const PixiContainer = ({
  children,
  x,
  y,
  offsetX,
  offsetY,
  width,
  height,
  alpha,
  interactive,
  eventMode,
  cursor,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerUpOutside,
  onPointerTap,
  sortableChildren = false,
  zIndex,
}: PixiContainerProps) => {
  const ref = useRef<
    (Container & { offsetX?: number; offsetY?: number }) | null
  >(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.offsetX = offsetX;
      ref.current.offsetY = offsetY;
    }
  }, [offsetX, offsetY]);

  return (
    <pixiContainer
      ref={ref}
      x={x}
      y={y}
      width={width}
      height={height}
      alpha={alpha}
      interactive={interactive}
      eventMode={eventMode}
      cursor={cursor}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerUpOutside={onPointerUpOutside}
      onPointerTap={onPointerTap}
      sortableChildren={sortableChildren}
      zIndex={zIndex}
    >
      {children}
    </pixiContainer>
  );
};

export default PixiContainer;
