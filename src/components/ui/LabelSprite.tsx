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
  labelY?: number;
  onPointerTap?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerUpOutside?: () => void;
  zIndex?: number;
  highlighted?: boolean;
  interactive?: boolean;
  cursor?: string;
  eventMode?: "none" | "passive" | "auto" | "static" | "dynamic";
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
  labelY = height / 2,
  onPointerTap,
  onPointerDown,
  onPointerUp,
  onPointerUpOutside,
  zIndex = 1,
  highlighted = false,
  interactive = true,
  cursor = "pointer",
  eventMode = "static",
}: LabelSpriteProps) => {
  const { layoutMode } = useLayoutStore();
  fontFamily = fontFamily
    ? fontFamily
    : layoutMode !== "desktop"
      ? BITMAP_FONT_FAMILY.roulette.mobile
      : BITMAP_FONT_FAMILY.roulette.desktop;
  return (
    <PixiContainer
      x={x}
      y={y}
      onPointerTap={onPointerTap}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerUpOutside={onPointerUpOutside}
      interactive={interactive}
      cursor={cursor}
      zIndex={zIndex}
      eventMode={eventMode}
    >
      <PixiSprite texture={texture} width={width} height={height} />

      {highlighted && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            g.rect(0, 0, width, height);
            g.fill({ color: 0xffffff, alpha: 0.35 });
          }}
        />
      )}

      <PixiBitmapText
        text={value.toString()}
        anchor={anchor}
        x={width / 2}
        y={labelY}
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
