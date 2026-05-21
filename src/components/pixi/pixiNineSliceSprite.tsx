import { extend } from "@pixi/react";
import { Assets, NineSliceSprite } from "pixi.js";

extend({
    NineSliceSprite,
});

type Props = {
    texture: string;
    width?: number;
    height?: number;

    x?: number;
    y?: number;
    anchor?: number;

    leftWidth?: number;
    rightWidth?: number;
    topHeight?: number;
    bottomHeight?: number;

    disabled?: boolean;
    alpha?: number;
    onPointerDown?: (e: any) => void;
    onPointerMove?: (e: any) => void;
    onPointerUp?: (e: any) => void;
    onPointerTap?: (e: any) => void;
    eventMode?: 'none' | 'passive' | 'auto' | 'static' | 'dynamic';
    cursor?: string;
};

const PixiNineSliceSprite = ({
    texture,
    width,
    height,
    x = 0,
    y = 0,
    anchor = 0,

    leftWidth = 12,
    rightWidth = 12,
    topHeight = 12,
    bottomHeight = 12,

    disabled = false,
    alpha = 1,

    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerTap,
    eventMode = "static",
    cursor = "pointer",
}: Props) => {
    return (
        <pixiNineSliceSprite
            texture={Assets.get(texture)}
            width={width}
            height={height}
            x={x}
            y={y}
            anchor={anchor}
            leftWidth={leftWidth}
            rightWidth={rightWidth}
            topHeight={topHeight}
            bottomHeight={bottomHeight}
            alpha={disabled ? 0.6 : alpha}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerTap={onPointerTap}
            eventMode={eventMode}
            cursor={cursor}
        />
    );
};

export default PixiNineSliceSprite;