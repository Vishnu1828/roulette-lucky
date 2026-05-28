import PixiContainer from "../pixi/PixiContainer";
import Multiplier from "./Multiplier";
import { useLayoutStore } from "../../store/useLayoutStore";

// Keep in sync with RouletteTable.tsx / GameArea.tsx
const HEADER_BOTTOM_DESKTOP = 42 + 60 / 2; // 72
const HEADER_BOTTOM_MOBILE = 24 + 32 / 2; // 40
const HEADER_GAP = 32;
const SIDE_PADDING = 32;
const TABLE_GAP = 8;
// Badge size caps per layout
const MAX_BADGE_MOBILE = 75;
const MAX_BADGE_DESKTOP = 150;

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
  const isMobile = isMobilePortrait || isMobileLandscape;

  // --- Available game-area bounds ---
  const headerBottom = isDesktop ? HEADER_BOTTOM_DESKTOP : HEADER_BOTTOM_MOBILE;
  const gameAreaTop = headerBottom + HEADER_GAP;

  const bettingSettingsHeight = Math.max(48, height * 0.06);
  // In bonus state chip bar is hidden, only BettingSettings footer remains
  const footerTop = height - bettingSettingsHeight - TABLE_GAP;

  // --- Badge size: fit 3 across in row 1, capped by max ---
  // In bonus state there is no wheel, so use the full game area
  // Portrait: full width below header (strip above footer)
  // Landscape/Desktop: full width from side padding
  const areaX = SIDE_PADDING;
  const areaY = isMobilePortrait ? gameAreaTop + TABLE_GAP : height * 0.25;
  const areaW = width - SIDE_PADDING * 2;
  const areaH = footerTop - areaY;

  // --- Badge size: fit 3 across in row 1, capped by max ---
  const maxBadge = isMobile ? MAX_BADGE_MOBILE : MAX_BADGE_DESKTOP;
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
  const row1Y = totalH / 2;
  const row1TotalW = badgeSize * 3 + ITEM_GAP * 2;
  const row1StartX = isMobilePortrait
    ? (areaW - row1TotalW) / 2 + badgeSize / 2
    : badgeSize / 2;

  // Row 2: 2 items
  const row2Y = totalH + ITEM_GAP + totalH / 2;
  const row2TotalW = badgeSize * 2 + ITEM_GAP;
  const row2StartX = isMobilePortrait
    ? (areaW - row2TotalW) / 2 + badgeSize / 2
    : badgeSize / 2;

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
