import { Assets } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import LabelSprite from "./LabelSprite";
import { useLayoutStore } from "../../store/useLayoutStore";
import { CHIP_DATA } from "../../constants/chips";
import { ChipValue } from "../../types/chipTypes";
import { useChipStore } from "../../store/useChipStore";
import { useEffect, useState } from "react";
import { sfx } from "../../utils/audio";
import GameAnimation from "./GameAnimation";
import { useWalletStore } from "../../store/useWalletStore";

type ChipPanelProps = {
  x?: number;
  y?: number;
  fontFamily?: string;
  chipContainerWidth: number;
  chipContainerHeight: number;
};

const ChipPanel = ({ x = 0, y = 0, chipContainerWidth }: ChipPanelProps) => {
  const { layoutMode } = useLayoutStore();
  const { selectedChip, setSelectedChip } = useChipStore();
  const [chipAnimTick, setChipAnimTick] = useState(0);
  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isMobileLandscape = layoutMode === "mobile-landscape";
  const chipCount = 5;

  const chipAspectRatio = 380 / 388;

  const holderWidthRatio = isMobilePortrait
    ? 0.92
    : isMobileLandscape
      ? 0.92
      : 0.9;

  const holderWidth = chipContainerWidth * holderWidthRatio;
  const holderHeight = holderWidth * (isMobilePortrait ? 0.24 : 0.25);
  const holderX = (chipContainerWidth - holderWidth) / 2;

  const innerPaddingX = holderWidth * 0.048;
  const chipGap = holderWidth * 0.022;
  const rowWidth = holderWidth - innerPaddingX * 2;
  const chipWidth = (rowWidth - chipGap * (chipCount - 1)) / chipCount;
  const chipHeight = chipWidth * chipAspectRatio;
  const chipsY = (holderHeight - chipHeight) / 2;

  const startX = holderX + innerPaddingX;

  const handleChipSelect = (value: ChipValue) => {
    setSelectedChip(value);
    setChipAnimTick((prev) => prev + 1);
    sfx.play("sounds-casino-chips-1");
  };
  const { balance } = useWalletStore();

  useEffect(() => {
    if (selectedChip === null && balance >= 5) {
      setSelectedChip(CHIP_DATA[0].value as ChipValue);
    }
    if (balance < 5) {
      setSelectedChip(null);
    }
  }, [balance]);

  return (
    <PixiContainer x={x} y={y}>
      <PixiSprite
        texture={Assets.get("chips-holder")}
        x={holderX}
        y={0}
        width={holderWidth}
        height={holderHeight}
      />

      {CHIP_DATA.map((chip, i) => {
        const chipX = startX + i * (chipWidth + chipGap);
        const isSelected = selectedChip === (chip.value as ChipValue);
        const animSize = chipWidth * 1.45;
        const chipCenterX = chipX + chipWidth / 2;
        const chipCenterY = chipsY + chipHeight / 2;
        const isAffordable = balance >= chip.value;
        const texture = Assets.get(
          isAffordable ? chip.texture : chip.disableTexture,
        );

        return (
          <PixiContainer key={i}>
            {isSelected && (
              <GameAnimation
                animationKeyword="chip-selected"
                x={chipCenterX}
                y={chipCenterY}
                width={animSize}
                height={animSize}
                loop={false}
                animationSpeed={0.55}
                restartKey={`${chip.value}-${chipAnimTick}`}
              />
            )}
            <LabelSprite
              texture={texture}
              width={chipWidth}
              height={chipHeight}
              x={chipX}
              y={chipsY}
              value={chip.value as ChipValue}
              fontSize={Math.floor(chipWidth * 0.38)}
              anchor={0.5}
              labelY={chipHeight * 0.55}
              onPointerTap={
                isAffordable
                  ? () => handleChipSelect(chip.value as ChipValue)
                  : undefined
              }
              tint={isAffordable ? 0xffffff : 0x888888}
              interactive={isAffordable}
              cursor={isAffordable ? "pointer" : "default"}
              eventMode={isAffordable ? "static" : "none"}
            />
          </PixiContainer>
        );
      })}
    </PixiContainer>
  );
};

export default ChipPanel;
