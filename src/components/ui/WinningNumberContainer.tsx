import { useCallback, useEffect, useRef, useState } from "react";
import { FederatedPointerEvent, FederatedWheelEvent, Graphics, Container } from "pixi.js";
import gsap from "gsap";
import { WINNING_NUMBERS } from "../../constants/winningNumbers";
import PixiNineSliceSprite from "../pixi/pixiNineSliceSprite";
import WinningNumber, { WinningNumberData } from "./WinningNumber";

type WinningNumberContainerProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  winningNumberData?: WinningNumberData[];
  visible?: boolean;
  onHidden?: () => void;
};

const WinningNumberContainer = ({
  x = 0,
  y = 0,
  width = 180,
  height = 64,
  winningNumberData = WINNING_NUMBERS,
  visible = true,
  onHidden,
}: WinningNumberContainerProps) => {
  const containerRef = useRef<Container | null>(null);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    if (!visible) {
      gsap.to(c, {
        x: c.x + 80,
        alpha: 0,
        duration: 0.6,
        ease: "power2.in",
        onComplete: () => {
          onHidden?.();
        },
      });
    } else {
      gsap.killTweensOf(c);
      c.x = x + 64;
      c.alpha = 0;
      gsap.to(c, {
        x,
        alpha: 1,
        duration: 0.55,
        ease: "power2.out",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const [scrollY, setScrollY] = useState(0);
  const [mask, setMask] = useState<Graphics | null>(null);
  const dragData = useRef({ isDragging: false, startY: 0, startScrollY: 0 });
  const stripWidth = Math.min(width, 50);
  const stripHeight = Math.max(height, 200);

  const verticalPadding = 8;
  const horizontalPadding = 4;
  const itemGap = 4;

  const innerWidth = Math.max(0, stripWidth - horizontalPadding * 2);
  const innerHeight = Math.max(0, stripHeight - verticalPadding * 2);

  const itemSize = Math.min(36, innerWidth);
  const multiplierTopOffset = itemSize * (21 / 80) * 0.45;
  const rowStep = itemSize + itemGap + multiplierTopOffset;
  const contentPaddingY = 2;
  const totalStackHeight =
    winningNumberData.length === 0
      ? 0
      : itemSize +
      Math.max(0, winningNumberData.length - 1) * rowStep +
      multiplierTopOffset;
  const contentHeight = totalStackHeight + contentPaddingY * 2;
  const maxScroll = Math.max(0, contentHeight - innerHeight);

  const clampedScrollY = Math.max(0, Math.min(maxScroll, scrollY));
  const startY = contentPaddingY + multiplierTopOffset;
  const itemX = (innerWidth - itemSize) / 2;
  const contentOriginX = -stripWidth / 2 + horizontalPadding;
  const contentOriginY = -stripHeight / 2 + verticalPadding;

  const onWheel = useCallback(
    (e: FederatedWheelEvent) => {
      if (maxScroll <= 0) return;
      const dy = e.deltaY ?? 0;
      setScrollY((prev) => Math.max(0, Math.min(maxScroll, prev + dy)));
    },
    [maxScroll],
  );

  const onPointerDown = useCallback(
    (e: FederatedPointerEvent) => {
      if (maxScroll <= 0) return;
      dragData.current.isDragging = true;
      dragData.current.startY = e.global.y;
      dragData.current.startScrollY = clampedScrollY;
    },
    [clampedScrollY, maxScroll],
  );

  const onPointerMove = useCallback(
    (e: FederatedPointerEvent) => {
      if (!dragData.current.isDragging) return;
      const dy = e.global.y - dragData.current.startY;
      const next = dragData.current.startScrollY - dy;
      setScrollY(Math.max(0, Math.min(maxScroll, next)));
    },
    [maxScroll],
  );

  const onPointerUp = useCallback(() => {
    dragData.current.isDragging = false;
  }, []);

  const drawMask = useCallback(
    (g: Graphics) => {
      g.clear();
      g.rect(contentOriginX, contentOriginY, innerWidth, innerHeight);
      g.fill({ color: 0xffffff, alpha: 1 });
    },
    [contentOriginX, contentOriginY, innerHeight, innerWidth],
  );

  const drawHitArea = useCallback(
    (g: Graphics) => {
      g.clear();
      g.rect(contentOriginX, contentOriginY, innerWidth, innerHeight);
      g.fill({ color: 0x000000, alpha: 0.001 });
    },
    [contentOriginX, contentOriginY, innerHeight, innerWidth],
  );

  return (
    <pixiContainer x={x} y={y} ref={containerRef}>
      <PixiNineSliceSprite
        texture="recent-winner-strip"
        width={stripWidth}
        height={stripHeight}
        anchor={0.5}
        eventMode="none"
        cursor="default"
        leftWidth={0}
        rightWidth={0}
        topHeight={0}
        bottomHeight={0}
      />

      <pixiGraphics draw={drawMask} ref={setMask} />

      <pixiGraphics
        draw={drawHitArea}
        eventMode={maxScroll > 0 ? "static" : "none"}
        cursor={maxScroll > 0 ? "grab" : "default"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerUpOutside={onPointerUp}
        onWheel={onWheel}
      />

      <pixiContainer
        x={contentOriginX}
        y={contentOriginY - clampedScrollY}
        mask={mask}
      >
        {winningNumberData.map((winNumberData, index) => {
          const itemY = winNumberData.multiplier
            ? startY + index * rowStep
            : startY + index * rowStep - 4;

          return (
            <WinningNumber
              winNumberData={winNumberData}
              key={`${winNumberData.number}-${index}`}
              x={itemX}
              y={itemY}
              size={itemSize}
            />
          );
        })}
      </pixiContainer>
    </pixiContainer>
  );
};

export default WinningNumberContainer;
