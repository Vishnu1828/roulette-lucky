import { create } from "zustand";
import { ChipValue } from "../types/chipTypes";

interface ChipState {
  selectedChip: ChipValue | null;
  setSelectedChip: (chip: ChipValue | null) => void;
}

export const useChipStore = create<ChipState>((set) => ({
  selectedChip: null as ChipValue | null,
  setSelectedChip: (chip: ChipValue | null) => set({ selectedChip: chip }),
}));
