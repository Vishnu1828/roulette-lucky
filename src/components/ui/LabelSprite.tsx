import { Texture } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import PixiBitmapText from "../pixi/PixiBitmapText";
import { useLayoutStore } from "../../store/useLayoutStore";
import { BITMAP_FONT_FAMILY } from "../../utils/assets";

type LabelSpriteProps = {
  x?: number;
  y?: number;
  width: number;
  height: number;
  texture?: Texture;
  value: number | string;
  fontFamily?: string;
  fontSize: number;
  anchor?: number;
  alpha?: number;
  tint?: number;
  align?: "left" | "center" | "right";
};

const LabelSprite = ({
  x = 0,
  y = 0,
  width,
  height,
  texture,
  value,
  fontFamily,
  fontSize,
  anchor = 0.5,
  alpha,
  tint,
  align = "center",
}: LabelSpriteProps) => {
  const { layoutMode } = useLayoutStore();
  fontFamily =
    layoutMode !== "desktop"
      ? BITMAP_FONT_FAMILY.roulette.mobile
      : BITMAP_FONT_FAMILY.roulette.desktop;
  return (
    <PixiContainer x={x} y={y}>
      <PixiSprite texture={texture} width={width} height={height} />

      <PixiBitmapText
        text={value.toString()}
        anchor={anchor}
        x={width / 2}
        y={height / 2}
        alpha={alpha}
        tint={tint}
        fontFamily={fontFamily}
        fontSize={fontSize}
        align={align}
      />
    </PixiContainer>
  );
};

export default LabelSprite;
