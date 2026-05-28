import { Assets, FederatedPointerEvent } from "pixi.js";
import { useMemo } from "react";
import { FindNumberColor } from "../../helper/findNumberColor";
import PixiContainer from "../pixi/PixiContainer";
import LabelSprite from "./LabelSprite";
import { useLayoutStore } from "../../store/useLayoutStore";

type TableCellProps = {
  number: number;
  cellWidth: number;
  cellHeight: number;
  x?: number;
  y?: number;
  selected?: boolean;
  onPointerTap?: (e: FederatedPointerEvent) => void;
};

const getTileTexture = (number: number, isRed: boolean): string => {
  if (number === 0) return "table-green-block";
  return isRed ? "table-red-tile" : "table-black-tile";
};

const TableCell = ({
  number,
  cellWidth,
  cellHeight,
  x = 0,
  y = 0,
  selected = false,
  onPointerTap,
}: TableCellProps) => {
  const isRed = useMemo(() => FindNumberColor(number), [number]);
  const { layoutMode } = useLayoutStore();
  const isDesktop = layoutMode === "desktop";
  const isMobilePortrait = layoutMode === "mobile-portrait";
  const size = isDesktop ? 0.3 : isMobilePortrait ? 0.5 : 0.4;
  const tileTexture = useMemo(
    () => getTileTexture(number, isRed),
    [number, isRed],
  );
  const fontSize =
    number === 0
      ? Math.floor(Math.min(cellWidth, cellHeight) * 0.7)
      : Math.floor(cellHeight * size);

  return (
    <PixiContainer
      x={x}
      y={y}
      eventMode={onPointerTap ? "static" : "none"}
      cursor={onPointerTap ? "pointer" : undefined}
      onPointerTap={onPointerTap}
    >
      <LabelSprite
        texture={Assets.get(tileTexture)}
        x={-cellWidth / 2}
        y={-cellHeight / 2}
        width={cellWidth}
        height={cellHeight}
        value={number}
        fontSize={fontSize}
        alpha={selected ? 1 : 0.85}
        tint={0xf1be31}
        labelY={cellHeight * 0.54}
      />
    </PixiContainer>
  );
};

export default TableCell;
