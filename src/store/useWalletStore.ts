import { create } from "zustand";

interface WalletState {
  balance: number;
  totalBet: number;
  setBalance: (balance: number) => void;
  setTotalBet: (totalBet: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  totalBet: 0,
  setBalance: (balance: number) => set({ balance }),
  setTotalBet: (totalBet: number) => set({ totalBet }),
}));
