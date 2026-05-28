import { useCallback } from "react";
import { Graphics } from "pixi.js";
import { PixiGraphic } from "../pixi/PixiGraphic";
import PixiContainer from "../pixi/PixiContainer";
import { useLayoutStore } from "../../store/useLayoutStore";
import { useGameStateStore } from "../../store/useGameStateStore";

// Keep in sync with Header.tsx and RouletteWheel.tsx
const HEADER_BOTTOM_DESKTOP = 42 + 60 / 2; // 72
const HEADER_BOTTOM_MOBILE = 24 + 32 / 2; // 40
const HEADER_GAP = 32;
const SIDE_PADDING = 32;
const TABLE_GAP = 8; // gap between table and neighbouring panels

// Wheel size caps (keep in sync with RouletteWheel.tsx)
const MAX_WHEEL_MOBILE_PORTRAIT = 310;
const MAX_WHEEL_MOBILE_LANDSCAPE = 310;
const MAX_WHEEL_DESKTOP = 600;

// ChipAndSpinInterface aspect ratios (keep in sync with ChipAndSpinInterface.tsx)
// Only visible during betting state
const BAR_ASPECT_PORTRAIT = 207 / 392;
const BAR_ASPECT_LANDSCAPE = 161 / 1108;
const MAX_BAR_WIDTH_LANDSCAPE = 760;
const MAX_BAR_WIDTH_DESKTOP = 900;

const RouletteTable = () => {
  const { width, height, layoutMode } = useLayoutStore();
  const { gameState } = useGameStateStore();

  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isMobileLandscape = layoutMode === "mobile-landscape";
  const isDesktop = layoutMode === "desktop";
  const isBetting = gameState === "betting";

  // --- Header bottom boundary ---
  const headerBottom = isDesktop ? HEADER_BOTTOM_DESKTOP : HEADER_BOTTOM_MOBILE;
  const gameAreaTop = headerBottom + HEADER_GAP;

  // --- Footer top: chip/spin bar is only visible in betting state ---
  // In non-betting states only BettingSettings (smaller) is shown
  const bettingSettingsHeight = Math.max(48, height * 0.06);
  const barWidth = isMobilePortrait
    ? width
    : Math.min(
        width * 0.55,
        isMobileLandscape ? MAX_BAR_WIDTH_LANDSCAPE : MAX_BAR_WIDTH_DESKTOP,
      );
  const chipBarHeight = isMobilePortrait
    ? barWidth * BAR_ASPECT_PORTRAIT
    : barWidth * BAR_ASPECT_LANDSCAPE;

  const footerTop = isBetting
    ? height - chipBarHeight - TABLE_GAP
    : height - bettingSettingsHeight - TABLE_GAP;

  // Vertical centre of the available game area
  const gameAreaCenterY = (gameAreaTop + footerTop) / 2;

  // --- WinningNumberContainer right boundary (betting state only) ---
  const rightPadding = isDesktop ? 24 : 14;
  const winningPanelWidth = 50;
  const winningPanelLeft = width - rightPadding - winningPanelWidth;
  const tableRightBound = winningPanelLeft - TABLE_GAP;

  // --- Wheel geometry (mirrors RouletteWheel.tsx) ---
  const rawWheelSize = isDesktop
    ? width * 0.35
    : isMobilePortrait
      ? width * 0.8
      : width * 0.33;
  const maxWheel = isDesktop
    ? MAX_WHEEL_DESKTOP
    : isMobilePortrait
      ? MAX_WHEEL_MOBILE_PORTRAIT
      : MAX_WHEEL_MOBILE_LANDSCAPE;
  const wheelSize = Math.min(rawWheelSize, maxWheel);
  const wheelRadius = wheelSize / 2;
  const wheelX = isMobilePortrait ? width / 2 : SIDE_PADDING + wheelRadius;
  const wheelY = isMobilePortrait
    ? gameAreaTop + wheelRadius
    : gameAreaTop + (height - gameAreaTop) * 0.35;
  const wheelBottom = wheelY + wheelRadius;
  const wheelRight = wheelX + wheelRadius; // right edge of wheel (landscape/desktop)

  // --- Compute table dimensions ---
  let tableW: number;
  let tableH: number;
  let tableCX: number;
  let tableCY: number;

  if (isBetting) {
    // Full available area below header, right-bounded by winning panel
    tableW = tableRightBound - SIDE_PADDING;
    tableH = footerTop - gameAreaTop - TABLE_GAP;
    tableCX = SIDE_PADDING + tableW / 2;
    tableCY = gameAreaCenterY;
  } else if (isMobilePortrait) {
    // Mobile portrait: table below the wheel, taller since chip bar is hidden
    const tableTop = wheelBottom + TABLE_GAP;
    tableH = Math.max(0, footerTop - tableTop);
    tableW = width - SIDE_PADDING * 2;
    tableCX = width / 2;
    tableCY = tableTop + tableH / 2;
  } else {
    // Mobile landscape / Desktop: table to the RIGHT of the wheel, same row
    const tableLeft = wheelRight + TABLE_GAP;
    tableW = Math.max(0, width - tableLeft - TABLE_GAP);
    tableH = footerTop - gameAreaTop - TABLE_GAP;
    tableCX = tableLeft + tableW / 2;
    tableCY = gameAreaCenterY;
  }

  const draw = useCallback(
    (g: Graphics) => {
      g.roundRect(-tableW / 2, -tableH / 2, tableW, tableH, 16);
      g.fill({ color: 0x006400 });
      g.stroke({ width: 4, color: 0x000000 });
    },
    [tableW, tableH],
  );

  if (tableH <= 0 || tableW <= 0) return null;

  return (
    <PixiContainer x={tableCX} y={tableCY}>
      <PixiGraphic draw={draw} />
    </PixiContainer>
  );
};
export default RouletteTable;
