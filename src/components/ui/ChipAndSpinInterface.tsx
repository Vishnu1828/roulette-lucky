import { useLayoutStore } from "../../store/useLayoutStore";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import { Assets } from "pixi.js";
import LabelSprite from "./LabelSprite";
import ChipPanel from "./ChipPanel";

type Props = {
  width: number;
  x: number;
  zIndex?: number;
};

const ChipAndSpinInterface = ({ width, x, zIndex = 1 }: Props) => {
  const { layoutMode, height } = useLayoutStore();
  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isMobileLandscape = layoutMode === "mobile-landscape";
  const desktopBarAspectRatio = 161 / 1108;
  const mobilePortraitBarAspectRatio = 207 / 392;

  const availableWidth = Math.max(0, width);

  const barWidth = isMobilePortrait
    ? availableWidth
    : isMobileLandscape
      ? Math.min(availableWidth * 0.9, 760)
      : Math.min(availableWidth, 900);

  const barHeight = isMobilePortrait
    ? barWidth * mobilePortraitBarAspectRatio
    : barWidth * desktopBarAspectRatio;

  const containerY = height - barHeight;
  const barX = isMobilePortrait
    ? 0
    : Math.max(0, (availableWidth - barWidth) / 2);
  const innerX = barX;
  const innerY = 0;

  if (availableWidth <= 0 || barHeight <= 0) {
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
    <PixiContainer y={containerY} x={x} zIndex={zIndex}>
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
        />

        <LabelSprite
          texture={Assets.get("ui-spin-button-normal")}
          x={(isMobilePortrait ? portraitSpinCenterX : spinX) - spinWidth / 2}
          y={middleRowY - spinHeight / 2}
          width={spinWidth}
          height={spinHeight}
          value={"SPIN"}
          fontSize={isMobilePortrait ? spinHeight * 0.6 : spinHeight * 0.55}
          align="center"
        />
      </PixiContainer>
    </PixiContainer>
  );
};

export default ChipAndSpinInterface;
