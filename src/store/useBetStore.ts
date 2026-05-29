import { create } from "zustand";
import type { PlacedBet } from "../types/rouletteBetting";

interface BetState {
  placedBets: PlacedBet[];
  setPlacedBets: (bets: PlacedBet[]) => void;
  undoLastBet: () => void;
  clearBets: () => void;
  doubleBets: () => void;
}

export const useBetStore = create<BetState>((set) => ({
  placedBets: [],
  setPlacedBets: (placedBets: PlacedBet[]) => set({ placedBets }),
  undoLastBet: () =>
    set((state) => ({
      placedBets: state.placedBets.slice(0, -1),
    })),
  clearBets: () => set({ placedBets: [] }),
  doubleBets: () =>
    set((state) => {
      // Check limits before doubling
      const grouped: Record<string, number> = {};
      state.placedBets.forEach((b) => {
        grouped[b.spotKey] = (grouped[b.spotKey] || 0) + b.amount;
      });

      const canDouble = Object.entries(grouped).every(([, amount]) => {
        return amount * 2 <= 3000; // Limit check
      });

      if (!canDouble) {
        console.warn("[BET REJECTED] Cannot double: one or more spots exceed limit");
        return state;
      }

      // To preserve undo history, we add a "mirror" of each existing bet action
      // Or we just double the existing actions.
      // If we want undo to undo the "Whole Double", we'd need a more complex state.
      // For now, let's just double each action's amount.
      return {
        placedBets: state.placedBets.map((bet) => ({
          ...bet,
          amount: bet.amount * 2,
          chips: [...bet.chips, ...bet.chips],
        })),
      };
    }),
}));
