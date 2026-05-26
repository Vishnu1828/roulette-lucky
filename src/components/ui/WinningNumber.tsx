import { Assets } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import LabelSprite from "./LabelSprite";
import { FindNumberColor } from "../../helper/findNumberColor";

export type WinningNumberData = {
  number: number;
  multiplier?: string;
  latest?: boolean;
};

type WinningNumberProps = {
  winNumberData: WinningNumberData;
  x?: number;
  y?: number;
  size?: number;
};

const WinningNumber = ({
  winNumberData,
  x = 0,
  y = 0,
  size = 36,
}: WinningNumberProps) => {
  const winningNumberTexture =
    winNumberData.number === 0
      ? winNumberData?.latest
        ? "recent-winner-assets-latest-green"
        : "recent-winner-assets-green"
      : FindNumberColor(winNumberData?.number)
        ? winNumberData?.latest
          ? "recent-winner-assets-latest-red"
          : "recent-winner-assets-red"
        : winNumberData?.latest
          ? "recent-winner-assets-latest-black"
          : "recent-winner-assets-black";

  const multiplierHeight = size * (21 / 80);
  const multiplierText = winNumberData.multiplier?.trim();
  const multiplierY = -multiplierHeight * 0.45;

  return (
    <PixiContainer x={x} y={y} sortableChildren={true}>
      {multiplierText && (
        <LabelSprite
          texture={Assets.get("recent-winner-assets-multiplier")}
          value={multiplierText}
          width={size}
          height={multiplierHeight}
          y={multiplierY}
          fontSize={Math.floor(multiplierHeight)}
          labelY={multiplierHeight * 0.75}
          zIndex={2}
          tint={0x212726}
        />
      )}
      <LabelSprite
        texture={Assets.get(winningNumberTexture)}
        value={winNumberData.number.toString()}
        width={size}
        height={size}
        y={0}
        fontSize={Math.floor(size * 0.5)}
        labelY={size * 0.54}
        zIndex={1}
        anchor={multiplierText ? 0.35 : 0.45}
        tint={winNumberData?.latest ? 0xf1be31 : 0xffffff}
      />
    </PixiContainer>
  );
};
export default WinningNumber;
