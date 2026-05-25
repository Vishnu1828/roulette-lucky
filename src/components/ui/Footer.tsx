import { useCallback, useEffect, useState } from "react";
import { useLayoutStore } from "../../store/useLayoutStore";
import { useSettingStore } from "../../store/useSettingStore";
import { useVolumeSettingStore } from "../../store/useVolumeSettingStore";
import PixiContainer from "../pixi/PixiContainer";
import BettingSettings from "./BettingSettings";
import { VolumeSlider } from "./VolumeSlider";
import ChipAndSpinInterface from "./ChipAndSpinInterface";

const Footer = () => {
  const { width, height, layoutMode } = useLayoutStore();
  const [chipInterfaceLayout, setChipInterfaceLayout] = useState({
    width: 0,
    x: 0,
  });

  const { sfxVolume, setSfxVolume } = useVolumeSettingStore();
  const { volumeVisible, setVolumeVisible, infoVisible } = useSettingStore();
  // Calculate footer height (same as BettingSettings)
  const footerHeight = Math.max(48, height * 0.06);

  // VolumeSlider dimensions based on layout mode
  const isDesktop = layoutMode === "desktop";
  const isMobilePortrait = layoutMode === "mobile-portrait";
  const sliderWidth = 266;

  // Right margin (same as BettingSettings)
  const rightMargin = isDesktop ? width * 0.03 : 14;

  // Position volume slider above chip panel
  const sliderX = width - rightMargin - sliderWidth / 2;
  const sliderY = height - footerHeight - (isDesktop ? 40 : 32);
  useEffect(() => {
    if (infoVisible && volumeVisible) {
      setVolumeVisible(false);
    }
  }, [infoVisible]);
  const handleFooterLayout = useCallback(
    ({
      twoValueContainersTotalWidth,
      settingIconContainerWidth,
    }: {
      twoValueContainersTotalWidth: number;
      settingIconContainerWidth: number;
    }) => {
      if (isMobilePortrait) {
        setChipInterfaceLayout((prev) =>
          prev.width === width && prev.x === 0 ? prev : { width, x: 0 },
        );
        return;
      }

      const slotPadding = 24;
      const usedWidth =
        twoValueContainersTotalWidth + settingIconContainerWidth;
      const availableSlotWidth = Math.max(
        0,
        width - usedWidth - slotPadding * 2,
      );
      const nextX = twoValueContainersTotalWidth + slotPadding;

      setChipInterfaceLayout((prev) =>
        prev.width === availableSlotWidth && prev.x === nextX
          ? prev
          : {
              width: availableSlotWidth,
              x: nextX,
            },
      );
    },
    [isMobilePortrait, width],
  );
  return (
    <PixiContainer x={0} y={0} sortableChildren={true}>
      <BettingSettings
        handleFooterLayout={handleFooterLayout}
        zIndex={isMobilePortrait ? 2 : 0}
      />
      <ChipAndSpinInterface
        width={chipInterfaceLayout.width}
        x={chipInterfaceLayout.x}
        zIndex={1}
      />
      {volumeVisible && (
        <VolumeSlider
          x={sliderX}
          y={sliderY}
          value={sfxVolume}
          onChange={setSfxVolume}
          zIndex={3}
        />
      )}
    </PixiContainer>
  );
};

export default Footer;
