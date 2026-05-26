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
}: GameAnimationProps) => {
  const spriteRef = useRef<AnimatedSprite | null>(null);

  const animationTextures = useMemo(() => {
    const jsonAlias = findAssetAlias(animationKeyword, ".json");
    const pngAlias = findAssetAlias(animationKeyword, ".png");

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
        )}`,
      );
      return [];
    }

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
    sprite.loop = loop;
    sprite.animationSpeed = animationSpeed;
    sprite.gotoAndPlay(0);
  }, [animationSpeed, animationTextures, loop, restartKey]);

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
