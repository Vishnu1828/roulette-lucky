import { useEffect } from "react";
import { useLayoutStore } from "../../store/useLayoutStore";
import { useSettingStore } from "../../store/useSettingStore";
import { useVolumeSettingStore } from "../../store/useVolumeSettingStore";
import PixiContainer from "../pixi/PixiContainer";
import BettingSettings from "./BettingSettings";
import { VolumeSlider } from "./VolumeSlider";

const Footer = () => {
  const { width, height, layoutMode } = useLayoutStore();

  const { sfxVolume, setSfxVolume } = useVolumeSettingStore();
  const { volumeVisible, setVolumeVisible, infoVisible } = useSettingStore();
  // Calculate footer height (same as BettingSettings)
  const footerHeight = Math.max(48, height * 0.06);

  // VolumeSlider dimensions based on layout mode
  const isDesktop = layoutMode === "desktop";
  const sliderWidth = 266;

  // Right margin (same as BettingSettings)
  const rightMargin = isDesktop ? width * 0.03 : 14;

  // Position VolumeSlider on the right side, 16px above BettingSettings
  const sliderX = width - rightMargin - sliderWidth / 2;
  const sliderY = height - footerHeight - (isDesktop ? 40 : 32); // 30 is the slider height
  useEffect(() => {
    if (infoVisible && volumeVisible) {
      setVolumeVisible(false);
    }
  }, [infoVisible]);
  return (
    <PixiContainer x={0} y={0}>
      <BettingSettings />
      {volumeVisible && (
        <VolumeSlider
          x={sliderX}
          y={sliderY}
          value={sfxVolume}
          onChange={setSfxVolume}
        />
      )}
    </PixiContainer>
  );
};

export default Footer;
