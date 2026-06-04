import { Assets } from "pixi.js";
import { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";
import type { Container } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import GameAnimation from "./GameAnimation";
import { RED_NUMBERS } from "../../constants/roulette";
import PixiBitmapText from "../pixi/PixiBitmapText";
import { useWinningNumberStore } from "../../store/useWinningNumberStore";
import PixiNineSliceSprite from "../pixi/pixiNineSliceSprite";

const WinningNumberWheel = ({ size }: { size: number }) => {
  const { winningNumber } = useWinningNumberStore();
  const [showStaticHalo, setShowStaticHalo] = useState(false);
  const contentRef = useRef<Container | null>(null);
  const staticHaloRef = useRef<Container | null>(null);

  const getWinningBackgroundTexture = (num: number) => {
    if (num === 0) return "roulette-wheel-winning-number-green";
    if (RED_NUMBERS.includes(num)) return "roulette-wheel-winning-number-red";
    return "roulette-wheel-winning-number-black";
  };

  // Handle halo animation complete - immediately show static halo
  const handleHaloAnimationComplete = useCallback(() => {
    console.log("[WinningNumberWheel] Intro halo animation complete");
    setShowStaticHalo(true);
  }, []);

  // Reset when winning number changes
  useEffect(() => {
    console.log("[WinningNumberWheel] Winning number changed:", winningNumber);
    setShowStaticHalo(false);
  }, [winningNumber]);

  // Fade in static halo when it appears
  useEffect(() => {
    if (showStaticHalo && staticHaloRef.current) {
      const container = staticHaloRef.current;
      container.alpha = 0;
      gsap.to(container, {
        alpha: 1,
        duration: 0.15,
        ease: "power2.out",
      });
    }
  }, [showStaticHalo]);

  // Fade in the content on mount
  useEffect(() => {
    if (contentRef.current) {
      const container = contentRef.current;
      container.alpha = 0;
      gsap.to(container, {
        alpha: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [winningNumber]);

  // Don't render if no winning number
  if (winningNumber === null || winningNumber === undefined) {
    return null;
  }

  return (
    <PixiContainer>
      {/* Static halo elements - shown after animation completes (behind content) */}
      {showStaticHalo && (
        <pixiContainer ref={staticHaloRef}>
          <GameAnimation
            animationKeyword="fx-multiplier-halo"
            x={0}
            y={0}
            width={size * 1.3}
            height={size * 1.3}
            animationSpeed={0.4}
            loop={true}
          />
        </pixiContainer>
      )}

      {/* Winning number content - background and number */}
      <pixiContainer ref={contentRef}>
        <PixiNineSliceSprite
          texture={getWinningBackgroundTexture(winningNumber)}
          width={size}
          height={size}
          anchor={0.5}
          leftWidth={0}
          rightWidth={0}
          topHeight={0}
          bottomHeight={0}
        />
        <PixiBitmapText
          text={String(winningNumber)}
          x={0}
          y={size * 0.05}
          fontSize={size * 0.4}
          tint={0xf1be31}
          anchor={0.5}
        />
      </pixiContainer>

      {/* Halo animation on the border - plays once OVER the content, then hidden */}
      {!showStaticHalo && (
        <GameAnimation
          animationKeyword="winning-number-halo"
          x={0}
          y={0} 
          width={size * 1.15}
          height={size * 1.15}
          animationSpeed={0.5}
          loop={false}
          onComplete={handleHaloAnimationComplete}
          restartKey={winningNumber}
        />
      )}

      {/* Static halo border - shows after animation completes, rendered on top */}
      {showStaticHalo && (
        <PixiSprite
          texture={Assets.get("roulette-wheel-winning-number-halo")}
          width={size * 1.08}
          height={size * 1.08}
          anchor={0.5}
        />
      )}
    </PixiContainer>
  );
};
export default WinningNumberWheel;
