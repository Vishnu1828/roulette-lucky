import { FC, useCallback, useRef, useState } from "react";
import { FederatedPointerEvent, FederatedWheelEvent, Graphics } from "pixi.js";
import PixiText from "../pixi/PixiText";

type Column = {
  key: string;
  title: string;
  width?: number;
};

type Row = Record<string, string>;

type Props = {
  x?: number;
  y?: number;
  width: number;
  height?: number;

  columns: Column[];
  rows: Row[];

  headerTint?: number;
  rowTint?: number;

  headerFontSize?: number;
  rowFontSize?: number;

  rowHeight?: number;
};

const Table: FC<Props> = ({
  x = 0,
  y = 0,
  width,
  height,
  columns,
  rows,
  headerTint = 0xdfad54,
  rowTint = 0xffffff,
  headerFontSize = 12,
  rowFontSize = 10,
  rowHeight = 32,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [mask, setMask] = useState<Graphics | null>(null);
  const dragData = useRef({ isDragging: false, startY: 0, startScrollY: 0 });

  const contentWidth = width - 2;

  const totalDefinedWidth = columns.reduce(
    (sum, col) => sum + (col.width ?? 0),
    0,
  );
  const autoWidth =
    totalDefinedWidth < 1
      ? (1 - totalDefinedWidth) / columns.filter((c) => !c.width).length
      : 1 / columns.length;

  const finalColumns = columns.map((col) => ({
    ...col,
    actualWidth: contentWidth * (col.width ?? autoWidth),
  }));

  // Header occupies 54px.
  const tableHeaderHeight = 32;
  const contentHeight = height ? height - tableHeaderHeight : 99999;
  const rowsTotalHeight = rows.length * rowHeight;
  const maxScroll = Math.max(0, rowsTotalHeight - contentHeight);

  const onWheel = useCallback(
    (e: FederatedWheelEvent) => {
      if (!height || maxScroll <= 0) return;
      const dy = e.deltaY;
      setScrollY((prev) => Math.max(0, Math.min(maxScroll, prev + dy)));
    },
    [height, maxScroll],
  );

  const onPointerDown = useCallback(
    (e: FederatedPointerEvent) => {
      if (!height || maxScroll <= 0) return;
      dragData.current.isDragging = true;
      dragData.current.startY = e.global.y;
      dragData.current.startScrollY = scrollY;
    },
    [height, maxScroll, scrollY],
  );

  const onPointerMove = useCallback(
    (e: FederatedPointerEvent) => {
      if (!dragData.current.isDragging) return;
      const dy = e.global.y - dragData.current.startY;
      setScrollY(
        Math.max(0, Math.min(maxScroll, dragData.current.startScrollY - dy)),
      );
    },
    [maxScroll],
  );

  const onPointerUp = useCallback(() => {
    dragData.current.isDragging = false;
  }, []);

  const drawMask = useCallback(
    (g: Graphics) => {
      g.clear();
      g.rect(0, tableHeaderHeight, width, contentHeight);
      g.fill({ color: 0xffffff, alpha: 1 });
    },
    [width, contentHeight, tableHeaderHeight],
  );

  return (
    <pixiContainer x={x} y={y}>
      {/* Header background & text */}
      {finalColumns.map((col, index) => {
        const columnStart = finalColumns
          .slice(0, index)
          .reduce((sum, c) => sum + c.actualWidth, 0);
        const centerX = columnStart + col.actualWidth / 2;

        return (
          <PixiText
            key={`header-${index}`}
            text={col.title}
            x={centerX}
            y={0}
            anchor={0.5}
            fontSize={headerFontSize}
            fill={headerTint}
          />
        );
      })}

      <pixiGraphics
        y={18}
        draw={(g) => {
          g.clear();
          g.moveTo(0, 0);
          g.lineTo(width, 0);
          g.stroke({ width: 1, color: 0xdfad54, alpha: 0.5 });
        }}
      />

      {/* Mask graphic */}
      {height && maxScroll > 0 && (
        <pixiGraphics draw={drawMask} ref={setMask} />
      )}

      {/* Scrollable Container */}
      <pixiContainer
        y={tableHeaderHeight - scrollY}
        mask={height && mask && maxScroll > 0 ? mask : null}
        interactive={!!height && maxScroll > 0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerUpOutside={onPointerUp}
        onWheel={onWheel}
      >
        {/* Hit area for scrolling that covers the visible masked area or total scroll height */}
        {height && maxScroll > 0 && (
          <pixiGraphics
            draw={(g) => {
              g.clear();
              g.rect(0, 0, width, Math.max(contentHeight, rowsTotalHeight));
              g.fill({ color: 0x000000, alpha: 0.001 });
            }}
          />
        )}
        {rows.map((row, rowIndex) => {
          const rowY = 10 + rowIndex * rowHeight;

          return (
            <pixiContainer key={rowIndex} y={rowY}>
              {finalColumns.map((col, colIndex) => {
                const columnStart = finalColumns
                  .slice(0, colIndex)
                  .reduce((sum, c) => sum + c.actualWidth, 0);
                const centerX = columnStart + col.actualWidth / 2;

                return (
                  <PixiText
                    key={`row-${rowIndex}-col-${colIndex}`}
                    text={row[col.key] ?? ""}
                    x={centerX}
                    anchor={0.5}
                    fontSize={rowFontSize}
                    fill={rowTint}
                  />
                );
              })}
            </pixiContainer>
          );
        })}
      </pixiContainer>
    </pixiContainer>
  );
};

export default Table;
