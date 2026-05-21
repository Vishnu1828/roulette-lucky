import { Assets, Sprite } from "pixi.js";

import { extend } from "@pixi/react";
import PixiSprite from "../pixi/PixiSprite";
import { useLayoutStore } from "../../store/useLayoutStore";

extend({ Sprite });

const RouletteBackground = () => {
    const { width, height, layoutMode } = useLayoutStore();

    const bgTexture = Assets.get(layoutMode === "mobile-portrait" ? "background-background-mobile-portrait" : "background-bg-desktop");
    if (!bgTexture) {
        return null;
    }

    const textureWidth = bgTexture.width || 1;
    const textureHeight = bgTexture.height || 1;
    const scale = Math.max(width / textureWidth, height / textureHeight);
    const scaledWidth = textureWidth * scale;
    const scaledHeight = textureHeight * scale;

    return (
        <PixiSprite
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
