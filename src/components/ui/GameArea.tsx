import { useLayoutStore } from "../../store/useLayoutStore";
import PixiContainer from "../pixi/PixiContainer";
import RouletteTable from "./RouletteTable";
import RouletteWheel from "./RouletteWheel";
import WinningNumberContainer from "./WinningNumberContainer";
import { useGameStateStore } from "../../store/useGameStateStore";
import BonusMultiplierContainer from "./BonusMultiplierContainer";

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
  const { gameState } = useGameStateStore();

  const isDesktop = layoutMode === "desktop";
  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isMobileLandscape = layoutMode === "mobile-landscape";

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
  const gameAreaCenterY = (gameAreaTop + footerTop) / 2;

  // --- WinningNumberContainer ---
  const rightPadding = isDesktop ? 24 : 14;
  const winningPanelWidth = 50;
  const winningPanelHeight = isDesktop
    ? 300
    : isMobilePortrait
      ? 250
      : Math.max(0, bettingTableHeight);

  const winningPanelX = width - rightPadding - winningPanelWidth / 2;
  // Mobile landscape: share the same vertical centre as RouletteTable so they sit in the same row
  const winningPanelY = isMobilePortrait ? height * 0.4 : gameAreaCenterY;

  return (
    <PixiContainer x={0} y={0}>
      {gameState === "spinning" && <RouletteWheel />}
      {gameState === "bonus" && <BonusMultiplierContainer />}
      {gameState === "betting" && (
        <WinningNumberContainer
          x={winningPanelX}
          y={winningPanelY}
          width={winningPanelWidth}
          height={winningPanelHeight}
        />
      )}
      <RouletteTable />
    </PixiContainer>
  );
};

export default GameArea;
