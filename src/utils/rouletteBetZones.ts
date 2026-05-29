import {
  getPayoutForType,
  PORTRAIT_ROWS,
  RED_NUMBERS,
} from "../constants/rouletteBetting";
import type { RouletteBetZone } from "../types/rouletteBetting";

type LayoutKind = "desktop" | "portrait";

type GridMetrics = {
  layout: LayoutKind;
  gridStartX: number;
  gridStartY: number;
  gridW: number;
  gridH: number;
  topY: number;
  topRowH: number;
  rightStartX: number;
  rightBetW: number;
  bottomY: number;
  bottomRowH: number;
  leftDozenX?: number;
  leftDozenW?: number;
  /** Centre of the zero cell (relative to table container) */
  zeroX: number;
  zeroY: number;
};

const PARITY_EVEN = Array.from({ length: 18 }, (_, i) => (i + 1) * 2);
const PARITY_ODD = Array.from({ length: 18 }, (_, i) => i * 2 + 1);

function centerOfCells(
  metrics: GridMetrics,
  cells: Array<{ row: number; col: number }>,
) {
  let x = 0;
  let y = 0;
  for (const cell of cells) {
    const { x: cx, y: cy } = cellCenter(metrics, cell.row, cell.col);
    x += cx;
    y += cy;
  }
  return { x: x / cells.length, y: y / cells.length };
}

function cellCenter(metrics: GridMetrics, row: number, col: number) {
  const cw = metrics.gridW / 3;
  const ch = metrics.gridH / 12;

  if (metrics.layout === "portrait") {
    return {
      x: metrics.gridStartX + col * cw + cw / 2,
      y: metrics.gridStartY + row * ch + ch / 2,
    };
  }

  // Desktop: PORTRAIT_ROWS[row][col] maps to visual grid
  // row → visual column (left-to-right), col → visual row (top [col=2] to bottom [col=0])
  const visualCol = row;
  const visualRow = 2 - col;
  const vw = metrics.gridW / 12;
  const vh = metrics.gridH / 3;
  return {
    x: metrics.gridStartX + visualCol * vw + vw / 2,
    y: metrics.gridStartY + visualRow * vh + vh / 2,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Zone builders — ordered from largest areas (lowest z) to smallest (highest z)
// so that small bet zones (corners, splits, straights) win click tests over
// large ones (dozens, streets, lines).
// Final z-order draw sequence: dozen/column/outer → line → street → straight
//   → split → corner → trio
// ────────────────────────────────────────────────────────────────────────────

/** Straight bets for numbers 0–36 */
function buildCanonicalStraight(metrics: GridMetrics): RouletteBetZone[] {
  const zones: RouletteBetZone[] = [];
  const isPortrait = metrics.layout === "portrait";
  const cw = metrics.gridW / (isPortrait ? 3 : 12);
  const ch = metrics.gridH / (isPortrait ? 12 : 3);
  const radius = Math.min(cw, ch) * 0.35;

  // ── Zero ──────────────────────────────────────────────────────────────
  const zeroRadius = Math.min(cw, ch) * 0.4;
  zones.push({
    spotKey: "straight-0",
    type: "straight",
    coveredNumbers: [0],
    payout: getPayoutForType("straight"),
    label: "0",
    position: { x: metrics.zeroX, y: metrics.zeroY },
    highlightShape: {
      kind: "circle",
      x: metrics.zeroX,
      y: metrics.zeroY,
      radius: zeroRadius,
    },
  });

  // ── 1–36 ─────────────────────────────────────────────────────────────
  for (let r = 0; r < 12; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      const n = PORTRAIT_ROWS[r][c];
      const p = cellCenter(metrics, r, c);
      zones.push({
        spotKey: `straight-${n}`,
        type: "straight",
        coveredNumbers: [n],
        payout: getPayoutForType("straight"),
        label: String(n),
        position: p,
        highlightShape: { kind: "circle", x: p.x, y: p.y, radius },
      });
    }
  }

  return zones;
}

export function buildRouletteBetZones(metrics: GridMetrics): RouletteBetZone[] {
  const isPortrait = metrics.layout === "portrait";
  // Single-cell dimensions
  const cw = metrics.gridW / (isPortrait ? 3 : 12);
  const ch = metrics.gridH / (isPortrait ? 12 : 3);

  const zones: RouletteBetZone[] = [];

  // ── Dozens ────────────────────────────────────────────────────────────
  const dozens = [
    Array.from({ length: 12 }, (_, i) => i + 1),
    Array.from({ length: 12 }, (_, i) => i + 13),
    Array.from({ length: 12 }, (_, i) => i + 25),
  ];

  dozens.forEach((nums, idx) => {
    let pos: { x: number; y: number };
    let shape: RouletteBetZone["highlightShape"];

    if (isPortrait) {
      const leftX = metrics.leftDozenX ?? metrics.gridStartX;
      const leftW = metrics.leftDozenW ?? metrics.gridW * 0.17;
      pos = {
        x: leftX + leftW / 2,
        y: metrics.gridStartY + (idx * 4 + 2) * ch,
      };
      shape = {
        kind: "rect",
        x: leftX,
        y: metrics.gridStartY + idx * 4 * ch,
        width: leftW,
        height: 4 * ch,
      };
    } else {
      pos = {
        x: metrics.gridStartX + (idx * 4 + 2) * cw,
        y: metrics.bottomY + metrics.bottomRowH / 2,
      };
      shape = {
        kind: "rect",
        x: metrics.gridStartX + idx * 4 * cw,
        y: metrics.bottomY,
        width: 4 * cw,
        height: metrics.bottomRowH,
      };
    }

    zones.push({
      spotKey: `dozen-${idx + 1}`,
      type: "dozen",
      coveredNumbers: nums,
      payout: getPayoutForType("dozen"),
      label: `${idx + 1}st12`,
      position: pos,
      highlightShape: shape,
    });
  });

  // ── Column (2:1) bets ─────────────────────────────────────────────────
  const cols = [
    Array.from({ length: 12 }, (_, i) => i * 3 + 1),
    Array.from({ length: 12 }, (_, i) => i * 3 + 2),
    Array.from({ length: 12 }, (_, i) => i * 3 + 3),
  ];
  cols.forEach((nums, idx) => {
    let pos: { x: number; y: number };
    let shape: RouletteBetZone["highlightShape"];

    if (isPortrait) {
      pos = {
        x: metrics.gridStartX + (idx + 0.5) * (metrics.gridW / 3),
        y: metrics.bottomY + metrics.bottomRowH / 2,
      };
      shape = {
        kind: "rect",
        x: metrics.gridStartX + idx * (metrics.gridW / 3),
        y: metrics.bottomY,
        width: metrics.gridW / 3,
        height: metrics.bottomRowH,
      };
    } else {
      pos = {
        x: metrics.rightStartX + metrics.rightBetW / 2,
        y: metrics.gridStartY + (idx + 0.5) * (metrics.gridH / 3),
      };
      shape = {
        kind: "rect",
        x: metrics.rightStartX,
        y: metrics.gridStartY + idx * (metrics.gridH / 3),
        width: metrics.rightBetW,
        height: metrics.gridH / 3,
      };
    }

    zones.push({
      spotKey: `column-${idx + 1}`,
      type: "column",
      coveredNumbers: nums,
      payout: getPayoutForType("column"),
      label: `C${idx + 1}`,
      position: pos,
      highlightShape: shape,
    });
  });

  // ── Outer bets: 1-18 / EVEN / ODD / 19-36 ────────────────────────────
  const outerCellW = isPortrait ? metrics.rightBetW : metrics.gridW / 6;
  const outerCellH = isPortrait ? metrics.gridH / 6 : metrics.topRowH;

  const topRects = isPortrait
    ? [
      {
        key: "range-1-18",
        type: "range" as const,
        label: "1-18",
        nums: Array.from({ length: 18 }, (_, i) => i + 1),
        x: metrics.rightStartX + metrics.rightBetW / 2,
        y: metrics.gridStartY + outerCellH * 0.5,
      },
      {
        key: "parity-even",
        type: "parity" as const,
        label: "even",
        nums: PARITY_EVEN,
        x: metrics.rightStartX + metrics.rightBetW / 2,
        y: metrics.gridStartY + outerCellH * 1.5,
      },
      {
        key: "parity-odd",
        type: "parity" as const,
        label: "odd",
        nums: PARITY_ODD,
        x: metrics.rightStartX + metrics.rightBetW / 2,
        y: metrics.gridStartY + outerCellH * 4.5,
      },
      {
        key: "range-19-36",
        type: "range" as const,
        label: "19-36",
        nums: Array.from({ length: 18 }, (_, i) => i + 19),
        x: metrics.rightStartX + metrics.rightBetW / 2,
        y: metrics.gridStartY + outerCellH * 5.5,
      },
    ]
    : [
      {
        key: "range-1-18",
        type: "range" as const,
        label: "1-18",
        nums: Array.from({ length: 18 }, (_, i) => i + 1),
        x: metrics.gridStartX + outerCellW * 0.5,
        y: metrics.topY + metrics.topRowH / 2,
      },
      {
        key: "parity-even",
        type: "parity" as const,
        label: "even",
        nums: PARITY_EVEN,
        x: metrics.gridStartX + outerCellW * 1.5,
        y: metrics.topY + metrics.topRowH / 2,
      },
      {
        key: "parity-odd",
        type: "parity" as const,
        label: "odd",
        nums: PARITY_ODD,
        x: metrics.gridStartX + outerCellW * 4.5,
        y: metrics.topY + metrics.topRowH / 2,
      },
      {
        key: "range-19-36",
        type: "range" as const,
        label: "19-36",
        nums: Array.from({ length: 18 }, (_, i) => i + 19),
        x: metrics.gridStartX + outerCellW * 5.5,
        y: metrics.topY + metrics.topRowH / 2,
      },
    ];

  topRects.forEach((entry) => {
    zones.push({
      spotKey: entry.key,
      type: entry.type,
      coveredNumbers: entry.nums,
      payout: getPayoutForType(entry.type),
      label: entry.label,
      position: { x: entry.x, y: entry.y },
      highlightShape: {
        kind: "rect",
        x: entry.x - outerCellW / 2,
        y: entry.y - outerCellH / 2,
        width: outerCellW,
        height: outerCellH,
      },
    });
  });

  // ── Color bets (red / black diamonds) ────────────────────────────────
  const redNums = Array.from(RED_NUMBERS.values());
  const blackNums = Array.from({ length: 36 }, (_, i) => i + 1).filter(
    (n) => !RED_NUMBERS.has(n),
  );

  const colorPos = isPortrait
    ? [
      {
        key: "color-red",
        nums: redNums,
        x: metrics.rightStartX + metrics.rightBetW / 2,
        y: metrics.gridStartY + outerCellH * 2.5,
      },
      {
        key: "color-black",
        nums: blackNums,
        x: metrics.rightStartX + metrics.rightBetW / 2,
        y: metrics.gridStartY + outerCellH * 3.5,
      },
    ]
    : [
      {
        key: "color-red",
        nums: redNums,
        x: metrics.gridStartX + outerCellW * 2.5,
        y: metrics.topY + metrics.topRowH / 2,
      },
      {
        key: "color-black",
        nums: blackNums,
        x: metrics.gridStartX + outerCellW * 3.5,
        y: metrics.topY + metrics.topRowH / 2,
      },
    ];

  colorPos.forEach((entry) => {
    zones.push({
      spotKey: entry.key,
      type: "color",
      coveredNumbers: entry.nums,
      payout: getPayoutForType("color"),
      label: entry.key.includes("red") ? "red" : "black",
      position: { x: entry.x, y: entry.y },
      highlightShape: {
        kind: "diamond",
        x: entry.x,
        y: entry.y,
        width: outerCellW,
        height: outerCellH,
      },
    });
  });

  // ── Street bets (3-number rows) ───────────────────────────────────────
  // Hit zone: NARROW strip at the betting-edge of the street:
  //   Desktop  → thin strip at the BOTTOM of each visual column (where street chip lands)
  //   Portrait → thin strip at the LEFT edge of each row
  //
  // edgeThickness = 20% of one cell so streets don't swallow the whole column.
  const streetEdgeW = isPortrait ? cw * 0.2 : cw;
  const streetEdgeH = isPortrait ? ch : ch * 0.2;

  for (let r = 0; r < 12; r += 1) {
    const nums = [...PORTRAIT_ROWS[r]];

    // Chip centre: left edge of row (portrait) or bottom edge of column (desktop)
    const position = isPortrait
      ? { x: metrics.gridStartX, y: metrics.gridStartY + r * ch + ch / 2 }
      : { x: metrics.gridStartX + r * cw + cw / 2, y: metrics.gridStartY + metrics.gridH };

    // Narrow hit strip
    const shape: RouletteBetZone["highlightShape"] = isPortrait
      ? {
        kind: "rect",
        x: metrics.gridStartX - streetEdgeW,
        y: metrics.gridStartY + r * ch,
        width: streetEdgeW,
        height: streetEdgeH,
      }
      : {
        kind: "rect",
        x: metrics.gridStartX + r * cw,
        y: metrics.gridStartY + metrics.gridH - streetEdgeH,
        width: streetEdgeW,
        height: streetEdgeH,
      };

    zones.push({
      spotKey: `street-${nums.join("-")}`,
      type: "street",
      coveredNumbers: nums,
      payout: getPayoutForType("street"),
      label: `Street ${nums.join("/")}`,
      position,
      highlightShape: shape,
    });
  }

  // ── Six-line bets (2 adjacent streets = 6 numbers) ────────────────────
  // Hit zone: narrow block at the intersection of the street boundary and the
  // betting edge (bottom for desktop, left for portrait).
  const lineHitSize = Math.min(cw, ch) * 0.35;

  for (let r = 0; r < 11; r += 1) {
    const six = [...PORTRAIT_ROWS[r], ...PORTRAIT_ROWS[r + 1]];

    const position = isPortrait
      ? { x: metrics.gridStartX, y: metrics.gridStartY + (r + 1) * ch }
      : { x: metrics.gridStartX + (r + 1) * cw, y: metrics.gridStartY + metrics.gridH };

    const shape: RouletteBetZone["highlightShape"] = isPortrait
      ? {
        kind: "rect",
        x: metrics.gridStartX - lineHitSize,
        y: metrics.gridStartY + (r + 1) * ch - lineHitSize / 2,
        width: lineHitSize,
        height: lineHitSize,
      }
      : {
        kind: "rect",
        x: metrics.gridStartX + (r + 1) * cw - lineHitSize / 2,
        y: metrics.gridStartY + metrics.gridH - lineHitSize,
        width: lineHitSize,
        height: lineHitSize,
      };

    zones.push({
      spotKey: `line-${r + 1}`,
      type: "line",
      coveredNumbers: six,
      payout: getPayoutForType("line"),
      label: `Six Line ${six.slice(0, 3).join("/")} & ${six.slice(3).join("/")}`,
      position,
      highlightShape: shape,
    });
  }

  // ── Straight bets (drawn = highest z after split/corner/trio) ─────────
  // Placed here — before split/corner — so they appear below in z-order.
  // Straight circles are circular and small; corner/split squares placed after
  // will render on top and win pointer events at intersections.
  // We want straight to win OVER street/line (which is already guaranteed since
  // straight is placed after them), but lose to split/corner.
  // Actually the most important thing is pointer-event hit test order:
  // LAST added zone = highest z = wins pointer test.
  // So order: street → straight → split → corner → trio (trio wins all).
  zones.push(...buildCanonicalStraight(metrics));

  // ── Split bets ────────────────────────────────────────────────────────
  // Horizontal splits (same portrait-row, adjacent columns)
  for (let r = 0; r < 12; r += 1) {
    for (let c = 0; c < 2; c += 1) {
      const a = PORTRAIT_ROWS[r][c];
      const b = PORTRAIT_ROWS[r][c + 1];
      const p = centerOfCells(metrics, [
        { row: r, col: c },
        { row: r, col: c + 1 },
      ]);
      const hw = Math.min(cw, ch) * 0.28;
      zones.push({
        spotKey: `split-${a}-${b}`,
        type: "split",
        coveredNumbers: [a, b],
        payout: getPayoutForType("split"),
        label: `${a}/${b}`,
        position: p,
        highlightShape: {
          kind: "rect",
          x: p.x - hw,
          y: p.y - hw,
          width: hw * 2,
          height: hw * 2,
        },
      });
    }
  }
  // Vertical splits (adjacent portrait-rows, same column)
  for (let r = 0; r < 11; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      const a = PORTRAIT_ROWS[r][c];
      const b = PORTRAIT_ROWS[r + 1][c];
      const p = centerOfCells(metrics, [
        { row: r, col: c },
        { row: r + 1, col: c },
      ]);
      const hw = Math.min(cw, ch) * 0.28;
      zones.push({
        spotKey: `split-${a}-${b}`,
        type: "split",
        coveredNumbers: [a, b],
        payout: getPayoutForType("split"),
        label: `${a}/${b}`,
        position: p,
        highlightShape: {
          kind: "rect",
          x: p.x - hw,
          y: p.y - hw,
          width: hw * 2,
          height: hw * 2,
        },
      });
    }
  }

  // ── Zero Splits (0/1, 0/2, 0/3) ───────────────────────────────────────
  const zeroSplits = [[0, 1], [0, 2], [0, 3]];
  zeroSplits.forEach(([a, b]) => {
    let pos: { x: number; y: number };
    let shape: RouletteBetZone["highlightShape"];
    const hw = Math.min(cw, ch) * 0.28;

    if (isPortrait) {
      const colIdx = b - 1; // 1->0, 2->1, 3->2
      const x = metrics.gridStartX + colIdx * cw + cw / 2;
      const y = metrics.gridStartY;
      pos = { x, y };
      shape = { kind: "rect", x: x - hw, y: y - hw, width: hw * 2, height: hw * 2 };
    } else {
      const visualRowIdx = 3 - b; // 1-> visualRow 2, 2->1, 3->0
      const x = metrics.gridStartX;
      const vh = metrics.gridH / 3;
      const y = metrics.gridStartY + visualRowIdx * vh + vh / 2;
      pos = { x, y };
      shape = { kind: "rect", x: x - hw, y: y - hw, width: hw * 2, height: hw * 2 };
    }

    zones.push({
      spotKey: `split-${a}-${b}`,
      type: "split",
      coveredNumbers: [a, b],
      payout: getPayoutForType("split"),
      label: `${a}/${b}`,
      position: pos,
      highlightShape: shape,
    });
  });

  // ── Corner bets ───────────────────────────────────────────────────────
  for (let r = 0; r < 11; r += 1) {
    for (let c = 0; c < 2; c += 1) {
      const nums = [
        PORTRAIT_ROWS[r][c],
        PORTRAIT_ROWS[r][c + 1],
        PORTRAIT_ROWS[r + 1][c],
        PORTRAIT_ROWS[r + 1][c + 1],
      ];
      const p = centerOfCells(metrics, [
        { row: r, col: c },
        { row: r, col: c + 1 },
        { row: r + 1, col: c },
        { row: r + 1, col: c + 1 },
      ]);
      const hw = Math.min(cw, ch) * 0.24;
      zones.push({
        spotKey: `corner-${nums.join("-")}`,
        type: "corner",
        coveredNumbers: nums,
        payout: getPayoutForType("corner"),
        label: nums.join("/"),
        position: p,
        highlightShape: {
          kind: "rect",
          x: p.x - hw,
          y: p.y - hw,
          width: hw * 2,
          height: hw * 2,
        },
      });
    }
  }

  // ── Trio bets: 0,1,2 and 0,2,3 (highest z — wins over all) ───────────
  if (isPortrait) {
    const trioY = metrics.gridStartY;
    const trio012X = metrics.gridStartX + cw;
    const trio023X = metrics.gridStartX + 2 * cw;
    const trioHW = Math.min(cw, ch) * 0.24;

    zones.push({
      spotKey: "trio-0-1-2",
      type: "trio",
      coveredNumbers: [0, 1, 2],
      payout: getPayoutForType("trio"),
      label: "0/1/2",
      position: { x: trio012X, y: trioY },
      highlightShape: { kind: "rect", x: trio012X - trioHW, y: trioY - trioHW, width: trioHW * 2, height: trioHW * 2 },
    });
    zones.push({
      spotKey: "trio-0-2-3",
      type: "trio",
      coveredNumbers: [0, 2, 3],
      payout: getPayoutForType("trio"),
      label: "0/2/3",
      position: { x: trio023X, y: trioY },
      highlightShape: { kind: "rect", x: trio023X - trioHW, y: trioY - trioHW, width: trioHW * 2, height: trioHW * 2 },
    });
  } else {
    const vh = metrics.gridH / 3;
    const trioX = metrics.gridStartX;
    const trioHW = Math.min(cw, ch) * 0.24;

    zones.push({
      spotKey: "trio-0-1-2",
      type: "trio",
      coveredNumbers: [0, 1, 2],
      payout: getPayoutForType("trio"),
      label: "0/1/2",
      position: { x: trioX, y: metrics.gridStartY + 2 * vh },
      highlightShape: { kind: "rect", x: trioX - trioHW, y: metrics.gridStartY + 2 * vh - trioHW, width: trioHW * 2, height: trioHW * 2 },
    });
    zones.push({
      spotKey: "trio-0-2-3",
      type: "trio",
      coveredNumbers: [0, 2, 3],
      payout: getPayoutForType("trio"),
      label: "0/2/3",
      position: { x: trioX, y: metrics.gridStartY + vh },
      highlightShape: { kind: "rect", x: trioX - trioHW, y: metrics.gridStartY + vh - trioHW, width: trioHW * 2, height: trioHW * 2 },
    });
  }

  return zones;
}
