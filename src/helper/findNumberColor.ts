import { RED_NUMBERS } from "../constants/roulette";

export const FindNumberColor = (number: number) => {
  return RED_NUMBERS.includes(number);
};
