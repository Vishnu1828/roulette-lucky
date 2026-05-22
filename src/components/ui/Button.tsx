import PixiNineSliceSprite from "../pixi/pixiNineSliceSprite";
import PixiBitmapText from "../pixi/PixiBitmapText";
import PixiSprite from "../pixi/PixiSprite";
import { Assets } from "pixi.js";

type Props = {
  x?: number;
  y?: number;

  width: number;
  height: number;

  text?: string;

  disabled?: boolean;

  texture: string;

  onClick?: () => void;
};

const Button = ({
  x = 0,
  y = 0,
  width,
  height,
  text = "",
  disabled = false,
  texture,
  onClick,
}: Props) => {
  const fontSize = Math.min(width * 0.15, 16);
  const horizontalSlice = Math.max(6, Math.min(14, Math.floor(width / 2) - 1));
  const verticalSlice = Math.max(6, Math.min(12, Math.floor(height / 2) - 1));
  const isInfoTabTexture = texture.startsWith("ui-info-header-");

  return (
    <pixiContainer x={x} y={y}>
      {isInfoTabTexture ? (
        <PixiSprite
          texture={Assets.get(texture)}
          width={width}
          height={height}
          anchor={0.5}
          alpha={disabled ? 0.6 : 1}
          eventMode={disabled ? "none" : "static"}
          cursor={disabled ? "default" : "pointer"}
          onPointerTap={onClick}
        />
      ) : (
        <PixiNineSliceSprite
          texture={texture}
          width={width}
          height={height}
          anchor={0.5}
          leftWidth={horizontalSlice}
          rightWidth={horizontalSlice}
          topHeight={verticalSlice}
          bottomHeight={verticalSlice}
          disabled={disabled}
          onPointerTap={onClick}
          eventMode={disabled ? "none" : "static"}
          cursor={disabled ? "default" : "pointer"}
        />
      )}

      <PixiBitmapText
        text={text}
        x={0}
        y={height * 0.08}
        anchor={0.5}
        fontSize={fontSize}
        tint={0xdfad54}
      />
    </pixiContainer>
  );
};

export default Button;
