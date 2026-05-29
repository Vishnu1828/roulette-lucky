import { useLayoutStore } from "../../store/useLayoutStore";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import { Assets } from "pixi.js";
import LabelSprite from "./LabelSprite";
import ChipPanel from "./ChipPanel";
import { BITMAP_FONT_FAMILY } from "../../utils/assets";
import { useGameStateStore } from "../../store/useGameStateStore";
import { useBetStore } from "../../store/useBetStore";
import type { PlacedBet } from "../../types/rouletteBetting";

type Props = {
  // Total screen width — used for centering. Bar size is driven by footerHeight,
  // NOT by this value, so it never shrinks when balance/totalBet grow.
  width: number;
  // Left boundary where safe content starts (after balance + totalBet area)
  leftBoundary: number;
  // Right boundary where safe content ends (before settings icons area)
  rightBoundary: number;
  zIndex?: number;
};

const ChipAndSpinInterface = ({
  width,
  leftBoundary,
  rightBoundary,
  zIndex = 1,
}: Props) => {
  const { layoutMode, height } = useLayoutStore();
  const { setGameState } = useGameStateStore();
  const { setPlacedBets, undoLastBet, clearBets, doubleBets } = useBetStore();
  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isMobileLandscape = layoutMode === "mobile-landscape";
  const desktopBarAspectRatio = 161 / 1108;
  const mobilePortraitBarAspectRatio = 207 / 392;

  // Bar width is driven by the full screen width (fixed fraction), so it
  // never changes when balance/totalBet content grows or shrinks.
  // Bar height derives from barWidth via the image aspect ratio.
  const maxBarWidth = isMobileLandscape ? 760 : 900;
  const barWidth = isMobilePortrait
    ? width
    : Math.min(width * 0.55, maxBarWidth);

  const barHeight = isMobilePortrait
    ? barWidth * mobilePortraitBarAspectRatio
    : barWidth * desktopBarAspectRatio;

  // Center the bar in the safe zone between leftBoundary and rightBoundary.
  // If the bar is wider than the safe zone it simply overflows — that is
  // intentional; the bar visually covers the footer and extends over content.
  const safeZoneStart = isMobilePortrait ? 0 : leftBoundary;
  const safeZoneEnd = isMobilePortrait ? width : rightBoundary;
  const safeZoneWidth = Math.max(0, safeZoneEnd - safeZoneStart);
  const barX = safeZoneStart + (safeZoneWidth - barWidth) / 2;

  const containerY = height - barHeight;
  const innerX = barX;
  const innerY = 0;

  if (barHeight <= 0 || barWidth <= 0) {
    return null;
  }

  const paddingX = isMobilePortrait ? barWidth * 0.04 : barWidth * 0.03;
  const actionGap = isMobilePortrait ? barWidth * 0.028 : barWidth * 0.014;
  const actionSize = isMobilePortrait ? barHeight * 0.24 : barHeight * 0.45;
  const middleRowY = isMobilePortrait ? barHeight * 0.57 : barHeight * 0.5;

  const spinWidth = isMobilePortrait ? barWidth * 0.3 : barWidth * 0.18;
  const spinHeight = isMobilePortrait ? barHeight * 0.3 : barHeight * 0.75;
  const spinX = barWidth - paddingX - spinWidth / 2;

  const leftOneX = paddingX + actionSize / 2;
  const leftTwoX = leftOneX + actionSize + actionGap;

  const rightTwoX = spinX - spinWidth / 2 - actionGap - actionSize / 2;
  const rightOneX = rightTwoX - actionSize - actionGap;
  const portraitSpinCenterX =
    leftTwoX + actionSize / 2 + actionGap + spinWidth / 2;
  const portraitTwoX =
    portraitSpinCenterX + spinWidth / 2 + actionGap + actionSize / 2;
  const portraitRepeatX = portraitTwoX + actionSize + actionGap;

  const holderPadding = isMobilePortrait ? barWidth * 0.05 : barWidth * 0.032;
  const holderX = leftTwoX + actionSize / 2 + holderPadding;
  const holderWidth = Math.max(
    barWidth * (isMobilePortrait ? 0.52 : 0.36),
    rightOneX - actionSize / 2 - holderPadding - holderX,
  );

  const chipPanelWidth = isMobilePortrait
    ? barWidth * 0.9
    : Math.max(holderWidth, barWidth * 0.46);
  const chipPanelHeight = isMobilePortrait ? barHeight : actionSize * 1.2;
  const chipPanelX = isMobilePortrait
    ? width * 0.05
    : Math.max(0, leftTwoX + actionSize * 0.1 + holderPadding);
  const chipPanelY = isMobilePortrait
    ? barHeight * 0.01
    : middleRowY - chipPanelHeight * 0.75;
  return (
    <PixiContainer y={containerY} x={0} zIndex={zIndex}>
      <PixiSprite
        texture={Assets.get(
          isMobilePortrait ? "ui-bar-mobile-portrait" : "ui-bar-desktop",
        )}
        x={barX}
        height={barHeight}
        width={barWidth}
      />
      <PixiContainer x={innerX} y={innerY}>
        <PixiSprite
          texture={Assets.get("ui-clear-bet-button-idle")}
          x={leftOneX}
          y={middleRowY}
          width={actionSize}
          height={actionSize}
          anchor={0.5}
          interactive
          cursor="pointer"
          eventMode="static"
          onPointerTap={() => clearBets()}
        />
        <PixiSprite
          texture={Assets.get("ui-undo-button-idle")}
          x={leftTwoX}
          y={middleRowY}
          width={actionSize}
          height={actionSize}
          anchor={0.5}
          interactive
          cursor="pointer"
          eventMode="static"
          onPointerTap={() => undoLastBet()}
        />
        <ChipPanel
          x={chipPanelX}
          y={chipPanelY}
          chipContainerWidth={chipPanelWidth}
          chipContainerHeight={chipPanelHeight}
        />

        <PixiSprite
          texture={Assets.get("ui-2x-button-idle")}
          x={isMobilePortrait ? portraitTwoX : rightOneX}
          y={middleRowY}
          width={actionSize}
          height={actionSize}
          anchor={0.5}
          interactive
          cursor="pointer"
          eventMode="static"
          onPointerTap={() => doubleBets()}
        />
        <PixiSprite
          texture={Assets.get("ui-repeat-button-idle")}
          x={isMobilePortrait ? portraitRepeatX : rightTwoX}
          y={middleRowY}
          width={actionSize}
          height={actionSize}
          anchor={0.5}
          interactive
          cursor="pointer"
          eventMode="static"
          onPointerDown={() => {
            const bets: PlacedBet[] = [
              {
                spotKey: "trio-0-1-2",
                type: "trio",
                coveredNumbers: [0, 1, 2],
                amount: 5,
                chips: [5],
              },
              {
                spotKey: "line-2", // Boundary between row 1 (4,5,6) and row 2 (7,8,9)
                type: "line",
                coveredNumbers: [4, 5, 6, 7, 8, 9],
                amount: 10,
                chips: [10],
              },
              {
                spotKey: "corner-23-24-26-27",
                type: "corner",
                coveredNumbers: [23, 24, 26, 27],
                amount: 5,
                chips: [5],
              },
              {
                spotKey: "split-22-25",
                type: "split",
                coveredNumbers: [22, 25],
                amount: 5,
                chips: [5],
              },
              {
                spotKey: "color-red",
                type: "color",
                coveredNumbers: [
                  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
                ],
                amount: 5,
                chips: [5],
              },
              {
                spotKey: "straight-35",
                type: "straight",
                coveredNumbers: [35],
                amount: 5,
                chips: [5],
              },
            ];

            setPlacedBets(bets);
          }}
        />

        <LabelSprite
          texture={Assets.get("ui-spin-button-normal")}
          x={(isMobilePortrait ? portraitSpinCenterX : spinX) - spinWidth / 2}
          y={middleRowY - spinHeight / 2}
          width={spinWidth}
          height={spinHeight}
          value={"SPIN"}
          fontSize={isMobilePortrait ? spinHeight * 0.7 : spinHeight * 0.65}
          align="center"
          labelY={spinHeight * 0.65}
          tint={0x007011}
          fontFamily={
            BITMAP_FONT_FAMILY.spinButton[
            isMobilePortrait ? "mobile" : "desktop"
            ]
          }
          onPointerTap={() => {
            setGameState("bonus");
          }}
        />
      </PixiContainer>
    </PixiContainer>
  );
};

export default ChipAndSpinInterface;
