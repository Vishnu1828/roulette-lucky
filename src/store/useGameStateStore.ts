import { create } from "zustand";
import { GameStateType } from "../types/gameStateType";

interface GameState {
  gameState: GameStateType | null;
  setGameState: (gameState: GameStateType | null) => void;
}

export const useGameStateStore = create<GameState>((set) => ({
  gameState: "betting" as GameStateType,
  setGameState: (gameState: GameStateType | null) => set({ gameState }),
}));
