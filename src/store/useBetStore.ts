import { create } from "zustand";
import type { PlacedBet } from "../types/rouletteBetting";

interface BetState {
  placedBets: Record<string, PlacedBet>;
  setPlacedBets: (bets: Record<string, PlacedBet>) => void;
  clearBets: () => void;
}

export const useBetStore = create<BetState>((set) => ({
  placedBets: {},
  setPlacedBets: (placedBets: Record<string, PlacedBet>) => set({ placedBets }),
  clearBets: () => set({ placedBets: {} }),
}));
