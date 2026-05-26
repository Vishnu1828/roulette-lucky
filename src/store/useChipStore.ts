import { create } from "zustand";
import { ChipValue } from "../types/chipTypes";
import { CHIP_VALUES } from "../constants/chips";

interface ChipState {
  selectedChip: ChipValue | null;
  setSelectedChip: (chip: ChipValue | null) => void;
}

export const useChipStore = create<ChipState>((set) => ({
  selectedChip: CHIP_VALUES[0] as ChipValue,
  setSelectedChip: (chip: ChipValue | null) => set({ selectedChip: chip }),
}));
