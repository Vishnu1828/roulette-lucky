import { useCallback, useEffect, useRef, useState } from "react";
import PixiBitmapText from "../pixi/PixiBitmapText";
import PixiContainer from "../pixi/PixiContainer";
import GameAnimation from "./GameAnimation";
import { Ticker } from "pixi.js";

// Valid multiplier values and their asset keyword
const MULTIPLIER_KEYWORDS: Record<number, string> = {
  100: "x100-multiplier-entrance",
  500: "x500-multiplier-entrance",
  1000: "x1000-multiplier-entrance",
  2000: "x2000-multiplier-entrance",
  5000: "x5000-multiplier-entrance",
};

const FADE_DURATION = 0.5; // seconds
// Start fading this many frames before the last frame
const FADE_LEAD_FRAMES = 25;

type MultiplierProps = {
  /** The winning number displayed inside the badge, e.g. 7, 32 */
  number: number;
  /** Multiplier value: 100 | 500 | 1000 | 2000 | 5000 */
  multiplier: keyof typeof MULTIPLIER_KEYWORDS;
  x?: number;
  y?: number;
  /** Badge pixel size (animation square). Default 160 */
  size?: number;
  /** Seconds to wait before starting the entrance animation */
  delay?: number;
};

const Multiplier = ({
  number,
  multiplier,
  x = 0,
  y = 0,
  size = 10,
  delay = 0,
}: MultiplierProps) => {
  // ready becomes true after the delay elapses — gates the animation render
  const [ready, setReady] = useState(delay === 0);
  const [textAlpha, setTextAlpha] = useState(0);
  const fadeRef = useRef<{ elapsed: number } | null>(null);
  const tickerRef = useRef<Ticker | null>(null);
  const fadeStartedRef = useRef(false);

  const startFade = useCallback(() => {
    if (fadeStartedRef.current) return; // only start once
    fadeStartedRef.current = true;
    fadeRef.current = { elapsed: 0 };
    const ticker = Ticker.shared;
    tickerRef.current = ticker;
    const onTick = () => {
      if (!fadeRef.current) return;
      fadeRef.current.elapsed += ticker.deltaMS / 1000;
      const t = Math.min(fadeRef.current.elapsed / FADE_DURATION, 1);
      // Fade from 0 → 1
      setTextAlpha(0 + t * 1);
      if (t >= 1) {
        ticker.remove(onTick);
        fadeRef.current = null;
      }
    };
    ticker.add(onTick);
  }, []);

  // Stable callback — never changes reference so GameAnimation won't replay
  const handleEntranceComplete = useCallback(() => {
    startFade();
  }, [startFade]);

  // Start fading LEAD_FRAMES before the end
  const handleFrameChange = useCallback(
    (currentFrame: number, totalFrames: number) => {
      if (currentFrame >= totalFrames - FADE_LEAD_FRAMES) {
        startFade();
      }
    },
    [startFade],
  );

  // Cleanup ticker on unmount
  useEffect(() => {
    return () => {
      fadeRef.current = null;
    };
  }, []);

  // Delay gate: wait `delay` seconds before rendering the animation
  useEffect(() => {
    if (delay === 0) return;
    let elapsed = 0;
    const ticker = Ticker.shared;
    const onTick = () => {
      elapsed += ticker.deltaMS / 1000;
      if (elapsed >= delay) {
        setReady(true);
        ticker.remove(onTick);
      }
    };
    ticker.add(onTick);
    return () => {
      ticker.remove(onTick);
    };
  }, [delay]);

  const entranceKeyword = MULTIPLIER_KEYWORDS[multiplier];
  const numberFontSize = Math.round(size * 0.32);
  const multiplierFontSize = Math.round(size * 0.15);
  const multiplierLabelY = size / 2 + multiplierFontSize * 0.2;

  return (
    <PixiContainer x={x} y={y} sortableChildren>
      {/* Badge entrance animation — plays once after delay, holds on last frame */}
      {ready && (
        <GameAnimation
          animationKeyword={entranceKeyword}
          x={0}
          y={0}
          width={size}
          height={size}
          loop={false}
          animationSpeed={0.55}
          onFrameChange={handleFrameChange}
          onComplete={handleEntranceComplete}
        />
      )}

      {/* Number fades in at the centre of the badge after entrance finishes */}
      <PixiBitmapText
        text={String(number)}
        x={0}
        y={numberFontSize * 0.2}
        fontSize={numberFontSize}
        tint={0xffffff}
        anchor={0.5}
        alpha={textAlpha}
      />

      {/* Multiplier value fades in below the badge at the same time */}
      <PixiBitmapText
        text={`x${multiplier}`}
        x={0}
        y={multiplierLabelY}
        fontSize={multiplierFontSize}
        tint={0xf1be31}
        anchor={0.5}
        alpha={textAlpha}
      />
    </PixiContainer>
  );
};
export default Multiplier;
