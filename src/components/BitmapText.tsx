import { useEffect, useRef } from "react";
import { Container, BitmapText as PixiBitmapText } from "pixi.js";
import { extend } from "@pixi/react";
import { sfx } from "../utils/audio";
extend({ Container })
type Props = {
    text: string;
    x?: number;
    y?: number;

    fontSize?: number;
    tint?: number;
    alpha?: number;
    rotation?: number;
    anchor?: number;
    fontFamily: string;

};

const BitmapText = ({
    text,
    x = 0,
    y = 0,
    fontSize = 24,
    tint = 0xffffff,
    rotation = 0,
    anchor = 0.5,
    alpha = 1,
    fontFamily,
}: Props) => {
    const rootRef = useRef<Container>(null);
    const uiRef = useRef<any>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const bitmapText = new PixiBitmapText({
            text,
            style: {
                fontFamily,
                fontSize,
                align: "center",
                lineHeight: fontSize * 1.2,
            },
        });
        bitmapText.anchor = anchor;
        bitmapText.eventMode = "static";
        bitmapText.cursor = "pointer";
        bitmapText.on("pointertap", () => {
            sfx.play("sounds-casino-chips-1");
        });
        root.addChild(bitmapText);

        uiRef.current = { bitmapText };

        return () => {
            root.removeChildren();
        };
    }, [anchor, fontFamily, fontSize, text]);
    useEffect(() => {
        const ui = uiRef.current;
        if (!ui) return;

        const { bitmapText } = ui;



        bitmapText.text = text;
        bitmapText.style.fontSize = fontSize;
        bitmapText.tint = tint;
        bitmapText.alpha = alpha;
        bitmapText.rotation = rotation;

        bitmapText.style.fontFamily = fontFamily;
    }, [text, fontSize, tint, alpha, rotation, fontFamily]);

    return <pixiContainer ref={rootRef} x={x} y={y} />;
};

export default BitmapText;
