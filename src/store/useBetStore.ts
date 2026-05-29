import { create } from "zustand";
import {
  TABLE_MAX_PER_SPOT,
  addChipToStack,
  sumAmount,
} from "../constants/rouletteBetting";
import type { PlacedBet, RouletteBetZone } from "../types/rouletteBetting";

type BetState = {
  placedBets: Record<string, PlacedBet>;
  placeChip: (zone: RouletteBetZone, chipValue: number) => void;
  clearBets: () => void;
};

export const useBetStore = create<BetState>((set) => ({
  placedBets: {},
  placeChip: (zone, chipValue) =>
    set((state) => {
      const current = state.placedBets[zone.spotKey];
      const nextChips = addChipToStack(current?.chips ?? [], chipValue);
      const amount = sumAmount(nextChips);

      if (amount > TABLE_MAX_PER_SPOT) {
        console.warn(
          `[BET REJECTED] spotKey="${zone.spotKey}" — amount ${amount} exceeds TABLE_MAX_PER_SPOT (${TABLE_MAX_PER_SPOT})`,
        );
        return state;
      }

      const newBet = { ...zone, chips: nextChips, amount, chipValue };
      console.log(
        `[BET PLACED] spotKey="${zone.spotKey}" type="${zone.type}" chipAdded=${chipValue} totalAmount=${amount} chips=[${nextChips.join(",")}] covers=[${zone.coveredNumbers.join(",")}]`,
        newBet,
      );

      return {
        placedBets: {
          ...state.placedBets,
          [zone.spotKey]: newBet,
        },
      };
    }),
  clearBets: () => set({ placedBets: {} }),
}));
