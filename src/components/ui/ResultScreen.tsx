import { Container, Ticker } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import PixiBitmapText from "../pixi/PixiBitmapText";
import { useLayoutStore } from "../../store/useLayoutStore";
import GameAnimation from "./GameAnimation";

const HEADER_BOTTOM_DESKTOP = 42 + 60 / 2;
const HEADER_BOTTOM_MOBILE = 24 + 32 / 2;
const HEADER_GAP = 32;
const TABLE_GAP = 8;

const TARGET_PAYOUT = 100000;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const ResultScreen = () => {
  const { width, height, layoutMode } = useLayoutStore();
  const containerRef = useRef<Container | null>(null);
  const [displayPayout, setDisplayPayout] = useState(0);
  const [showWinFx, setShowWinFx] = useState(false);

  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isDesktop = layoutMode === "desktop";

  const headerBottom = isDesktop ? HEADER_BOTTOM_DESKTOP : HEADER_BOTTOM_MOBILE;
  const gameAreaTop = headerBottom + HEADER_GAP;
  const footerTop = height - Math.max(48, height * 0.06) - TABLE_GAP;
  const availableHeight = Math.max(0, footerTop - gameAreaTop);

  const wheelSize = isDesktop
    ? clamp(width * 0.35, 360, 600)
    : isMobilePortrait
      ? clamp(width * 0.78, 250, 320)
      : clamp(width * 0.32, 250, 330);

  let wheelY = gameAreaTop + availableHeight * 0.28;
  let resultX = width / 2;
  let messageY = wheelY + wheelSize * 0.66;
  let payoutY = messageY + wheelSize * 0.22;

  if (!isMobilePortrait) {
    const rightMargin = isDesktop ? 24 : 14;
    const tableW = Math.round(
      clamp(
        width * (isDesktop ? 0.37 : 0.39),
        isDesktop ? 400 : 250,
        isDesktop ? 560 : 320,
      ),
    );
    const tableLeft = width - rightMargin - tableW;

    wheelY = gameAreaTop + availableHeight * 0.45;
    resultX = tableLeft + tableW / 2;
    messageY = wheelY - wheelSize * 0.12;
    payoutY = wheelY + wheelSize * 0.12;
  }

  const titleFontSize = Math.round(clamp(wheelSize * 0.16, 38, 82));
  const payoutFontSize = Math.round(clamp(wheelSize * 0.14, 34, 72));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.alpha = 0;
    container.scale.set(0.96);
    gsap.to(container, {
      alpha: 1,
      duration: 0.45,
      ease: "power2.out",
    });
    gsap.to(container.scale, {
      x: 1,
      y: 1,
      duration: 0.75,
      ease: "back.out(1.2)",
    });
  }, []);

  useEffect(() => {
    let elapsed = 0;
    const countDuration = 4.2;
    const ticker = Ticker.shared;

    const onTick = () => {
      elapsed += ticker.deltaMS / 1000;
      const progress = Math.min(elapsed / countDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPayout(Math.round(TARGET_PAYOUT * eased));

      if (progress >= 0.78) {
        setShowWinFx(true);
      }

      if (progress >= 1) {
        ticker.remove(onTick);
      }
    };

    ticker.add(onTick);
    return () => {
      ticker.remove(onTick);
    };
  }, []);

  return (
    <pixiContainer ref={containerRef}>
      {showWinFx && (
        <GameAnimation
          animationKeyword={
            isMobilePortrait ? "fx-win-mobile-portrait" : "fx-win-desktop"
          }
          x={width / 2}
          y={height / 2}
          width={width}
          height={height}
          loop={false}
          animationSpeed={0.55}
        />
      )}
      {/* <PixiContainer x={wheelX} y={wheelY}>
        <PixiSprite
          texture={Assets.get("roulette-wheel-base")}
          width={wheelSize}
          height={wheelSize}
          anchor={0.5}
        />
        <PixiSprite
          texture={Assets.get("roulette-wheel-number-ring")}
          width={numberRingSize}
          height={numberRingSize}
          anchor={0.5}
        />
        <GameAnimation
          animationKeyword="winning-number-halo"
          x={0}
          y={0}
          width={numberRingSize}
          height={numberRingSize}
          animationSpeed={0.45}
        />
        <PixiSprite
          texture={Assets.get("roulette-wheel-center")}
          width={centerSize}
          height={centerSize}
          anchor={0.5}
        />
        <PixiBitmapText
          text={String(WINNING_NUMBER)}
          x={0}
          y={-numberFontSize * 0.05}
          fontSize={numberFontSize}
          tint={0xf1be31}
          anchor={0.5}
        />
        <PixiBitmapText
          text={`x${WINNING_MULTIPLIER}`}
          x={0}
          y={numberFontSize * 0.62}
          fontSize={multiplierFontSize}
          tint={0xf1be31}
          anchor={0.5}
        />
      </PixiContainer>  */}
      <PixiBitmapText
        text="YOU WON"
        x={resultX}
        y={messageY}
        fontSize={titleFontSize}
        tint={0xf1be31}
        anchor={0.5}
      />
      <PixiBitmapText
        text={`$${displayPayout.toLocaleString("en-US")}`}
        x={resultX}
        y={payoutY}
        fontSize={payoutFontSize}
        tint={0xf1be31}
        anchor={0.5}
      />
    </pixiContainer>
  );
};

export default ResultScreen;
