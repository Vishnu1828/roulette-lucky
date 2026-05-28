import PixiContainer from "../pixi/PixiContainer";
import Multiplier from "./Multiplier";
import { useLayoutStore } from "../../store/useLayoutStore";

// Keep in sync with RouletteTable.tsx / GameArea.tsx
const HEADER_BOTTOM_DESKTOP = 42 + 60 / 2; // 72
const HEADER_BOTTOM_MOBILE = 24 + 32 / 2; // 40
const HEADER_GAP = 32;
const SIDE_PADDING = 32;
const TABLE_GAP = 8;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
// Badge size caps per layout
const MAX_BADGE_MOBILE = 92;
const MAX_BADGE_MOBILE_PORTRAIT = 112;
const MAX_BADGE_DESKTOP = 180;

// Sample data — replace with real game data as needed
const MULTIPLIERS: {
  number: number;
  multiplier: 100 | 500 | 1000 | 2000 | 5000;
}[] = [
  { number: 7, multiplier: 2000 },
  { number: 14, multiplier: 5000 },
  { number: 3, multiplier: 500 },
  { number: 22, multiplier: 100 },
  { number: 36, multiplier: 1000 },
];

const ITEM_GAP = 12; // px gap between badges
// Stagger delay between each badge in seconds
const STAGGER_DELAY = 0.5;

const BonusMultiplierContainer = () => {
  const { width, height, layoutMode } = useLayoutStore();

  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isMobileLandscape = layoutMode === "mobile-landscape";
  const isDesktop = layoutMode === "desktop";
  void isMobileLandscape;

  // --- Available game-area bounds ---
  const headerBottom = isDesktop ? HEADER_BOTTOM_DESKTOP : HEADER_BOTTOM_MOBILE;
  const gameAreaTop = headerBottom + HEADER_GAP;

  const bettingSettingsHeight = Math.max(48, height * 0.06);
  // In bonus state chip bar is hidden, only BettingSettings footer remains
  const footerTop = height - bettingSettingsHeight - TABLE_GAP;

  // Left panel area that complements RouletteTable's right panel.
  const areaX = SIDE_PADDING;
  let areaY = gameAreaTop + TABLE_GAP;
  let areaW = width - SIDE_PADDING * 2;
  let areaH = footerTop - areaY;

  if (isMobilePortrait) {
    // Place the portrait bonus block slightly lower than default top.
    areaY = gameAreaTop + 28;
    const tableW = Math.round(clamp(width * 0.46, 200, 280));
    const tableH = Math.round(clamp(tableW * 1.72, 320, 500));
    const preferredCY = gameAreaTop + (footerTop - gameAreaTop) * 0.72;
    const footerSafeCY = footerTop - tableH / 2 - 10;
    const tableCY = Math.min(preferredCY, footerSafeCY);
    const tableTop = tableCY - tableH / 2;
    areaH = Math.max(0, tableTop - 16 - areaY);
  } else {
    const rightMargin = isDesktop ? 24 : 14;
    const tableW = Math.round(
      clamp(
        width * (isDesktop ? 0.37 : 0.39),
        isDesktop ? 400 : 250,
        isDesktop ? 560 : 320,
      ),
    );
    const tableLeft = width - rightMargin - tableW;
    areaW = Math.max(0, tableLeft - 20 - areaX);
    areaY = gameAreaTop + 12;
    areaH = footerTop - areaY;
  }

  // --- Badge size: fit 3 across in row 1, capped by max ---
  const maxBadge = isDesktop
    ? MAX_BADGE_DESKTOP
    : isMobilePortrait
      ? MAX_BADGE_MOBILE_PORTRAIT
      : MAX_BADGE_MOBILE;
  // Each badge also renders a multiplier label below (≈ size * 0.1 * 1.2 * 2 ≈ size * 0.35 extra)
  const badgeTotalH = (size: number) => size + Math.round(size * 0.1) * 1.4;

  const badgeFromW = Math.floor((areaW - ITEM_GAP * 2) / 3);
  // Also ensure 2 rows fit vertically
  const badgeFromH = Math.floor((areaH - ITEM_GAP) / 2 / 1.35); // /1.35 accounts for label
  const badgeSize = Math.min(badgeFromW, badgeFromH, maxBadge);

  const totalH = badgeTotalH(badgeSize);

  // --- Grid positions (centre-based, relative to container origin) ---
  // Portrait: rows centred across areaW
  // Landscape/Desktop: rows left-aligned
  const usedHeight = totalH * 2 + ITEM_GAP;
  const verticalOffset = isDesktop ? Math.max(0, (areaH - usedHeight) / 2) : 0;

  const row1Y = verticalOffset + totalH / 2;
  const row1TotalW = badgeSize * 3 + ITEM_GAP * 2;
  const row1StartX = (areaW - row1TotalW) / 2 + badgeSize / 2;

  // Row 2: 2 items
  const row2Y = verticalOffset + totalH + ITEM_GAP + totalH / 2;
  const row2TotalW = badgeSize * 2 + ITEM_GAP;
  const row2StartX = (areaW - row2TotalW) / 2 + badgeSize / 2;

  const positions = [
    { x: row1StartX, y: row1Y }, // 1
    { x: row1StartX + badgeSize + ITEM_GAP, y: row1Y }, // 2
    { x: row1StartX + (badgeSize + ITEM_GAP) * 2, y: row1Y }, // 3
    { x: row2StartX, y: row2Y }, // 4
    { x: row2StartX + badgeSize + ITEM_GAP, y: row2Y }, // 5
  ];

  if (badgeSize <= 0) return null;

  return (
    <PixiContainer x={areaX} y={areaY}>
      {MULTIPLIERS.map((m, i) => (
        <Multiplier
          key={i}
          number={m.number}
          multiplier={m.multiplier}
          x={positions[i].x}
          y={positions[i].y}
          size={badgeSize}
          delay={i * STAGGER_DELAY}
        />
      ))}
    </PixiContainer>
  );
};
export default BonusMultiplierContainer;
