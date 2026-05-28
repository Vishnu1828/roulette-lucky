import { Assets } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import { useLayoutStore } from "../../store/useLayoutStore";

const HEADER_BOTTOM_DESKTOP = 42 + 60 / 2;
const HEADER_BOTTOM_MOBILE = 24 + 32 / 2;
const HEADER_GAP = 32;
const SIDE_PADDING = 32;

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

  // --- Wheel position ---
  // Mobile portrait: centered horizontally, at top of game area
  // Desktop / landscape: left side, vertically centered in available area
  const wheelX = isMobilePortrait ? width / 2 : SIDE_PADDING + wheelRadius;

  const wheelY = isMobilePortrait
    ? gameAreaTop + wheelRadius
    : gameAreaTop + (height - gameAreaTop) * 0.35;

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
