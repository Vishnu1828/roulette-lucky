export const MULTIPLIER_NUMBERS: {
  number: number;
  multiplier: 100 | 500 | 1000 | 2000 | 5000;
}[] = [
  { number: 11, multiplier: 2000 },
  { number: 31, multiplier: 5000 },
  { number: 16, multiplier: 500 },
  { number: 24, multiplier: 100 },
  { number: 29, multiplier: 1000 },
];

export const MULTIPLIER_COLORS: Record<100 | 500 | 1000 | 2000 | 5000, number> =
  {
    100: 0x99e1eb, // cyan
    500: 0xf95130, // orange-red
    1000: 0xf95130, // orange-red
    2000: 0xfca85e, // orange
    5000: 0xee7dd2, // pink
  };
