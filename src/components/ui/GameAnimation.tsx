import { extend } from "@pixi/react";
import { AnimatedSprite, Assets, Rectangle, Texture } from "pixi.js";
import { useEffect, useMemo, useRef } from "react";
import { findAssetAlias } from "../../utils/assets";

extend({ AnimatedSprite });

type GameAnimationProps = {
  animationKeyword: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  alpha?: number;
  loop?: boolean;
  animationSpeed?: number;
  restartKey?: string | number;
  tint?: number;
  onComplete?: () => void;
  /** Called every frame change with (currentFrame, totalFrames) */
  onFrameChange?: (currentFrame: number, totalFrames: number) => void;
};

type SpriteData = {
  fileName: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

type SpriteSheetJSON = {
  sprites: SpriteData[];
  spriteSheetWidth: number;
  spriteSheetHeight: number;
};

const GameAnimation = ({
  animationKeyword,
  x,
  y,
  width,
  height,
  alpha = 1,
  loop = true,
  animationSpeed = 0.45,
  restartKey,
  tint = 0xffffff,
  onComplete,
  onFrameChange,
}: GameAnimationProps) => {
  const spriteRef = useRef<AnimatedSprite | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onFrameChangeRef = useRef(onFrameChange);

  // Keep refs updated without triggering re-renders
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onFrameChangeRef.current = onFrameChange;
  }, [onFrameChange]);

  const animationTextures = useMemo(() => {
    const jsonAlias = findAssetAlias(animationKeyword, ".json");
    const pngAlias = findAssetAlias(animationKeyword, ".png");

    console.log(
      `[Animation] Looking for ${animationKeyword}: json=${jsonAlias} png=${pngAlias}`,
    );

    if (!jsonAlias || !pngAlias) {
      console.warn(
        `[Animation] Missing aliases for ${animationKeyword}. json=${jsonAlias} png=${pngAlias}`,
      );
      return [];
    }

    const json = Assets.get(jsonAlias) as SpriteSheetJSON | undefined;
    const baseTexture = Assets.get(pngAlias) as Texture | undefined;

    if (!json || !baseTexture || !json.sprites?.length) {
      console.warn(
        `[Animation] Invalid data for ${animationKeyword}. json=${Boolean(json)} png=${Boolean(
          baseTexture,
        )} sprites=${json?.sprites?.length ?? 0}`,
      );
      return [];
    }

    console.log(
      `[Animation] Loaded ${animationKeyword}: ${json.sprites.length} frames`,
    );

    return json.sprites.map(
      (sprite) =>
        new Texture({
          source: baseTexture.source,
          frame: new Rectangle(sprite.x, sprite.y, sprite.width, sprite.height),
        }),
    );
  }, [animationKeyword]);

  useEffect(() => {
    const sprite = spriteRef.current;
    if (!sprite || animationTextures.length === 0) {
      return;
    }

    // Set callbacks using refs so they can update without restarting animation
    sprite.onComplete = () => {
      console.log(`[Animation] ${animationKeyword} completed`);
      onCompleteRef.current?.();
    };
    sprite.onFrameChange = (frame: number) => {
      onFrameChangeRef.current?.(frame, sprite.totalFrames);
    };

    // Configure and start animation
    sprite.loop = loop;
    sprite.animationSpeed = animationSpeed;
    console.log(
      `[Animation] Starting ${animationKeyword}, loop=${loop}, speed=${animationSpeed}, frames=${animationTextures.length}`,
    );
    sprite.gotoAndPlay(0);
  }, [animationSpeed, animationTextures, loop, restartKey, animationKeyword]);

  if (animationTextures.length === 0) {
    return null;
  }

  return (
    <pixiAnimatedSprite
      ref={spriteRef}
      textures={animationTextures}
      anchor={0.5}
      x={x}
      y={y}
      width={width}
      height={height}
      alpha={alpha}
      tint={tint}
    />
  );
};

export default GameAnimation;
