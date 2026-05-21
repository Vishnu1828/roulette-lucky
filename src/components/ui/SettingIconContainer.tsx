import { Assets } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";

type Props = {
  x?: number;
  y?: number;
};

const SettingIconContainer = ({ x = 0, y = 0 }: Props) => {
  const iconSize = 32;
  const iconGap = 10;

  // Calculate positions for each icon
  const soundIconX = 0;
  const infoIconX = soundIconX + iconSize + iconGap;
  const exitIconX = infoIconX + iconSize + iconGap;

  return (
    <PixiContainer x={x} y={y}>
      {/* Sound Button */}
      <PixiSprite
        texture={Assets.get("ui-sound-button-idle")}
        x={soundIconX}
        y={0}
        width={iconSize}
        height={iconSize}
        anchor={0}
      />

      {/* Info Button */}
      <PixiSprite
        texture={Assets.get("ui-info-button-idle")}
        x={infoIconX}
        y={0}
        width={iconSize}
        height={iconSize}
        anchor={0}
      />

      {/* Exit Button */}
      <PixiSprite
        texture={Assets.get("ui-exit-button-idle")}
        x={exitIconX}
        y={0}
        width={iconSize}
        height={iconSize}
        anchor={0}
      />
    </PixiContainer>
  );
};

export default SettingIconContainer;
