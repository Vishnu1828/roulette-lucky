import { extend } from "@pixi/react";
import { Text, TextStyle, FillGradient, type FillInput } from "pixi.js";

extend({ Text });

type Props = {
    text: string;

    x?: number;
    y?: number;
    anchor?: number;

    fontSize?: number;
    fontFamily?: string;
    fontWeight?: "normal" | "bold" | "bolder" | "lighter";

    // normal solid color
    fill?: FillInput;

    // optional gradient
    gradient?: [number, number];
    gradientDirection?: "horizontal" | "vertical";

    align?: "left" | "center" | "right";
    alpha?: number;

    maxWidth?: number;
    wordWrap?: boolean;
    lineHeight?: number;

    visible?: boolean;
};

const PixiText = ({
    text,

    x = 0,
    y = 0,
    anchor = 0,

    fontSize = 16,
    fontFamily = "Arial",
    fontWeight = "normal",

    fill = 0xffffff,

    gradient,
    gradientDirection = "horizontal",

    align = "left",
    alpha = 1,

    maxWidth,
    wordWrap = false,
    lineHeight,

    visible = true,
}: Props) => {
    // build fill dynamically
    const finalFill: FillInput = gradient
        ? new FillGradient({
            type: "linear",
            start: { x: 0, y: 0 },
            end:
                gradientDirection === "horizontal"
                    ? { x: 1, y: 0 }
                    : { x: 0, y: 1 },
            colorStops: [
                {
                    offset: 0,
                    color: gradient[0],
                },
                {
                    offset: 1,
                    color: gradient[1],
                },
            ],
        })
        : fill;

    const style = new TextStyle({
        fontFamily,
        fontSize,
        fontWeight,
        fill: finalFill,
        align,
        wordWrap,
        wordWrapWidth: maxWidth,
        lineHeight,
    });

    return (
        <pixiText
            text={text}
            x={x}
            y={y}
            anchor={anchor}
            alpha={alpha}
            visible={visible}
            style={style}
        />
    );
};

export default PixiText;