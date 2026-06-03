import { useState, useEffect, useRef } from "react";
import PixiContainer from "../pixi/PixiContainer";
import LabelSprite from "./LabelSprite";
import TableCell from "./TableCell";
import PixiSprite from "../pixi/PixiSprite";
import PixiBitmapText from "../pixi/PixiBitmapText";
import { PixiGraphic } from "../pixi/PixiGraphic";
import { Assets, Container } from "pixi.js";
import gsap from "gsap";
import { useLayoutStore } from "../../store/useLayoutStore";
import { useGameStateStore } from "../../store/useGameStateStore";
import { useChipStore } from "../../store/useChipStore";
import { useBetStore } from "../../store/useBetStore";
import { useWalletStore } from "../../store/useWalletStore";
import { getChipTexture } from "../../constants/rouletteBetting";
import {
  MULTIPLIER_COLORS,
  MULTIPLIER_NUMBERS,
} from "../../constants/multipliers";
import { buildRouletteBetZones } from "../../utils/rouletteBetZones";
import type { RouletteBetZone, PlacedBet } from "../../types/rouletteBetting";
import GameAnimation from "./GameAnimation";

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

type MultiplierCellFxProps = {
  number: number;
  multiplier: number;
  x: number;
  y: number;
  cellWidth: number;
  cellHeight: number;
  isMobilePortrait: boolean;
};

const MultiplierCellFx = ({
  number,
  multiplier,
  x,
  y,
  cellWidth,
  cellHeight,
  isMobilePortrait,
}: MultiplierCellFxProps) => {
  const [revealStarted, setRevealStarted] = useState(false);
  const [showMultiplierText, setShowMultiplierText] = useState(false);
  const selectionKeyword = isMobilePortrait
    ? "fx-lucky-number-selection-mobile-portrait"
    : "fx-lucky-number-selection-desktop";
  const revealKeyword = isMobilePortrait
    ? "fx-multiplier-reveal-mobile"
    : "fx-multiplier-reveal-desktop";
  const fxWidth = cellWidth;
  const fxHeight = cellHeight;
  const textFontSize = Math.max(
    7,
    Math.floor(Math.min(cellWidth, cellHeight) * 0.34),
  );

  return (
    <PixiContainer x={x} y={y} sortableChildren zIndex={5}>
      {!revealStarted && (
        <GameAnimation
          animationKeyword={selectionKeyword}
          x={0}
          y={0}
          width={fxWidth}
          height={fxHeight}
          loop={false}
          animationSpeed={0.55}
          restartKey={`select-${number}`}
          onComplete={() => setRevealStarted(true)}
          tint={
            MULTIPLIER_COLORS[multiplier as keyof typeof MULTIPLIER_COLORS] ??
            0xffffff
          }
        />
      )}
      {revealStarted && (
        <GameAnimation
          animationKeyword={revealKeyword}
          x={0}
          y={0}
          width={fxWidth}
          height={fxHeight}
          loop={false}
          animationSpeed={0.55}
          restartKey={`reveal-${number}`}
          onFrameChange={(currentFrame, totalFrames) => {
            if (currentFrame >= Math.floor(totalFrames * 0.45)) {
              setShowMultiplierText(true);
            }
          }}
          tint={
            MULTIPLIER_COLORS[multiplier as keyof typeof MULTIPLIER_COLORS] ??
            0xffffff
          }
        />
      )}
      {showMultiplierText && (
        <PixiBitmapText
          text={`x${multiplier}`}
          x={0}
          y={0}
          fontSize={textFontSize}
          tint={0xffffff}
          anchor={0.5}
        />
      )}
    </PixiContainer>
  );
};

// ── Draw a zone highlight shape ──────────────────────────────────────────
function drawHighlight(g: import("pixi.js").Graphics, zone: RouletteBetZone) {
  g.clear();

  const shape = zone.highlightShape;

  // Always draw the full bounding rect so PixiJS has a hit-test area.
  // Only number cells (straight bets) get a visible fill on hover.

  if (shape.kind === "circle") {
    const hw = shape.radius;
    g.rect(shape.x - hw, shape.y - hw, hw * 2, hw * 2);
  } else if (shape.kind === "diamond") {
    g.rect(
      shape.x - shape.width / 2,
      shape.y - shape.height / 2,
      shape.width,
      shape.height,
    );
  } else {
    g.rect(shape.x, shape.y, shape.width, shape.height);
  }
  g.fill({ color: 0xffffff, alpha: 0 });
}

// ── Friendly label for each bet type ────────────────────────────────────
// function betTypeLabel(zone: RouletteBetZone): string {
//   switch (zone.type) {
//     case "straight": return `Straight (${zone.coveredNumbers[0]}) — 35:1`;
//     case "split": return `Split ${zone.label} — 17:1`;
//     case "corner": return `Corner ${zone.label} — 8:1`;
//     case "street": return `Street ${zone.label} — 11:1`;
//     case "line": return `Six Line ${zone.label} — 5:1`;
//     case "trio": return `Trio ${zone.label} — 11:1`;
//     case "dozen": return `Dozen ${zone.label} — 2:1`;
//     case "column": return `Column ${zone.label} — 2:1`;
//     case "range": return `${zone.label} — 1:1`;
//     case "parity": return `${zone.label.toUpperCase()} — 1:1`;
//     case "color": return `${zone.label.charAt(0).toUpperCase() + zone.label.slice(1)} — 1:1`;
//     default: return zone.label;
//   }
// }

type RouletteTableProps = {
  transitionPhase?: number;
};

const RouletteTable = ({ transitionPhase = 0 }: RouletteTableProps) => {
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
  const containerRef = useRef<Container | null>(null);

  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isMobileLandscape = layoutMode === "mobile-landscape";
  const isDesktop = layoutMode === "desktop";
  const isBetting = gameState === "betting";
  const isMultiplierLaunch = gameState === "multiplier-launch";

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

  const footerTop =
    isBetting || (isMultiplierLaunch && transitionPhase <= 1)
      ? height - chipBarHeight - TABLE_GAP
      : height - bettingSettingsHeight - TABLE_GAP;
  const bettingFooterTop = height - chipBarHeight - TABLE_GAP;

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

  if (isBetting || (isMultiplierLaunch && transitionPhase <= 1)) {
    // Phase 1: Keep betting dimensions & horizontal offset
    tableW = tableRightBound - SIDE_PADDING;
    tableH = Math.min(footerTop - gameAreaTop - TABLE_GAP, 500);

    const targetCX = (() => {
      // Mobile Portrait centering happens in Phase 1
      if (isMobilePortrait && isMultiplierLaunch && transitionPhase === 1) {
        return (SIDE_PADDING + width - rightPadding) / 2;
      }
      // Desktop & Mobile Landscape remain at betting offset during Phase 1 reveals
      return SIDE_PADDING + tableW / 2;
    })();

    tableCX = targetCX;
    tableCY =
      isMobilePortrait && isMultiplierLaunch && transitionPhase === 1
        ? (gameAreaTop + bettingFooterTop) * 0.65
        : gameAreaCenterY;
  } else {
    // Phase 2+: Final result layout
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
          width * (isDesktop ? 0.6 : 0.45),
          isDesktop ? 800 : 400,
          isDesktop ? 800 : 400,
        ),
      );
      tableH = Math.round(tableW * 0.45);
      tableCX = width - rightMargin - tableW / 2;
      tableCY = gameAreaCenterY;
    }
  }

  // --- Smooth GSAP Transitions ---
  useEffect(() => {
    const c = containerRef.current;
    if (!c || tableW <= 0 || tableH <= 0) return;

    const isPortraitMultiplierCentering =
      isMobilePortrait && isMultiplierLaunch && transitionPhase === 1;
    const duration = isPortraitMultiplierCentering
      ? 0.84
      : transitionPhase === 1
        ? 0.65
        : 0.75;
    const delay =
      isMobilePortrait && isMultiplierLaunch && transitionPhase === 1
        ? 0.7
        : 0.8;

    gsap.to(c, {
      x: tableCX,
      y: tableCY,
      duration: duration,
      delay,
      ease: "power2.out",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableCX, tableCY, transitionPhase]);

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

  const highlightedNumbers = new Set(hoveredZoneData?.coveredNumbers || []);

  // ── renderBetOverlay ──────────────────────────────────────────────────
  const renderBetOverlay = (
    zones: ReturnType<typeof buildRouletteBetZones>,
    chipSize: number,
  ) => {
    if (!isBetting) return null;

    return (
      <>
        {zones.map((zone) => {
          // Stable draw fn factory (avoids over-memoisation across zone list)
          // We pass `isHovered` into the draw at render time.
          // useCallback in PixiGraphic will re-run when draw reference changes,
          // which happens whenever hoveredKey changes. That's acceptable.
          const drawFn = (g: import("pixi.js").Graphics) =>
            drawHighlight(g, zone);

          return (
            <PixiGraphic
              key={`hit-${zone.spotKey}`}
              eventMode={selectedChip ? "static" : "none"}
              cursor={selectedChip ? "pointer" : "default"}
              draw={drawFn}
              onPointerEnter={() =>
                !isMobilePortrait && setHoveredKey(zone.spotKey)
              }
              onPointerLeave={() =>
                !isMobilePortrait &&
                setHoveredKey((k) => (k === zone.spotKey ? null : k))
              }
              onPointerDown={() =>
                isMobilePortrait && setHoveredKey(zone.spotKey)
              }
              onPointerUp={() => isMobilePortrait && setHoveredKey(null)}
              onPointerUpOutside={() => isMobilePortrait && setHoveredKey(null)}
              onPointerCancel={() => isMobilePortrait && setHoveredKey(null)}
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
    const showMultiplierCellFx =
      (isMultiplierLaunch && transitionPhase >= 1) ||
      gameState === "bonus" ||
      gameState === "spinning";
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

    const pHighlightedNumbers = new Set(pHoveredZone?.coveredNumbers || []);

    const portraitRows: number[][] = Array.from({ length: 12 }, (_, idx) => [
      idx * 3 + 1,
      idx * 3 + 2,
      idx * 3 + 3,
    ]);

    return (
      <pixiContainer
        ref={containerRef}
        x={tableCX}
        y={tableCY}
        sortableChildren
      >
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
                highlighted={pHighlightedNumbers.has(number)}
              />
            );
          });
        })}

        {showMultiplierCellFx &&
          MULTIPLIER_NUMBERS.map((multiplierData) => {
            const rowIdx = Math.floor((multiplierData.number - 1) / 3);
            const colIdx = (multiplierData.number - 1) % 3;
            const rSnap = snap(pGridStartY, pGridH, 12, rowIdx);
            const cSnap = snap(pGridStartX, pGridW, 3, colIdx);

            return (
              <MultiplierCellFx
                key={`p-multiplier-fx-${multiplierData.number}`}
                number={multiplierData.number}
                multiplier={multiplierData.multiplier}
                x={cSnap.center}
                y={rSnap.center}
                cellWidth={cSnap.size}
                cellHeight={rSnap.size}
                isMobilePortrait={isMobilePortrait}
              />
            );
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
              highlighted={hoveredKey === `dozen-${idx + 1}`}
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
                  highlighted={
                    hoveredKey ===
                    [
                      "range-1-18",
                      "parity-even",
                      "color-red",
                      "color-black",
                      "parity-odd",
                      "range-19-36",
                    ][idx]
                  }
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
              highlighted={
                hoveredKey ===
                [
                  "range-1-18",
                  "parity-even",
                  "color-red",
                  "color-black",
                  "parity-odd",
                  "range-19-36",
                ][idx]
              }
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
              highlighted={hoveredKey === `column-${idx + 1}`}
            />
          );
        })}

        {renderBetOverlay(
          portraitZones,
          Math.min(pGridW / 3, pGridH / 12) * 0.6,
        )}
      </pixiContainer>
    );
  }

  return (
    <pixiContainer ref={containerRef} x={tableCX} y={tableCY} sortableChildren>
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
                highlighted={
                  hoveredKey ===
                  [
                    "range-1-18",
                    "parity-even",
                    "color-red",
                    "color-black",
                    "parity-odd",
                    "range-19-36",
                  ][idx]
                }
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
            highlighted={
              hoveredKey ===
              [
                "range-1-18",
                "parity-even",
                "color-red",
                "color-black",
                "parity-odd",
                "range-19-36",
              ][idx]
            }
          />
        );
      })}

      <TableCell
        number={0}
        x={zeroCenterX}
        y={gridStartY + gridH / 2}
        cellWidth={zeroColW}
        cellHeight={gridH}
        highlighted={highlightedNumbers.has(0)}
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
              highlighted={highlightedNumbers.has(number)}
            />
          );
        });
      })}

      {((isMultiplierLaunch && transitionPhase >= 1) ||
        gameState === "bonus" ||
        gameState === "spinning") &&
        MULTIPLIER_NUMBERS.map((multiplierData) => {
          const rowIdx = NUMBER_ROWS.findIndex((row) =>
            row.includes(multiplierData.number),
          );
          if (rowIdx < 0) return null;

          const colIdx = NUMBER_ROWS[rowIdx].indexOf(multiplierData.number);
          const rSnap = snap(gridStartY, gridH, 3, rowIdx);
          const cSnap = snap(gridStartX, gridW, 12, colIdx);

          return (
            <MultiplierCellFx
              key={`multiplier-fx-${multiplierData.number}`}
              number={multiplierData.number}
              multiplier={multiplierData.multiplier}
              x={cSnap.center}
              y={rSnap.center}
              cellWidth={cSnap.size}
              cellHeight={rSnap.size}
              isMobilePortrait={isMobilePortrait}
            />
          );
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
            highlighted={hoveredKey === `column-${3 - idx}`}
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
            highlighted={hoveredKey === `dozen-${idx + 1}`}
          />
        );
      })}

      {renderBetOverlay(desktopZones, Math.min(gridW / 12, gridH / 3) * 0.62)}
    </pixiContainer>
  );
};
export default RouletteTable;
