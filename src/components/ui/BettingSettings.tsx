import PixiContainer from "../pixi/PixiContainer";
import { useLayoutStore } from "../../store/useLayoutStore";
import PixiNineSliceSprite from "../pixi/pixiNineSliceSprite";
import ValueContainer from "./ValueContainer";

const BettingSettings = () => {
  const { width, height, layoutMode } = useLayoutStore();
  const footerHeight = Math.max(48, height * 0.06);

  // Responsive positioning based on layout mode
  const isDesktop = layoutMode === "desktop";
  const isMobileLandscape = layoutMode === "mobile-landscape";

  // Calculate responsive positions
  const leftMargin = isDesktop ? width * 0.02 : isMobileLandscape ? 30 : 20;
  const verticalPadding = isDesktop ? 4 : isMobileLandscape ? 3 : 5;

  // Font sizes from ValueContainer (must match the component's logic)
  const valueFontSize = isDesktop ? 18 : 16;
  const labelFontSize = isDesktop ? 14 : 12;

  const iconSize = 14;
  const iconX = isDesktop ? 65 : isMobileLandscape ? 65 : 60;

  // Balance value text width estimation (0.6 is average character width ratio)
  const balanceValue = "$100.00";
  const balanceTextWidth = balanceValue.length * valueFontSize * 0.6;

  // Calculate actual container width (take the maximum of text width or icon position + icon)
  const balanceContainerWidth = Math.max(balanceTextWidth, iconX + iconSize);

  // Gap between containers
  const containerGap = isDesktop ? 30 : isMobileLandscape ? 25 : 20;

  const balanceX = leftMargin;
  const totalBetX = balanceX + balanceContainerWidth + containerGap;

  return (
    <PixiContainer x={0} y={height - footerHeight}>
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
        value="$10.000"
        valueFontSize={valueFontSize}
        labelFontSize={labelFontSize}
      />
      {/* <SettingIconContainer /> */}
    </PixiContainer>
  );
};

export default BettingSettings;
