import { Assets, Texture } from "pixi.js";
import { useState, useCallback, useMemo } from "react";

/**
 * Button states for UI elements
 */
export type ButtonState = "idle" | "disabled" | "pressed";

/**
 * Button texture configuration - pass all three texture aliases
 */
export type ButtonTextures = {
  idle: string;
  disabled: string;
  pressed: string;
};

/**
 * Hook return type
 */
export type UseButtonTextureReturn = {
  /** Current texture based on state */
  texture: Texture;
  /** Current texture alias */
  textureAlias: string;
  /** Whether button is currently pressed */
  isPressed: boolean;
  /** Whether button is disabled */
  isDisabled: boolean;
  /** Current button state */
  state: ButtonState;
  /** Event handlers to spread on the sprite */
  handlers: {
    onPointerDown: () => void;
    onPointerUp: () => void;
    onPointerUpOutside: () => void;
  };
  /** Props for interactive state - spread on sprite */
  interactiveProps: {
    interactive: boolean;
    cursor: string;
    eventMode: "none" | "static";
  };
};

/**
 * Hook to manage button texture with built-in press state management.
 *
 * @param textures - Object with idle, disabled, and pressed texture aliases
 * @param isDisabled - Whether the button is disabled (optional, default false)
 * @returns Object with texture, handlers, and state
 *
 * @example
 * const { texture, handlers } = useButtonTexture(
 *   {
 *     idle: "ui-spin-button-normal",
 *     disabled: "ui-spin-button-disabled",
 *     pressed: "ui-spin-button-onpress"
 *   },
 *   disabled
 * );
 *
 * <PixiSprite
 *   texture={texture}
 *   {...handlers}
 *   onPointerTap={() => emitEvent("SPIN_BUTTON_CLICKED")}
 * />
 */
export function useButtonTexture(
  textures: ButtonTextures,
  isDisabled: boolean = false,
): UseButtonTextureReturn {
  const [isPressed, setIsPressed] = useState(false);

  const onPointerDown = useCallback(() => {
    if (!isDisabled) setIsPressed(true);
  }, [isDisabled]);

  const onPointerUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const state = useMemo<ButtonState>(() => {
    if (isDisabled) return "disabled";
    if (isPressed) return "pressed";
    return "idle";
  }, [isDisabled, isPressed]);

  const textureAlias = useMemo(() => {
    if (isDisabled) return textures.disabled;
    if (isPressed) return textures.pressed;
    return textures.idle;
  }, [textures, isDisabled, isPressed]);

  const texture = useMemo(() => {
    return Assets.get(textureAlias);
  }, [textureAlias]);

  const handlers = useMemo(
    () => ({
      onPointerDown,
      onPointerUp,
      onPointerUpOutside: onPointerUp,
    }),
    [onPointerDown, onPointerUp],
  );

  const interactiveProps = useMemo(
    () => ({
      interactive: !isDisabled,
      cursor: isDisabled ? "default" : "pointer",
      eventMode: (isDisabled ? "none" : "static") as "none" | "static",
    }),
    [isDisabled],
  );

  return {
    texture,
    textureAlias,
    isPressed,
    isDisabled,
    state,
    handlers,
    interactiveProps,
  };
}

/**
 * Get the texture for a button based on provided texture aliases and current state.
 * (Non-hook version for use outside React components)
 *
 * @param textures - Object with idle, disabled, and pressed texture aliases
 * @param isDisabled - Whether the button is disabled
 * @param isPressed - Whether the button is currently pressed
 * @returns The loaded texture
 */
export function getButtonTexture(
  textures: ButtonTextures,
  isDisabled: boolean,
  isPressed: boolean,
): Texture {
  if (isDisabled) return Assets.get(textures.disabled);
  if (isPressed) return Assets.get(textures.pressed);
  return Assets.get(textures.idle);
}

/**
 * Get the texture alias for a button based on provided texture aliases and current state.
 *
 * @param textures - Object with idle, disabled, and pressed texture aliases
 * @param isDisabled - Whether the button is disabled
 * @param isPressed - Whether the button is currently pressed
 * @returns The texture alias string
 */
export function getButtonTextureAlias(
  textures: ButtonTextures,
  isDisabled: boolean,
  isPressed: boolean,
): string {
  if (isDisabled) return textures.disabled;
  if (isPressed) return textures.pressed;
  return textures.idle;
}

/**
 * Get the button state based on interaction flags.
 *
 * @param isDisabled - Whether the button is disabled
 * @param isPressed - Whether the button is currently pressed
 * @returns The button state
 */
export function getButtonState(
  isDisabled: boolean,
  isPressed: boolean,
): ButtonState {
  if (isDisabled) return "disabled";
  if (isPressed) return "pressed";
  return "idle";
}
