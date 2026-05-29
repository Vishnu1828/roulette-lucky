import type { RouletteBetType, PlacedBet } from "../types/rouletteBetting";

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export const CHIP_OPTIONS = [
  { texture: "chips-red-active", value: 5 },
  { texture: "chips-orange-active", value: 10 },
  { texture: "chips-green-active", value: 25 },
  { texture: "chips-purple-active", value: 100 },
  { texture: "chips-black-active", value: 500 },
] as const;

export const TABLE_MAX_PER_SPOT = 5000;

export const DESKTOP_ROWS = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
] as const;

export const PORTRAIT_ROWS = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12],
  [13, 14, 15],
  [16, 17, 18],
  [19, 20, 21],
  [22, 23, 24],
  [25, 26, 27],
  [28, 29, 30],
  [31, 32, 33],
  [34, 35, 36],
] as const;

export const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

export function getChipTexture(value: number) {
  const exact = CHIP_OPTIONS.find((chip) => chip.value === value);
  if (exact) {
    return exact.texture;
  }

  const sorted = [...CHIP_OPTIONS].sort((a, b) => a.value - b.value);
  const fallback =
    [...sorted].reverse().find((chip) => value >= chip.value) ?? sorted[0];
  return fallback.texture;
}

export function getPayoutForType(type: RouletteBetType) {
  switch (type) {
    case "straight":
      return 35;
    case "split":
      return 17;
    case "corner":
      return 8;
    case "street":
    case "trio":
      return 11;
    case "line":
      return 5;
    case "column":
    case "dozen":
      return 2;
    case "color":
    case "range":
    case "parity":
      return 1;
    default:
      return 0;
  }
}

export function sumAmount(chips: number[]) {
  return chips.reduce((total, value) => total + value, 0);
}

export function isWinningBet(
  bet: Pick<PlacedBet, "coveredNumbers">,
  winningNumber: number,
) {
  return bet.coveredNumbers.includes(winningNumber);
}

export function decomposeAmount(amount: number): number[] {
  const result: number[] = [];
  let remaining = amount;

  const sortedChips = [...CHIP_OPTIONS].sort((a, b) => b.value - a.value);

  for (const chip of sortedChips) {
    while (remaining >= chip.value) {
      result.push(chip.value);
      remaining -= chip.value;
    }
  }

  if (remaining > 0) {
    result.push(remaining);
  }

  return result.reverse();
}

export function addChipToStack(existingChips: number[], newChip: number): number[] {
  const totalAmount = existingChips.reduce((sum, val) => sum + val, 0) + newChip;

  const matchingChip = CHIP_OPTIONS.find((c) => c.value === totalAmount);

  if (matchingChip) {
    return [totalAmount];
  }

  return [...existingChips, newChip];
}
