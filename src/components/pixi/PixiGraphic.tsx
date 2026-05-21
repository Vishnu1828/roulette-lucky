import { Graphics } from 'pixi.js';
import { useCallback } from 'react';
import { extend } from "@pixi/react";

extend({ Graphics });

type PixiGraphicProps = {
    draw: (g: Graphics) => void;
    x?: number;
    y?: number;
    alpha?: number;
    eventMode?: 'none' | 'passive' | 'auto' | 'static' | 'dynamic';
    cursor?: string;

    onPointerDown?: (e: any) => void;
    onPointerMove?: (e: any) => void;
    onPointerUp?: (e: any) => void;
    onPointerTap?: (e: any) => void;
};

export function PixiGraphic({
    draw,
    x = 0,
    y = 0,
    alpha = 1,
    eventMode = 'none',
    cursor,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerTap,
}: PixiGraphicProps) {
    const drawCallback = useCallback(
        (g: Graphics) => {
            g.clear();
            draw(g);
        },
        [draw]
    );

    return (
        <pixiGraphics
            x={x}
            y={y}
            alpha={alpha}
            draw={drawCallback}
            eventMode={eventMode}
            cursor={cursor}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerTap={onPointerTap}
        />
    );
}