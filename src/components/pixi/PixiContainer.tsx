import { extend } from "@pixi/react";
import { Container } from "pixi.js";
import { useRef, useEffect } from "react";

extend({ Container });

type PixiContainerProps = {
  children?: any;
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
  onPointerDown?: (e: any) => void;
  onPointerMove?: (e: any) => void;
  onPointerUp?: (e: any) => void;
  onPointerUpOutside?: (e: any) => void;
  onPointerTap?: (e: any) => void;
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
  const ref = useRef<any>(null);

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
