import { useCallback, useEffect, useState } from "react";
import { useLayoutStore } from "../../store/useLayoutStore";
import { useSettingStore } from "../../store/useSettingStore";
import { useVolumeSettingStore } from "../../store/useVolumeSettingStore";
import PixiContainer from "../pixi/PixiContainer";
import BettingSettings from "./BettingSettings";
import { VolumeSlider } from "./VolumeSlider";
import ChipAndSpinInterface from "./ChipAndSpinInterface";
import { useGameStateStore } from "../../store/useGameStateStore";

const Footer = () => {
  const { width, height, layoutMode } = useLayoutStore();
  const { gameState } = useGameStateStore();
  const [chipBoundaries, setChipBoundaries] = useState({
    leftBoundary: 0,
    rightBoundary: 0,
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
  }, [infoVisible, setVolumeVisible, volumeVisible]);
  const handleFooterLayout = useCallback(
    ({
      twoValueContainersTotalWidth,
      settingIconContainerWidth,
    }: {
      twoValueContainersTotalWidth: number;
      settingIconContainerWidth: number;
    }) => {
      // Minimum gap between the chip bar and the left/right content areas
      const minGap = isDesktop ? 24 : 16;

      const nextLeft = isMobilePortrait
        ? 0
        : twoValueContainersTotalWidth + minGap;

      const nextRight = isMobilePortrait
        ? width
        : width - settingIconContainerWidth - minGap;

      setChipBoundaries((prev) =>
        prev.leftBoundary === nextLeft && prev.rightBoundary === nextRight
          ? prev
          : { leftBoundary: nextLeft, rightBoundary: nextRight },
      );
    },
    [isMobilePortrait, isDesktop, width],
  );
  return (
    <PixiContainer x={0} y={0} sortableChildren={true}>
      <BettingSettings
        handleFooterLayout={handleFooterLayout}
        zIndex={isMobilePortrait ? 2 : 0}
      />
      {gameState === "betting" && (
        <ChipAndSpinInterface
          width={width}
          leftBoundary={chipBoundaries.leftBoundary}
          rightBoundary={chipBoundaries.rightBoundary}
          zIndex={1}
        />
      )}
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
