import PixiContainer from "../pixi/PixiContainer";
import { useLayoutStore } from "../../store/useLayoutStore";
import PixiNineSliceSprite from "../pixi/pixiNineSliceSprite";
import ValueContainer from "./ValueContainer";
import SettingIconContainer from "./SettingIconContainer";
import { LayoutMode } from "../../helper/layoutMode";
import { useEffect } from "react";

const estimateTextWidth = (text: string, fontSize: number) =>
  text.length * fontSize * 0.6;

export const getBettingSettingsLayoutValues = ({
  width,
  height,
  layoutMode,
  balanceValue,
  totalBetValue,
}: {
  width: number;
  height: number;
  layoutMode: LayoutMode;
  balanceValue: string;
  totalBetValue: string;
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

  const balanceValueWidth = estimateTextWidth(balanceValue, valueFontSize);
  const totalBetValueWidth = estimateTextWidth(totalBetValue, valueFontSize);

  const balanceContainerWidth = Math.max(
    balanceValueWidth,
    balanceIconX + iconSize + 16,
  );
  const totalBetContainerWidth = totalBetValueWidth;
  const twoValueContainersTotalWidth =
    balanceContainerWidth + totalBetContainerWidth;
  const settingIconSize = 32;
  const settingIconGap = 10;
  const settingIconContainerWidth = settingIconSize * 3 + settingIconGap * 2;

  const balanceX = leftMargin;
  const totalBetX = balanceX + balanceContainerWidth;
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
  const balanceValue = "$100.00";
  const totalBetValue = "$10.000";

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
    balanceValue,
    totalBetValue,
    // Not needed here since we're using absolute positioning
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
        value={balanceValue}
        showIcon
        valueFontSize={valueFontSize}
        iconSize={iconSize}
        labelFontSize={labelFontSize}
      />

      <ValueContainer
        x={totalBetX}
        y={verticalPadding}
        label="TOTAL BET"
        value={totalBetValue}
        valueFontSize={valueFontSize}
        labelFontSize={labelFontSize}
      />

      <SettingIconContainer x={settingIconX} y={settingIconY} />
    </PixiContainer>
  );
};

export default BettingSettings;
