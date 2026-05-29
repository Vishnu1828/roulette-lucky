import { useState, useEffect } from "react";
import PixiContainer from "../pixi/PixiContainer";
import LabelSprite from "./LabelSprite";
import TableCell from "./TableCell";
import PixiSprite from "../pixi/PixiSprite";
import PixiBitmapText from "../pixi/PixiBitmapText";
import { PixiGraphic } from "../pixi/PixiGraphic";
import { Assets } from "pixi.js";
import { useLayoutStore } from "../../store/useLayoutStore";
import { useGameStateStore } from "../../store/useGameStateStore";
import { useChipStore } from "../../store/useChipStore";
import { useBetStore } from "../../store/useBetStore";
import { useWalletStore } from "../../store/useWalletStore";
import { getChipTexture } from "../../constants/rouletteBetting";
import { buildRouletteBetZones } from "../../utils/rouletteBetZones";
import type { RouletteBetZone, PlacedBet } from "../../types/rouletteBetting";

// Keep in sync with Header.tsx and RouletteWheel.tsx
const HEADER_BOTTOM_DESKTOP = 42 + 60 / 2;
const HEADER_BOTTOM_MOBILE = 24 + 32 / 2;
const HEADER_GAP = 8;
const SIDE_PADDING = 12;
const TABLE_GAP = 8;

// ChipAndSpinInterface aspect ratios (keep in sync with ChipAndSpinInterface.tsx)
// Only visible during betting state
const BAR_ASPECT_PORTRAIT = 207 / 392;
const BAR_ASPECT_LANDSCAPE = 161 / 1108;
const MAX_BAR_WIDTH_LANDSCAPE = 760;
const MAX_BAR_WIDTH_DESKTOP = 900;

const TOP_BETS = ["1-18", "EVEN", "", "", "ODD", "19-36"];
const BOTTOM_BETS = ["1ST 12", "2ND 12", "3RD 12"];
const SIDE_BETS = ["2:1", "2:1", "2:1"];
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

// Compute pixel-snapped cell boundaries so adjacent cells share the exact same edge pixel.
function snap(start: number, total: number, count: number, i: number) {
  const l = Math.round(start + (i * total) / count);
  const r = Math.round(start + ((i + 1) * total) / count);
  return { left: l, size: r - l, center: (l + r) / 2 };
}

const NUMBER_ROWS: number[][] = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

// ── Highlight colour palette per bet type ────────────────────────────────
const HOVER_COLORS: Record<string, number> = {
  straight: 0xffd700,
  split: 0x00e5ff,
  corner: 0xff6ec7,
  street: 0x69ff47,
  line: 0xff9100,
  trio: 0xaa00ff,
  dozen: 0xffd700,
  column: 0xffd700,
  range: 0xffd700,
  parity: 0xffd700,
  color: 0xffd700,
};

const HOVER_ALPHA = 0.35;

// ── Draw a zone highlight shape ──────────────────────────────────────────
function drawHighlight(
  g: import("pixi.js").Graphics,
  zone: RouletteBetZone,
  hovered: boolean,
) {
  g.clear();
  const color = HOVER_COLORS[zone.type] ?? 0xffffff;
  const alpha = hovered ? HOVER_ALPHA : 0.001;

  const shape = zone.highlightShape;
  if (shape.kind === "circle") {
    g.circle(shape.x, shape.y, shape.radius);
  } else if (shape.kind === "diamond") {
    const { x, y, width, height } = shape;
    g.moveTo(x, y - height / 2);
    g.lineTo(x + width / 2, y);
    g.lineTo(x, y + height / 2);
    g.lineTo(x - width / 2, y);
    g.closePath();
  } else {
    g.rect(shape.x, shape.y, shape.width, shape.height);
  }
  g.fill({ color, alpha });

  // Draw a border when hovered for extra clarity
  if (hovered) {
    if (shape.kind === "circle") {
      g.circle(shape.x, shape.y, shape.radius);
    } else if (shape.kind === "diamond") {
      const { x, y, width, height } = shape;
      g.moveTo(x, y - height / 2);
      g.lineTo(x + width / 2, y);
      g.lineTo(x, y + height / 2);
      g.lineTo(x - width / 2, y);
      g.closePath();
    } else {
      g.rect(shape.x, shape.y, shape.width, shape.height);
    }
    g.stroke({ color, alpha: 0.85, width: 2 });
  }
}

// ── Friendly label for each bet type ────────────────────────────────────
function betTypeLabel(zone: RouletteBetZone): string {
  switch (zone.type) {
    case "straight": return `Straight (${zone.coveredNumbers[0]}) — 35:1`;
    case "split": return `Split ${zone.label} — 17:1`;
    case "corner": return `Corner ${zone.label} — 8:1`;
    case "street": return `Street ${zone.label} — 11:1`;
    case "line": return `Six Line ${zone.label} — 5:1`;
    case "trio": return `Trio ${zone.label} — 11:1`;
    case "dozen": return `Dozen ${zone.label} — 2:1`;
    case "column": return `Column ${zone.label} — 2:1`;
    case "range": return `${zone.label} — 1:1`;
    case "parity": return `${zone.label.toUpperCase()} — 1:1`;
    case "color": return `${zone.label.charAt(0).toUpperCase() + zone.label.slice(1)} — 1:1`;
    default: return zone.label;
  }
}

const RouletteTable = () => {
  const { width, height, layoutMode } = useLayoutStore();
  const { gameState } = useGameStateStore();
  const { selectedChip } = useChipStore();
  const { placedBets, setPlacedBets } = useBetStore();
  const { setTotalBet } = useWalletStore();

  const handlePlaceChip = (zone: RouletteBetZone, chipValue: number) => {
    const currentSpotAmount = placedBets
      .filter((b) => b.spotKey === zone.spotKey)
      .reduce((acc, b) => acc + b.amount, 0);

    const nextAmount = currentSpotAmount + chipValue;

    if (nextAmount > 3000) {
      console.warn(
        `[BET REJECTED] spotKey="${zone.spotKey}" — amount ${nextAmount} exceeds limit`,
      );
      return;
    }

    const newBet: PlacedBet = {
      spotKey: zone.spotKey,
      type: zone.type,
      coveredNumbers: zone.coveredNumbers,
      chips: [chipValue],
      amount: chipValue,
    };

    setPlacedBets([...placedBets, newBet]);
  };

  // Keep totalBet in sync with placedBets
  useEffect(() => {
    const total = placedBets.reduce((acc, b) => acc + b.amount, 0);
    setTotalBet(total);
  }, [placedBets, setTotalBet]);

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isMobileLandscape = layoutMode === "mobile-landscape";
  const isDesktop = layoutMode === "desktop";
  const isBetting = gameState === "betting";

  // --- Header bottom boundary ---
  const headerBottom = isDesktop ? HEADER_BOTTOM_DESKTOP : HEADER_BOTTOM_MOBILE;
  const gameAreaTop = headerBottom + HEADER_GAP;

  // --- Footer top ---
  const bettingSettingsHeight = Math.max(48, height * 0.06);
  const barWidth = isMobilePortrait
    ? width
    : Math.min(
      width * 0.55,
      isMobileLandscape ? MAX_BAR_WIDTH_LANDSCAPE : MAX_BAR_WIDTH_DESKTOP,
    );
  const chipBarHeight = isMobilePortrait
    ? barWidth * BAR_ASPECT_PORTRAIT
    : barWidth * BAR_ASPECT_LANDSCAPE;

  const footerTop = isBetting
    ? height - chipBarHeight - TABLE_GAP
    : height - bettingSettingsHeight - TABLE_GAP;

  const gameAreaCenterY = (gameAreaTop + footerTop) / 2;

  // --- WinningNumberContainer right boundary (betting state only) ---
  const rightPadding = isDesktop ? 24 : 14;
  const winningPanelWidth = 50;
  const winningPanelLeft = width - rightPadding - winningPanelWidth;
  const tableRightBound = winningPanelLeft - TABLE_GAP;

  // --- Compute table dimensions ---
  let tableW: number;
  let tableH: number;
  let tableCX: number;
  let tableCY: number;

  if (isBetting) {
    tableW = tableRightBound - SIDE_PADDING;
    tableH = Math.min(footerTop - gameAreaTop - TABLE_GAP, 500);
    tableCX = SIDE_PADDING + tableW / 2;
    tableCY = gameAreaCenterY;
  } else {
    if (isMobilePortrait) {
      tableW = Math.round(clamp(width * 0.46, 200, 280));
      tableH = Math.round(clamp(tableW * 0.9, 300, 500));
      tableCX = width / 2;
      const preferredCY = gameAreaTop + (footerTop - gameAreaTop) * 0.72;
      const footerSafeCY = footerTop - tableH / 2;
      tableCY = Math.min(preferredCY, footerSafeCY);
    } else {
      const rightMargin = isDesktop ? 24 : 14;
      tableW = Math.round(
        clamp(
          width * (isDesktop ? 0.6 : 0.39),
          isDesktop ? 800 : 250,
          isDesktop ? 800 : 320,
        ),
      );
      tableH = Math.round(tableW * 0.45);
      tableCX = width - rightMargin - tableW / 2;
      tableCY = gameAreaCenterY;
    }
  }

  if (tableH <= 0 || tableW <= 0) return null;

  const innerW = Math.round(tableW * 0.8);
  const innerH = Math.round(tableH * 0.92);

  const topRowH = Math.round(innerH * 0.15);
  const bottomRowH = Math.round(innerH * 0.14);
  const gridH = innerH - topRowH - bottomRowH;

  const zeroColW = Math.round(innerW * 0.075);
  const rightBetW = Math.round(innerW * 0.06);
  const gridW = innerW - zeroColW - rightBetW;

  const numCellH = gridH / 3;

  const leftX = -Math.round(innerW / 2);
  const topY = -Math.round(innerH / 2);

  const zeroCenterX = Math.round(leftX + zeroColW / 2);
  const gridStartX = leftX + zeroColW;
  const rightStartX = gridStartX + gridW;
  const gridStartY = topY + topRowH;

  const desktopZones = buildRouletteBetZones({
    layout: "desktop",
    gridStartX,
    gridStartY,
    gridW,
    gridH,
    topY,
    topRowH,
    rightStartX,
    rightBetW,
    bottomY: gridStartY + gridH,
    bottomRowH,
    zeroX: zeroCenterX,
    zeroY: gridStartY + gridH / 2,
  });

  // ── Hover label position: find hovered zone and compute label coords ───
  const hoveredZoneData = hoveredKey
    ? desktopZones.find((z) => z.spotKey === hoveredKey)
    : null;

  // ── renderBetOverlay ──────────────────────────────────────────────────
  const renderBetOverlay = (
    zones: ReturnType<typeof buildRouletteBetZones>,
    chipSize: number,
    hoveredLabel?: RouletteBetZone | null,
  ) => {
    if (!isBetting) return null;

    return (
      <>
        {zones.map((zone) => {
          const isHovered = hoveredKey === zone.spotKey;

          // Stable draw fn factory (avoids over-memoisation across zone list)
          // We pass `isHovered` into the draw at render time.
          // useCallback in PixiGraphic will re-run when draw reference changes,
          // which happens whenever hoveredKey changes. That's acceptable.
          const drawFn = (g: import("pixi.js").Graphics) =>
            drawHighlight(g, zone, isHovered);

          return (
            <PixiGraphic
              key={`hit-${zone.spotKey}`}
              eventMode={selectedChip ? "static" : "none"}
              cursor={selectedChip ? "pointer" : "default"}
              draw={drawFn}
              onPointerEnter={() => setHoveredKey(zone.spotKey)}
              onPointerLeave={() =>
                setHoveredKey((k) => (k === zone.spotKey ? null : k))
              }
              onPointerTap={(e) => {
                if (!selectedChip) return;
                console.log(
                  `[BET CLICK] zone="${zone.spotKey}" type="${zone.type}" covers=[${zone.coveredNumbers.join(",")}] chipValue=${selectedChip} globalPos=(${Math.round(e.global.x)},${Math.round(e.global.y)})`,
                );
                handlePlaceChip(zone, selectedChip);
              }}
            />
          );
        })}

        {/* Floating label shown when hovering a zone */}
        {hoveredLabel && selectedChip && (
          <PixiBitmapText
            text={betTypeLabel(hoveredLabel)}
            x={hoveredLabel.position.x}
            y={hoveredLabel.position.y - chipSize * 1.6}
            anchor={0.5}
            tint={HOVER_COLORS[hoveredLabel.type] ?? 0xffd700}
            fontSize={Math.max(10, chipSize * 0.55)}
          />
        )}

        {/* Placed bet chips (grouped by spot) */}
        {(() => {
          const grouped = placedBets.reduce(
            (acc, bet) => {
              if (!acc[bet.spotKey]) {
                acc[bet.spotKey] = {
                  spotKey: bet.spotKey,
                  totalAmount: 0,
                };
              }
              acc[bet.spotKey].totalAmount += bet.amount;
              return acc;
            },
            {} as Record<string, { spotKey: string; totalAmount: number }>,
          );

          return Object.values(grouped).map((group) => {
            const zone = zones.find((z) => z.spotKey === group.spotKey);
            if (!zone) return null;

            return (
              <LabelSprite
                key={`chip-${group.spotKey}`}
                x={zone.position.x - chipSize / 2}
                y={zone.position.y - chipSize / 2}
                width={chipSize}
                height={chipSize}
                texture={Assets.get(getChipTexture(group.totalAmount))}
                value={group.totalAmount}
                fontSize={Math.floor(chipSize * 0.28)}
                labelY={chipSize * 0.52}
                tint={0xffffff}
              />
            );
          });
        })()}
      </>
    );
  };

  if (isMobilePortrait) {
    const portraitInnerW = Math.round(tableW * 0.94);
    const portraitInnerH = Math.round(tableH * 0.98);
    const pLeft = -Math.round(portraitInnerW / 2);
    const pTop = -Math.round(portraitInnerH / 2);

    const pTopRowH = Math.round(portraitInnerH * 0.08);
    const pBottomRowH = Math.round(portraitInnerH * 0.07);
    const pGridH = portraitInnerH - pTopRowH - pBottomRowH;

    const leftBetW = Math.round(portraitInnerW * 0.17);
    const rightBetW = Math.round(portraitInnerW * 0.17);
    const pGridW = portraitInnerW - leftBetW - rightBetW;

    const pNumCellH = pGridH / 12;

    const pGridStartX = pLeft + leftBetW;
    const pGridStartY = pTop + pTopRowH;
    const pRightStartX = pGridStartX + pGridW;
    const portraitZones = buildRouletteBetZones({
      layout: "portrait",
      gridStartX: pGridStartX,
      gridStartY: pGridStartY,
      gridW: pGridW,
      gridH: pGridH,
      topY: pTop,
      topRowH: pTopRowH,
      rightStartX: pRightStartX,
      rightBetW,
      bottomY: pGridStartY + pGridH,
      bottomRowH: pBottomRowH,
      leftDozenX: pLeft,
      leftDozenW: leftBetW,
      zeroX: pGridStartX + pGridW / 2,
      zeroY: pTop + pTopRowH / 2,
    });

    const pHoveredZone = hoveredKey
      ? portraitZones.find((z) => z.spotKey === hoveredKey)
      : null;

    const portraitRows: number[][] = Array.from({ length: 12 }, (_, idx) => [
      idx * 3 + 1,
      idx * 3 + 2,
      idx * 3 + 3,
    ]);

    return (
      <PixiContainer x={tableCX} y={tableCY}>
        <PixiContainer x={pGridStartX + pGridW / 2} y={pTop + pTopRowH / 2}>
          <PixiSprite
            texture={Assets.get("table-green-block")}
            anchor={0.5}
            width={pTopRowH}
            height={pGridW}
            rotation={Math.PI / 2}
          />
          <PixiBitmapText
            text="0"
            x={0}
            y={0}
            anchor={0.5}
            tint={0xf1be31}
            fontSize={Math.floor(pTopRowH * 0.62)}
          />
        </PixiContainer>

        {portraitRows.map((row, rowIdx) => {
          const rSnap = snap(pGridStartY, pGridH, 12, rowIdx);
          return row.map((number, colIdx) => {
            const cSnap = snap(pGridStartX, pGridW, 3, colIdx);
            return (
              <TableCell
                key={`p-num-${number}`}
                number={number}
                x={cSnap.center}
                y={rSnap.center}
                cellWidth={cSnap.size}
                cellHeight={rSnap.size}
              />
            );
          });
        })}

        {["1ST\n12", "2ND\n12", "3RD\n12"].map((label, idx) => {
          const rSnap = snap(pGridStartY, pGridH, 3, idx);
          return (
            <LabelSprite
              key={`p-left-dozen-${idx}`}
              x={pLeft}
              y={rSnap.left}
              width={leftBetW}
              height={rSnap.size}
              texture={Assets.get("table-right-rectangle")}
              value={label}
              fontSize={Math.floor(pNumCellH * 0.4)}
              labelY={rSnap.size / 2}
              tint={0xf1be31}
            />
          );
        })}

        {["1-18", "EVEN", "", "", "ODD", "19-36"].map((label, idx) => {
          const rSnap = snap(pGridStartY, pGridH, 6, idx);
          if (idx === 2 || idx === 3) {
            const diamondTexture =
              idx === 2 ? "table-red-diamond" : "table-black-diamond";
            return (
              <PixiContainer
                key={`p-right-diamond-${idx}`}
                x={pRightStartX}
                y={rSnap.left}
              >
                <LabelSprite
                  width={rightBetW}
                  height={rSnap.size}
                  texture={Assets.get("table-right-rectangle")}
                  value=""
                  fontSize={Math.floor(rSnap.size * 0.36)}
                />
                <PixiSprite
                  texture={Assets.get(diamondTexture)}
                  x={rightBetW / 2}
                  y={rSnap.size / 2}
                  anchor={0.5}
                  width={rightBetW * 0.56}
                  height={rSnap.size * 0.8}
                />
              </PixiContainer>
            );
          }

          return (
            <LabelSprite
              key={`p-right-bet-${idx}`}
              x={pRightStartX}
              y={rSnap.left}
              width={rightBetW}
              height={rSnap.size}
              texture={Assets.get("table-right-rectangle")}
              value={label}
              fontSize={Math.floor(rSnap.size * 0.2)}
              labelY={rSnap.size * 0.53}
              tint={0xf1be31}
            />
          );
        })}

        {SIDE_BETS.map((label, idx) => {
          const cSnap = snap(pGridStartX, pGridW, 3, idx);
          return (
            <LabelSprite
              key={`p-bottom-${idx}`}
              x={cSnap.left}
              y={pGridStartY + pGridH}
              width={cSnap.size}
              height={pBottomRowH}
              texture={Assets.get("table-bottom-rectangle")}
              value={label}
              fontSize={Math.floor(pBottomRowH * 0.42)}
              labelY={pBottomRowH * 0.56}
              tint={0xf1be31}
            />
          );
        })}

        {renderBetOverlay(
          portraitZones,
          Math.min(pGridW / 3, pGridH / 12) * 0.6,
          pHoveredZone,
        )}
      </PixiContainer>
    );
  }

  return (
    <PixiContainer x={tableCX} y={tableCY}>
      {TOP_BETS.map((label, idx) => {
        const cSnap = snap(gridStartX, gridW, TOP_BETS.length, idx);

        if (idx === 2 || idx === 3) {
          const diamondTexture =
            idx === 2 ? "table-red-diamond" : "table-black-diamond";
          return (
            <PixiContainer key={`top-diamond-${idx}`} x={cSnap.left} y={topY}>
              <LabelSprite
                width={cSnap.size}
                height={topRowH}
                texture={Assets.get("table-top-rectangle")}
                value=""
                fontSize={Math.floor(topRowH * 0.34)}
              />
              <PixiSprite
                texture={Assets.get(diamondTexture)}
                x={cSnap.size / 2}
                y={topRowH / 2}
                anchor={0.5}
                width={cSnap.size * 0.7}
                height={topRowH * 0.7}
              />
            </PixiContainer>
          );
        }

        return (
          <LabelSprite
            key={`top-bet-${idx}`}
            x={cSnap.left}
            y={topY}
            width={cSnap.size}
            height={topRowH}
            texture={Assets.get("table-top-rectangle")}
            value={label}
            fontSize={Math.floor(topRowH * 0.6)}
            labelY={topRowH * 0.52}
            tint={0xf1be31}
          />
        );
      })}

      <TableCell
        number={0}
        x={zeroCenterX}
        y={gridStartY + gridH / 2}
        cellWidth={zeroColW}
        cellHeight={gridH}
      />

      {NUMBER_ROWS.map((row, rowIdx) => {
        const rSnap = snap(gridStartY, gridH, 3, rowIdx);
        return row.map((number, colIdx) => {
          const cSnap = snap(gridStartX, gridW, 12, colIdx);
          return (
            <TableCell
              key={`num-${number}`}
              number={number}
              x={cSnap.center}
              y={rSnap.center}
              cellWidth={cSnap.size}
              cellHeight={rSnap.size}
            />
          );
        });
      })}

      {SIDE_BETS.map((label, idx) => {
        const rSnap = snap(gridStartY, gridH, 3, idx);
        return (
          <LabelSprite
            key={`side-bet-${idx}`}
            x={rightStartX}
            y={rSnap.left}
            width={rightBetW}
            height={rSnap.size}
            texture={Assets.get("table-right-rectangle")}
            value={label}
            fontSize={Math.floor(numCellH * 0.34)}
            labelY={rSnap.size * 0.54}
            tint={0xf1be31}
          />
        );
      })}

      {BOTTOM_BETS.map((label, idx) => {
        const cSnap = snap(gridStartX, gridW, 3, idx);
        return (
          <LabelSprite
            key={`bottom-bet-${idx}`}
            x={cSnap.left}
            y={gridStartY + gridH}
            width={cSnap.size}
            height={bottomRowH}
            texture={Assets.get("table-bottom-rectangle")}
            value={label}
            fontSize={Math.floor(bottomRowH * 0.5)}
            labelY={bottomRowH * 0.58}
            tint={0xf1be31}
          />
        );
      })}

      {renderBetOverlay(
        desktopZones,
        Math.min(gridW / 12, gridH / 3) * 0.62,
        hoveredZoneData,
      )}
    </PixiContainer>
  );
};
export default RouletteTable;
