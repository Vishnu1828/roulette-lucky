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
        const width = window.innerWidth;
        const height = window.innerHeight;
        const layoutMode = getLayoutMode();
        set({ width, height, layoutMode });
    },
}));
