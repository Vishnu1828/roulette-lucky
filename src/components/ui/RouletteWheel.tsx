import { Assets } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import { useLayoutStore } from "../../store/useLayoutStore";

const HEADER_BOTTOM_DESKTOP = 42 + 60 / 2;
const HEADER_BOTTOM_MOBILE = 24 + 32 / 2;
const HEADER_GAP = 32;
const SIDE_PADDING = 32;
const TABLE_GAP = 8;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const MAX_WHEEL_MOBILE_PORTRAIT = 310;
const MAX_WHEEL_MOBILE_LANDSCAPE = 310;
const MAX_WHEEL_DESKTOP = 600;

const RouletteWheel = () => {
  const { width, height, layoutMode } = useLayoutStore();

  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isDesktop = layoutMode === "desktop";

  // --- Wheel size (capped per layout) ---
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
  const numberRingSize = wheelSize * 0.75;
  const centerSize = numberRingSize * 0.55;
  const wheelRadius = wheelSize / 2;

  // --- Header bottom boundary ---
  const headerBottom = isDesktop ? HEADER_BOTTOM_DESKTOP : HEADER_BOTTOM_MOBILE;

  const gameAreaTop = headerBottom + HEADER_GAP;

  const bettingSettingsHeight = Math.max(48, height * 0.06);
  const footerTop = height - bettingSettingsHeight - TABLE_GAP;

  // --- Wheel position in same panel used by BonusMultiplierContainer ---
  let wheelX = width / 2;
  let wheelY = gameAreaTop + wheelRadius;

  if (isMobilePortrait) {
    const tableW = Math.round(clamp(width * 0.46, 200, 280));
    const tableH = Math.round(clamp(tableW * 1.72, 320, 500));
    const preferredCY = gameAreaTop + (footerTop - gameAreaTop) * 0.72;
    const footerSafeCY = footerTop - tableH / 2 - 10;
    const tableCY = Math.min(preferredCY, footerSafeCY);
    const tableTop = tableCY - tableH / 2;
    const topAreaBottom = tableTop - 16;
    const topAreaCenterY = gameAreaTop + (topAreaBottom - gameAreaTop) / 2;
    wheelX = width / 2;
    wheelY = topAreaCenterY;
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
    const leftAreaX = SIDE_PADDING;
    const leftAreaW = Math.max(0, tableLeft - 20 - leftAreaX);
    wheelX = leftAreaX + leftAreaW / 2;
    wheelY = gameAreaTop + (footerTop - gameAreaTop) * 0.5;
  }

  return (
    <PixiContainer x={wheelX} y={wheelY}>
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
      <PixiSprite
        texture={Assets.get("roulette-wheel-center")}
        width={centerSize}
        height={centerSize}
        anchor={0.5}
      />
    </PixiContainer>
  );
};
export default RouletteWheel;
