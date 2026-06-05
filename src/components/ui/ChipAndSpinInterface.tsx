import { useEffect, useRef } from "react";
import { useLayoutStore } from "../../store/useLayoutStore";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import { Assets, Container } from "pixi.js";
import gsap from "gsap";
import LabelSprite from "./LabelSprite";
import ChipPanel from "./ChipPanel";
import { BITMAP_FONT_FAMILY } from "../../utils/assets";
import { useEmitGameEvent } from "../../store/useGameFlowStore";
import { useBetStore } from "../../store/useBetStore";
import { sfx } from "../../utils/audio";
import { bets } from "../../constants/rouletteBetting";
import { useButtonTexture } from "../../utils/getButtonTexture";

type Props = {
  // Total screen width — used for centering. Bar size is driven by footerHeight,
  // NOT by this value, so it never shrinks when balance/totalBet grow.
  width: number;
  // Left boundary where safe content starts (after balance + totalBet area)
  leftBoundary: number;
  // Right boundary where safe content ends (before settings icons area)
  rightBoundary: number;
  zIndex?: number;
  visible?: boolean;
  onHidden?: () => void;
};

const ChipAndSpinInterface = ({
  width,
  leftBoundary,
  rightBoundary,
  zIndex = 1,
  visible = true,
  onHidden,
}: Props) => {
  const containerRef = useRef<Container | null>(null);
  const { layoutMode, height } = useLayoutStore();
  const { placedBets } = useBetStore();
  const emitEvent = useEmitGameEvent();
  const { setPlacedBets, undoLastBet, clearBets, doubleBets } = useBetStore();
  const {
    texture: spinTexture,
    handlers: spinHandlers,
    interactiveProps: spinInteractiveProps,
  } = useButtonTexture(
    {
      idle: "ui-spin-button-normal",
      disabled: "ui-spin-button-disabled",
      pressed: "ui-spin-button-onpress",
    },
    placedBets.length === 0,
  );

  const {
    texture: undoTexture,
    handlers: undoHandlers,
    interactiveProps: undoInteractiveProps,
  } = useButtonTexture(
    {
      idle: "ui-undo-button-idle",
      disabled: "ui-undo-button-disabled",
      pressed: "ui-undo-button-pressed",
    },
    placedBets.length === 0,
  );

  const {
    texture: repeatTexture,
    handlers: repeatHandlers,
    interactiveProps: repeatInteractiveProps,
  } = useButtonTexture(
    {
      idle: "ui-repeat-button-idle",
      disabled: "ui-repeat-button-disabled",
      pressed: "ui-repeat-button-pressed",
    },
    placedBets.length !== 0,
  );

  const {
    texture: clearTexture,
    handlers: clearHandlers,
    interactiveProps: clearInteractiveProps,
  } = useButtonTexture(
    {
      idle: "ui-clear-bet-button-idle",
      disabled: "ui-clear-bet-button-disabled",
      pressed: "ui-clear-bet-button-pressed",
    },
    placedBets.length === 0,
  );
  const {
    texture: twoXTexture,
    handlers: twoXHandlers,
    interactiveProps: twoXInteractiveProps,
  } = useButtonTexture(
    {
      idle: "ui-2x-button-idle",
      disabled: "ui-2x-button-disabled",
      pressed: "ui-2x-button-pressed",
    },
    placedBets.length === 0,
  );

  useEffect(() => {
    const c = containerRef.current;
    if (!c) {
      console.log("[ChipAndSpinInterface] containerRef is null");
      return;
    }
    console.log(`[ChipAndSpinInterface] visible changed to: ${visible}`);
    if (!visible) {
      console.log("[ChipAndSpinInterface] Animating out");
      gsap.to(c, {
        y: c.y + 80,
        alpha: 0,
        duration: 0.6,
        ease: "power2.in",
        onComplete: () => {
          console.log("[ChipAndSpinInterface] Hide animation complete");
          onHidden?.();
        },
      });
    } else {
      gsap.killTweensOf(c);
      const targetY = height - (c.height || 0);
      c.y = targetY + 76;
      c.alpha = 0;
      gsap.to(c, {
        y: targetY,
        alpha: 1,
        duration: 0.55,
        ease: "power2.out",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
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
    <pixiContainer ref={containerRef} y={containerY} x={0} zIndex={zIndex}>
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
          texture={clearTexture}
          x={leftOneX}
          y={middleRowY}
          width={actionSize}
          height={actionSize}
          anchor={0.5}
          {...clearInteractiveProps}
          {...clearHandlers}
          onPointerTap={() => {
            clearBets();
            sfx.play("sounds-chip-bet-2");
          }}
        />
        <PixiSprite
          texture={undoTexture}
          x={leftTwoX}
          y={middleRowY}
          width={actionSize}
          height={actionSize}
          anchor={0.5}
          {...undoInteractiveProps}
          {...undoHandlers}
          onPointerTap={() => {
            undoLastBet();
            sfx.play("sounds-chip-taken");
          }}
        />
        <ChipPanel
          x={chipPanelX}
          y={chipPanelY}
          chipContainerWidth={chipPanelWidth}
          chipContainerHeight={chipPanelHeight}
        />

        <PixiSprite
          texture={twoXTexture}
          x={isMobilePortrait ? portraitTwoX : rightOneX}
          y={middleRowY}
          width={actionSize}
          height={actionSize}
          anchor={0.5}
          {...twoXInteractiveProps}
          {...twoXHandlers}
          onPointerTap={() => doubleBets()}
        />
        <PixiSprite
          texture={repeatTexture}
          x={isMobilePortrait ? portraitRepeatX : rightTwoX}
          y={middleRowY}
          width={actionSize}
          height={actionSize}
          anchor={0.5}
          {...repeatInteractiveProps}
          {...repeatHandlers}
          onPointerTap={() => {
            setPlacedBets(bets);
            sfx.play("sounds-chip-bet-2");
          }}
        />

        <LabelSprite
          texture={spinTexture}
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
          {...spinInteractiveProps}
          {...spinHandlers}
          onPointerTap={() => {
            emitEvent("SPIN_BUTTON_CLICKED");
          }}
        />
      </PixiContainer>
    </pixiContainer>
  );
};

export default ChipAndSpinInterface;
