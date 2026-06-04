import { create } from "zustand";

interface WinningNumberState {
  winningMultiplier: number | null;
  setWinningMultiplier: (winningMultiplier: number | null) => void;
  winningNumber: number | null;
  setWinningNumber: (winningNumber: number | null) => void;
}

export const useWinningNumberStore = create<WinningNumberState>((set) => ({
  winningMultiplier: null,
  setWinningMultiplier: (winningMultiplier: number | null) =>
    set({ winningMultiplier }),
  winningNumber: 9,
  setWinningNumber: (winningNumber: number | null) => set({ winningNumber }),
}));
