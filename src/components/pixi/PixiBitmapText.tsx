import { extend } from "@pixi/react";
import { BitmapText } from "pixi.js";
import { useMemo } from "react";
import { useLayoutStore } from "../../store/useLayoutStore";
import { BITMAP_FONT_FAMILY } from "../../utils/assets";

extend({ BitmapText });

type Props = {
  text: string;
  x?: number;
  y?: number;

  fontSize?: number;
  tint?: number;
  alpha?: number;
  rotation?: number;
  anchor?: number;
  fontFamily?: string;
};

const PixiBitmapText = ({
  text,
  x = 0,
  y = 0,
  fontSize = 24,
  tint = 0xffffff,
  rotation = 0,
  anchor = 0.5,
  alpha = 1,
  fontFamily,
}: Props) => {
  const { layoutMode } = useLayoutStore();

  // Determine font family based on layout mode
  const resolvedFontFamily = useMemo(() => {
    if (fontFamily) return fontFamily;
    return layoutMode !== "desktop"
      ? BITMAP_FONT_FAMILY.roulette.mobile
      : BITMAP_FONT_FAMILY.roulette.desktop;
  }, [fontFamily, layoutMode]);

  // Create style object using useMemo for performance
  const style = useMemo(
    () => ({
      fontFamily: resolvedFontFamily,
      fontSize,
      align: "center" as const,
      lineHeight: fontSize * 1.2,
    }),
    [resolvedFontFamily, fontSize],
  );

  // Force recreation on layout/style changes to avoid stale tint state after rotate
  const textInstanceKey = `${resolvedFontFamily}-${layoutMode}-${fontSize}-${tint}`;

  return (
    <pixiBitmapText
      key={textInstanceKey}
      text={text}
      x={x}
      y={y}
      anchor={anchor}
      tint={tint}
      alpha={alpha}
      rotation={rotation}
      style={style}
    />
  );
};

export default PixiBitmapText;
