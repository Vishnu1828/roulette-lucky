import { create } from "zustand";

interface SettingsState {
  volumeVisible: boolean;
  setVolumeVisible: (visible: boolean) => void;
  infoVisible: boolean;
  setInfoVisible: (visible: boolean) => void;
}

export const useSettingStore = create<SettingsState>((set) => ({
  volumeVisible: false,
  infoVisible: false,
  setInfoVisible: (visible: boolean) => set({ infoVisible: visible }),
  setVolumeVisible: (visible: boolean) => set({ volumeVisible: visible }),
}));
