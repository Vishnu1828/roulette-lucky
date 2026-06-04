import { useEffect, useState } from "react";
import { useLayoutStore } from "../../store/useLayoutStore";
import PixiContainer from "../pixi/PixiContainer";
import RouletteTable from "./RouletteTable";
import RouletteWheel from "./RouletteWheel";
import WinningNumberContainer from "./WinningNumberContainer";
import { useGameStateStore } from "../../store/useGameStateStore";
import BonusMultiplierContainer from "./BonusMultiplierContainer";
import ResultScreen from "./ResultScreen";

// Keep in sync with RouletteTable.tsx
const HEADER_BOTTOM_MOBILE = 24 + 32 / 2; // 40
const HEADER_BOTTOM_DESKTOP = 42 + 60 / 2; // 72
const HEADER_GAP = 32;
const TABLE_GAP = 8;
const BAR_ASPECT_LANDSCAPE = 161 / 1108;
const BAR_ASPECT_PORTRAIT = 207 / 392;
const MAX_BAR_WIDTH_LANDSCAPE = 760;
const MAX_BAR_WIDTH_DESKTOP = 900;

const GameArea = () => {
  const { width, height, layoutMode } = useLayoutStore();
  const { gameState, setGameState } = useGameStateStore();

  const isDesktop = layoutMode === "desktop";
  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isMobileLandscape = layoutMode === "mobile-landscape";

  // transitionPhase: 0=betting/start, 1=centering, 2=final-layout, 3=show-multipliers
  const [transitionPhase, setTransitionPhase] = useState(0);

  // Track mounting of WinningNumberContainer separately so we can delay
  // unmounting until the exit animation finishes via onHidden callback
  const isBetting = gameState === "betting";
  const [showWinningPanel, setShowWinningPanel] = useState(isBetting);

  useEffect(() => {
    if (isBetting) {
      setShowWinningPanel(true);
    }
    // When leaving betting: keep mounted (visible=false triggers animation),
    // WinningNumberContainer calls onHidden to unmount via setShowWinningPanel(false)
  }, [isBetting]);

  useEffect(() => {
    if (gameState === "multiplier-launch") {
      setTransitionPhase(1);

      const timer2 = setTimeout(() => {
        setTransitionPhase(2);
      }, 3000);

      const timer3 = setTimeout(() => {
        setTransitionPhase(3);
      }, 3900);

      const timer4 = setTimeout(() => {
        setGameState("bonus");
      }, 6500);

      return () => {
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }

    if (gameState === "bonus") {
      setTransitionPhase(3);

      const timer = setTimeout(() => {
        setGameState("spinning");
      }, 2800);

      return () => {
        clearTimeout(timer);
      };
    }

    // if (gameState === "spinning") {
    //   setTransitionPhase(3);

    //   const timer = setTimeout(() => {
    //     setGameState("result");
    //   }, 4700);

    //   return () => {
    //     clearTimeout(timer);
    //   };
    // }

    // if (gameState === "result") {
    //   setTransitionPhase(3);

    //   const timer = setTimeout(() => {
    //     setGameState("betting");
    //   }, 6500);

    //   return () => {
    //     clearTimeout(timer);
    //   };
    // }

    if (gameState === "betting") {
      setTransitionPhase(0);
    }
  }, [gameState, setGameState]);

  // --- Shared game-area vertical bounds (mirrors RouletteTable.tsx) ---
  const headerBottom = isDesktop ? HEADER_BOTTOM_DESKTOP : HEADER_BOTTOM_MOBILE;
  const gameAreaTop = headerBottom + HEADER_GAP;

  const barWidth = isMobilePortrait
    ? width
    : Math.min(
        width * 0.55,
        isMobileLandscape ? MAX_BAR_WIDTH_LANDSCAPE : MAX_BAR_WIDTH_DESKTOP,
      );
  const barHeight = isMobilePortrait
    ? barWidth * BAR_ASPECT_PORTRAIT
    : barWidth * BAR_ASPECT_LANDSCAPE;
  const footerTop = height - barHeight - TABLE_GAP;
  const bettingTableHeight = footerTop - gameAreaTop - TABLE_GAP;

  // Vertical centre of the available game area — used for all non-portrait layouts
  const gameAreaCenterY = isMobileLandscape
    ? (gameAreaTop + footerTop) * 0.46
    : (gameAreaTop + footerTop) * 0.45;

  // --- WinningNumberContainer ---
  const rightPadding = isDesktop ? 50 : isMobilePortrait ? 14 : 50;
  const winningPanelWidth = 50;
  const winningPanelHeight = isDesktop
    ? 350
    : isMobilePortrait
      ? 250
      : Math.max(0, bettingTableHeight);

  const winningPanelX = width - rightPadding - winningPanelWidth / 2;
  // Mobile landscape: share the same vertical centre as RouletteTable so they sit in the same row
  const winningPanelY = isMobilePortrait ? height * 0.4 : gameAreaCenterY;

  const onSpinComplete = () => {
    setGameState("result");
    setTransitionPhase(3);
  };

  return (
    <PixiContainer x={0} y={0}>
      {(gameState === "spinning" || gameState === "result") && (
        <RouletteWheel onSpinComplete={onSpinComplete} />
      )}
      {gameState === "result" && <ResultScreen />}
      {(gameState === "multiplier-launch" || gameState === "bonus") && (
        <BonusMultiplierContainer
          ready={transitionPhase >= 3 || gameState === "bonus"}
        />
      )}
      {showWinningPanel && (
        <WinningNumberContainer
          x={winningPanelX}
          y={winningPanelY}
          width={winningPanelWidth}
          height={winningPanelHeight}
          visible={isBetting}
          onHidden={() => setShowWinningPanel(false)}
        />
      )}
      {gameState !== "result" && (
        <RouletteTable transitionPhase={transitionPhase} />
      )}
    </PixiContainer>
  );
};

export default GameArea;
