import { extend } from "@pixi/react"
import { Sprite, Texture } from "pixi.js"

extend({ Sprite })

type PixiSpriteProps = {
    texture?: Texture;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    anchor?: number | { x: number; y: number } | [number, number];
    angle?: number;
    rotation?: number;
    alpha?: number;
    tint?: number;
    interactive?: boolean;
    onPointerDown?: (event: any) => void;
};

const PixiSprite = ({ texture, x, y, width, height, anchor, angle, rotation, alpha, tint, interactive, onPointerDown }: PixiSpriteProps) => {
    if (!texture) return null;
    return <pixiSprite
        texture={texture}
        x={x}
        y={y}
        width={width}
        height={height}
        anchor={anchor as any}
        angle={angle}
        rotation={rotation}
        alpha={alpha}
        tint={tint}
        interactive={interactive}
        onPointerDown={onPointerDown}
    />
}

export default PixiSprite
