import { Assets, Sprite } from "pixi.js";

import { extend } from "@pixi/react";

extend({ Sprite });

const RouletteBackground = ({ width, height }: { width: number, height: number }) => {
    const bgTexture = Assets.get("background-bg-main");
    if (!bgTexture) {
        return null;
    }

    const textureWidth = bgTexture.width || 1;
    const textureHeight = bgTexture.height || 1;
    const scale = Math.max(width / textureWidth, height / textureHeight);
    const scaledWidth = textureWidth * scale;
    const scaledHeight = textureHeight * scale;

    return (
        <pixiSprite
            texture={bgTexture}
            x={width / 2}
            y={height / 2}
            width={scaledWidth}
            height={scaledHeight}
            anchor={0.5}
        />
    );
};

export default RouletteBackground;
