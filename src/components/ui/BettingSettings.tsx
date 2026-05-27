import PixiContainer from "../pixi/PixiContainer";
import { useLayoutStore } from "../../store/useLayoutStore";
import PixiNineSliceSprite from "../pixi/pixiNineSliceSprite";
import ValueContainer from "./ValueContainer";
import SettingIconContainer from "./SettingIconContainer";
import { LayoutMode } from "../../helper/layoutMode";
import { useEffect } from "react";
import { useWalletStore } from "../../store/useWalletStore";

const estimateTextWidth = (text: string, fontSize: number) =>
  text.length * fontSize * 0.6;

const getBettingSettingsLayoutValues = ({
  width,
  height,
  layoutMode,
  balanceValue,
  totalBetValue,
}: {
  width: number;
  height: number;
  layoutMode: LayoutMode;
  balanceValue: number;
  totalBetValue: number;
}) => {
  const isDesktop = layoutMode === "desktop";
  const isMobileLandscape = layoutMode === "mobile-landscape";

  const footerHeight = Math.max(48, height * 0.06);
  const leftMargin = isDesktop ? width * 0.02 : isMobileLandscape ? 30 : 20;
  const rightMargin = isDesktop ? width * 0.02 : 12;
  const verticalPadding = isDesktop ? 4 : isMobileLandscape ? 3 : 5;

  const valueFontSize = isDesktop ? 18 : 16;
  const labelFontSize = isDesktop ? 14 : 12;

  const iconSize = 14;
  const balanceIconX = isDesktop ? 65 : 50;
  // Minimum container widths: wide enough to always show the label text
  // "BALANCE" = 7 chars, "TOTAL BET" = 9 chars
  const minBalanceContainerWidth =
    estimateTextWidth("BALANCE", labelFontSize) + 16;
  const minTotalBetContainerWidth =
    estimateTextWidth("TOTAL BET", labelFontSize) + 16;
  // Gap between the two value containers so they never collide
  const containerGap = isDesktop ? 24 : 16;

  const balanceValueWidth = estimateTextWidth(
    String(balanceValue),
    valueFontSize,
  );
  const totalBetValueWidth = estimateTextWidth(
    String(totalBetValue),
    valueFontSize,
  );

  const balanceContainerWidth = Math.max(
    balanceValueWidth,
    balanceIconX + iconSize + 16,
    minBalanceContainerWidth,
  );
  const totalBetContainerWidth = Math.max(
    totalBetValueWidth,
    minTotalBetContainerWidth,
  );
  const twoValueContainersTotalWidth =
    balanceContainerWidth + containerGap + totalBetContainerWidth;
  const settingIconSize = 32;
  const settingIconGap = 10;
  const settingIconContainerWidth = settingIconSize * 3 + settingIconGap * 2;

  const balanceX = leftMargin;
  const totalBetX = balanceX + balanceContainerWidth + containerGap;
  const settingIconX = width - rightMargin - settingIconContainerWidth;
  const settingIconY = (footerHeight - settingIconSize) / 2;

  return {
    footerHeight,
    leftMargin,
    rightMargin,
    verticalPadding,
    valueFontSize,
    labelFontSize,
    iconSize,
    settingIconSize,
    settingIconGap,
    settingIconContainerWidth,
    balanceContainerWidth,
    totalBetContainerWidth,
    twoValueContainersTotalWidth,
    balanceX,
    totalBetX,
    settingIconX,
    settingIconY,
  };
};

const BettingSettings = ({
  handleFooterLayout,
  zIndex = 1,
}: {
  handleFooterLayout?: (layout: {
    twoValueContainersTotalWidth: number;
    settingIconContainerWidth: number;
  }) => void;
  zIndex?: number;
}) => {
  const { width, height, layoutMode } = useLayoutStore();
  const { balance, totalBet } = useWalletStore();
  // Use whole numbers — bitmap font does not include a decimal point glyph
  const balanceDisplay = String(Math.floor(balance));
  const totalBetDisplay = String(Math.floor(totalBet));

  const {
    footerHeight,
    verticalPadding,
    valueFontSize,
    labelFontSize,
    iconSize,
    balanceX,
    totalBetX,
    settingIconX,
    settingIconY,
    twoValueContainersTotalWidth,
    settingIconContainerWidth,
  } = getBettingSettingsLayoutValues({
    width,
    height,
    layoutMode,
    balanceValue: Math.floor(balance),
    totalBetValue: Math.floor(totalBet),
  });

  useEffect(() => {
    if (handleFooterLayout) {
      handleFooterLayout({
        twoValueContainersTotalWidth,
        settingIconContainerWidth,
      });
    }
  }, [
    handleFooterLayout,
    width,
    height,
    layoutMode,
    twoValueContainersTotalWidth,
    settingIconContainerWidth,
  ]);
  return (
    <PixiContainer x={0} y={height - footerHeight} zIndex={zIndex}>
      <PixiNineSliceSprite
        texture={
          layoutMode === "mobile-portrait"
            ? "ui-footer-mobile-portrait"
            : "ui-footer-desktop"
        }
        width={width}
        height={footerHeight}
      />
      <ValueContainer
        x={balanceX}
        y={verticalPadding}
        label="BALANCE"
        value={balanceDisplay}
        showIcon
        valueFontSize={valueFontSize}
        iconSize={iconSize}
        labelFontSize={labelFontSize}
      />

      <ValueContainer
        x={totalBetX}
        y={verticalPadding}
        label="TOTAL BET"
        value={totalBetDisplay}
        valueFontSize={valueFontSize}
        labelFontSize={labelFontSize}
      />

      <SettingIconContainer x={settingIconX} y={settingIconY} />
    </PixiContainer>
  );
};

export default BettingSettings;
