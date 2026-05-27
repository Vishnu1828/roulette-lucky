import { Assets, FederatedPointerEvent } from 'pixi.js';
import { useMemo } from 'react';
import { FindNumberColor } from '../../helper/findNumberColor';
import PixiContainer from '../pixi/PixiContainer';
import PixiSprite from '../pixi/PixiSprite';
import PixiBitmapText from '../pixi/PixiBitmapText';

type TableCellProps = {
  number: number;
  cellWidth: number;
  cellHeight: number;
  x?: number;
  y?: number;
  rotate?: number;
  selected?: boolean;
  onPointerTap?: (e: FederatedPointerEvent) => void;
};

const getTileTexture = (number: number, isRed: boolean): string => {
  if (number === 0) return 'table-assets-green-block';
  return isRed ? 'table-assets-red-tile' : 'table-assets-black-tile';
};

const getOutlineTexture = (number: number): string => {
  return number === 0
    ? 'table-assets-green-block-outline'
    : 'table-assets-tile-outline';
};

const TableCell = ({
  number,
  cellWidth,
  cellHeight,
  x = 0,
  y = 0,
  rotate = 0,
  selected = false,
  onPointerTap,
}: TableCellProps) => {
  const isRed = useMemo(() => FindNumberColor(number), [number]);
  const tileTexture = useMemo(
    () => getTileTexture(number, isRed),
    [number, isRed],
  );
  const outlineTexture = useMemo(() => getOutlineTexture(number), [number]);

  // When rotated 90deg, swap width/height so the sprite fills correctly
  const isRotated = Math.abs(rotate) > 0.01;
  const spriteWidth = isRotated ? cellHeight : cellWidth;
  const spriteHeight = isRotated ? cellWidth : cellHeight;

  // Match PixiBoardCell font-size calculation
  const fontSize =
    number === 0
      ? Math.floor(Math.min(cellWidth, cellHeight) * 0.7)
      : Math.floor(cellHeight * 0.5);

  return (
    <PixiContainer
      x={x}
      y={y}
      eventMode={onPointerTap ? 'static' : 'none'}
      cursor={onPointerTap ? 'pointer' : undefined}
      onPointerTap={onPointerTap}
    >
      {/* Layer 1: color tile - centered via anchor=0.5, rotatable */}
      <PixiSprite
        texture={Assets.get(tileTexture)}
        x={0}
        y={0}
        width={spriteWidth}
        height={spriteHeight}
        anchor={0.5}
        rotation={rotate}
      />
      {/* Layer 2: outline border - centered, same rotation */}
      <PixiSprite
        texture={Assets.get(outlineTexture)}
        x={0}
        y={0}
        width={spriteWidth}
        height={spriteHeight}
        anchor={0.5}
        rotation={rotate}
        alpha={selected ? 1 : 0.85}
      />
      {/* Layer 3: number label - always upright, centered */}
      <PixiBitmapText
        text={String(number)}
        fontSize={fontSize}
        x={0}
        y={0}
        anchor={0.5}
        tint={0xf1be31}
      />
    </PixiContainer>
  );
};

export default TableCell;