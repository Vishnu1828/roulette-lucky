import { create } from "zustand";
import { GameStateType } from "../types/gameStateType";

/**
 * Game Flow Events - emitted by components when animations/actions complete
 */
export type GameFlowEvent =
  | "SPIN_BUTTON_CLICKED" // User clicks spin button
  | "MULTIPLIER_SELECTION_COMPLETE" // Table multiplier selection animation done
  | "MULTIPLIER_REVEAL_COMPLETE" // Table multiplier reveal animation done
  | "BONUS_MULTIPLIERS_READY" // Bonus multiplier badges animation done
  | "WHEEL_SPIN_COMPLETE" // Roulette wheel spin finished
  | "RESULT_DISPLAY_COMPLETE" // Result screen finished showing
  | "RESET_GAME"; // Reset to betting state

/**
 * Transition phases within multiplier-launch state
 */
export type TransitionPhase =
  | 0 // betting/start
  | 1 // centering table
  | 2 // final-layout
  | 3; // show-multipliers

interface GameFlowState {
  // Current game state
  gameState: GameStateType;

  // Transition phase for multiplier-launch animations
  transitionPhase: TransitionPhase;

  // Event listeners
  listeners: Map<GameFlowEvent, Set<() => void>>;

  // Actions
  emitEvent: (event: GameFlowEvent) => void;
  subscribe: (event: GameFlowEvent, callback: () => void) => () => void;

  // Direct state setters (for edge cases)
  setGameState: (state: GameStateType) => void;
  setTransitionPhase: (phase: TransitionPhase) => void;
}

/**
 * Game Flow Store - Event-driven state machine for game phases
 *
 * Flow:
 * 1. betting → SPIN_BUTTON_CLICKED → multiplier-launch (phase 1)
 * 2. multiplier-launch → MULTIPLIER_SELECTION_COMPLETE → phase 2
 * 3. multiplier-launch → MULTIPLIER_REVEAL_COMPLETE → phase 3 (bonus badges start animating)
 * 4. multiplier-launch (phase 3) → BONUS_MULTIPLIERS_READY → spinning
 * 5. spinning → WHEEL_SPIN_COMPLETE → result
 * 6. result → RESULT_DISPLAY_COMPLETE → betting
 */
export const useGameFlowStore = create<GameFlowState>((set, get) => ({
  gameState: "betting",
  transitionPhase: 0,
  listeners: new Map(),

  emitEvent: (event: GameFlowEvent) => {
    const state = get();
    console.log(
      `[GameFlow] Event: ${event}, Current state: ${state.gameState}, Phase: ${state.transitionPhase}`,
    );

    // Handle state transitions based on events
    switch (event) {
      case "SPIN_BUTTON_CLICKED":
        if (state.gameState === "betting") {
          console.log(
            "[GameFlow] → Transitioning to multiplier-launch, phase 1",
          );
          set({ gameState: "multiplier-launch", transitionPhase: 1 });
        }
        break;

      case "MULTIPLIER_SELECTION_COMPLETE":
        if (state.gameState === "multiplier-launch") {
          console.log("[GameFlow] → Selection complete, moving to phase 2");
          set({ transitionPhase: 2 });
        } else {
          console.warn(
            "[GameFlow] MULTIPLIER_SELECTION_COMPLETE ignored - not in multiplier-launch",
          );
        }
        break;

      case "MULTIPLIER_REVEAL_COMPLETE":
        if (state.gameState === "multiplier-launch") {
          console.log("[GameFlow] → Reveal complete, moving to phase 3");
          set({ transitionPhase: 3 });
        } else {
          console.warn(
            "[GameFlow] MULTIPLIER_REVEAL_COMPLETE ignored - not in multiplier-launch",
          );
        }
        break;

      case "BONUS_MULTIPLIERS_READY":
        // When bonus multiplier badges finish animating, go directly to spinning
        if (
          state.gameState === "multiplier-launch" &&
          state.transitionPhase === 3
        ) {
          console.log("[GameFlow] → Transitioning to spinning");
          set({ gameState: "spinning" });
        } else if (state.gameState === "bonus") {
          console.log("[GameFlow] → Transitioning from bonus to spinning");
          set({ gameState: "spinning" });
        } else {
          console.warn(
            "[GameFlow] BONUS_MULTIPLIERS_READY ignored - wrong state/phase",
          );
        }
        break;

      case "WHEEL_SPIN_COMPLETE":
        if (state.gameState === "spinning") {
          console.log("[GameFlow] → Transitioning to result");
          set({ gameState: "result" });
        }
        break;

      case "RESULT_DISPLAY_COMPLETE":
        if (state.gameState === "result") {
          set({ gameState: "betting", transitionPhase: 0 });
        }
        break;

      case "RESET_GAME":
        set({ gameState: "betting", transitionPhase: 0 });
        break;
    }

    // Notify all listeners for this event
    const listeners = state.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback());
    }
  },

  subscribe: (event: GameFlowEvent, callback: () => void) => {
    const state = get();
    const listeners = state.listeners.get(event) ?? new Set();
    listeners.add(callback);
    set({ listeners: new Map(state.listeners).set(event, listeners) });

    // Return unsubscribe function
    return () => {
      const currentState = get();
      const currentListeners = currentState.listeners.get(event);
      if (currentListeners) {
        currentListeners.delete(callback);
        set({
          listeners: new Map(currentState.listeners).set(
            event,
            currentListeners,
          ),
        });
      }
    };
  },

  setGameState: (gameState: GameStateType) => {
    console.log(`[GameFlow] Direct state set: ${gameState}`);
    set({ gameState });
  },

  setTransitionPhase: (transitionPhase: TransitionPhase) => {
    console.log(`[GameFlow] Direct phase set: ${transitionPhase}`);
    set({ transitionPhase });
  },
}));

// Convenience hooks for common patterns
export const useGameState = () => useGameFlowStore((s) => s.gameState);
export const useTransitionPhase = () =>
  useGameFlowStore((s) => s.transitionPhase);
export const useEmitGameEvent = () => useGameFlowStore((s) => s.emitEvent);
