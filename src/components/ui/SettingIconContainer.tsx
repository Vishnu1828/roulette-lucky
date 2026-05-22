import { Assets } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import { sfx, audio } from "../../utils/audio";
import { useVolumeSettingStore } from "../../store/useVolumeSettingStore";

type Props = {
  x?: number;
  y?: number;
};

const SettingIconContainer = ({ x = 0, y = 0 }: Props) => {
  const { volumeVisible, setVolumeVisible } = useVolumeSettingStore();
  const iconSize = 32;
  const iconGap = 10;

  // Calculate positions for each icon
  const soundIconX = 0;
  const infoIconX = soundIconX + iconSize + iconGap;
  const exitIconX = infoIconX + iconSize + iconGap;

  const handleSoundClick = async () => {
    setVolumeVisible(!volumeVisible);
  };

  return (
    <PixiContainer x={x} y={y}>
      {/* Sound Button */}
      <PixiSprite
        texture={Assets.get(
          volumeVisible ? "ui-sound-button-pressed" : "ui-sound-button-idle",
        )}
        x={soundIconX}
        y={0}
        width={iconSize}
        height={iconSize}
        anchor={0}
        interactive={true}
        cursor="pointer"
        eventMode="static"
        onPointerDown={handleSoundClick}
      />

      {/* Info Button */}
      <PixiSprite
        texture={Assets.get("ui-info-button-idle")}
        x={infoIconX}
        y={0}
        width={iconSize}
        height={iconSize}
        anchor={0}
        interactive
        cursor="pointer"
        eventMode="static"
        onPointerDown={() => {
          console.log("Info button tapped");
        }}
      />

      {/* Exit Button */}
      <PixiSprite
        texture={Assets.get("ui-exit-button-idle")}
        x={exitIconX}
        y={0}
        width={iconSize}
        height={iconSize}
        anchor={0}
        interactive
        cursor="pointer"
        eventMode="static"
        onPointerDown={() => {
          console.log("Exit button tapped");
        }}
      />
    </PixiContainer>
  );
};

export default SettingIconContainer;
