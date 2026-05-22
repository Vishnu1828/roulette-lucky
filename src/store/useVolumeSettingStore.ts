import { create } from "zustand";
import { sfx } from "../utils/audio";

interface VolumeSettingsState {
  sfxVolume: number;
  setSfxVolume: (v: number) => void;
}

const DEFAULT_SFX_VOLUME = 60;

// Initialize the audio global instance on load
sfx.setVolume(DEFAULT_SFX_VOLUME / 100);

export const useVolumeSettingStore = create<VolumeSettingsState>((set) => ({
  sfxVolume: DEFAULT_SFX_VOLUME,
  setSfxVolume: (v: number) => {
    sfx.setVolume(v / 100);
    set({ sfxVolume: v });
  },
}));
