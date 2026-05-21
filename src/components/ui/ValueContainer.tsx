import PixiContainer from "../pixi/PixiContainer";
import PixiBitmapText from "../pixi/PixiBitmapText";
import PixiNineSliceSprite from "../pixi/pixiNineSliceSprite";
import { useLayoutStore } from "../../store/useLayoutStore";

type Props = {
  x?: number;
  y?: number;
  label?: string;
  value?: string;
  iconTexture?: string;
  showIcon?: boolean;
  valueFontSize?: number;
  iconSize?: number;
  labelFontSize?: number;
};

const ValueContainer = ({
  x = 0,
  y = 0,
  label = "Balance",
  value = "$100.000",
  iconTexture = "ui-balance-conversion",
  showIcon = false,
  valueFontSize = 18,
  iconSize = 20,
  labelFontSize = 14,
}: Props) => {
  const { layoutMode } = useLayoutStore();

  // Responsive sizing based on screen layout
  const isDesktop = layoutMode === "desktop";
  const isMobileLandscape = layoutMode === "mobile-landscape";

  // Spacing adjusts based on font sizes
  const labelY = 0;
  const valueY = isDesktop ? 22 : isMobileLandscape ? 18 : 16;
  const iconX = isDesktop ? 65 : 50;

  return (
    <PixiContainer x={x} y={y}>
      {/* Top row */}
      <PixiContainer>
        <PixiBitmapText
          text={label}
          x={0}
          y={labelY}
          fontSize={labelFontSize}
          anchor={0}
        />

        {showIcon && (
          <PixiNineSliceSprite
            texture={iconTexture}
            x={iconX}
            y={0}
            width={iconSize}
            height={iconSize}
          />
        )}
      </PixiContainer>

      {/* Bottom value */}
      <PixiBitmapText
        text={value}
        x={0}
        y={valueY}
        fontSize={valueFontSize}
        anchor={0}
      />
    </PixiContainer>
  );
};

export default ValueContainer;
