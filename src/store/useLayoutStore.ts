import { create } from "zustand";
import { getLayoutMode, LayoutMode } from "../helper/layoutMode";

interface LayoutState {
  width: number;
  height: number;
  layoutMode: LayoutMode;
  updateLayout: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  width: window.innerWidth,
  height: window.innerHeight,
  layoutMode: getLayoutMode(),
  updateLayout: () => {
    // Force a reflow to ensure accurate dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    const layoutMode = getLayoutMode();

    // Only update if values have actually changed
    set((state) => {
      if (
        state.width !== width ||
        state.height !== height ||
        state.layoutMode !== layoutMode
      ) {
        return { width, height, layoutMode };
      }
      return state;
    }, false); // Don't replace, merge - more efficient
  },
}));
