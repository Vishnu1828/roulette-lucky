import { Assets } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import LabelSprite from "./LabelSprite";
import { useLayoutStore } from "../../store/useLayoutStore";

type ChipPanelProps = {
  x?: number;
  y?: number;
  fontFamily?: string;
  chipContainerWidth: number;
  chipContainerHeight: number;
};

const CHIP_VALUES = [
  { texture: "chips-red-active", value: 5 },
  { texture: "chips-orange-active", value: 10 },
  { texture: "chips-green-active", value: 25 },
  { texture: "chips-purple-active", value: 100 },
  { texture: "chips-black-active", value: 500 },
];

const ChipPanel = ({
  x = 0,
  y = 0,
  chipContainerWidth,
  chipContainerHeight,
}: ChipPanelProps) => {
  const { layoutMode } = useLayoutStore();
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
  return (
    <PixiContainer x={x} y={y}>
      <PixiSprite
        texture={Assets.get("chips-holder")}
        x={holderX}
        y={0}
        width={holderWidth}
        height={holderHeight}
      />

      {CHIP_VALUES.map((chip, i) => {
        const chipX = startX + i * (chipWidth + chipGap);

        return (
          <LabelSprite
            key={i}
            texture={Assets.get(chip.texture)}
            width={chipWidth}
            height={chipHeight}
            x={chipX}
            y={chipsY}
            value={chip.value}
            fontSize={Math.floor(chipWidth * 0.38)}
            anchor={0.5}
          />
        );
      })}
    </PixiContainer>
  );
};

export default ChipPanel;
