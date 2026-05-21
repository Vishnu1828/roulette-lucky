import { extend } from "@pixi/react"
import { Container } from "pixi.js"
import { useRef, useEffect } from "react"

extend({ Container })

type PixiContainerProps = {
    children?: any;
    x?: number;
    y?: number;
    offsetX?: number;
    offsetY?: number;
    width?: number;
    height?: number;
    alpha?: number;
    eventMode?: 'none' | 'passive' | 'auto' | 'static' | 'dynamic';
    cursor?: string;
    onPointerDown?: (e: any) => void;
    onPointerMove?: (e: any) => void;
    onPointerUp?: (e: any) => void;
    onPointerTap?: (e: any) => void;
};

const PixiContainer = ({ children, x, y, offsetX, offsetY, width, height, alpha, eventMode, cursor, onPointerDown, onPointerMove, onPointerUp, onPointerTap }: PixiContainerProps) => {
    const ref = useRef<any>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.offsetX = offsetX;
            ref.current.offsetY = offsetY;
        }
    }, [offsetX, offsetY]);

    return <pixiContainer ref={ref} x={x} y={y} width={width} height={height} alpha={alpha} eventMode={eventMode} cursor={cursor} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerTap={onPointerTap}>{children}</pixiContainer>
}

export default PixiContainer