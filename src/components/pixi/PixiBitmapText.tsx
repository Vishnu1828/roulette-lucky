import { useEffect, useRef } from "react";
import { Container, BitmapText as PixiBitmapText } from "pixi.js";
import { useLayoutStore } from "../../store/useLayoutStore";
import { BITMAP_FONT_FAMILY } from "../../utils/assets";


type Props = {
    text: string;
    x?: number;
    y?: number;

    fontSize?: number;
    tint?: number;
    alpha?: number;
    rotation?: number;
    anchor?: number;
    fontFamily?: string;
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
    fontFamily
}: Props) => {
    const rootRef = useRef<Container>(null);
    const uiRef = useRef<any>(null);
    const { layoutMode } = useLayoutStore();
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const font = fontFamily ? fontFamily : layoutMode !== "desktop"
            ? BITMAP_FONT_FAMILY.roulette.mobile
            : BITMAP_FONT_FAMILY.roulette.desktop;


        const bitmapText = new PixiBitmapText({
            text,
            style: {
                fontFamily: font,
                fontSize,
                align: "center",
                lineHeight: fontSize * 1.2,
            },
        });
        bitmapText.anchor = anchor;
        root.addChild(bitmapText);

        uiRef.current = { bitmapText };

        return () => {
            root.removeChildren();
        };
    }, []);
    useEffect(() => {
        const ui = uiRef.current;
        if (!ui) return;

        const { bitmapText } = ui;



        bitmapText.text = text;
        bitmapText.style.fontSize = fontSize;
        bitmapText.tint = tint;
        bitmapText.alpha = alpha;
        bitmapText.rotation = rotation;

    }, [text, fontSize, tint, alpha, rotation]);

    return <pixiContainer ref={rootRef} x={x} y={y} />;
};

export default BitmapText;
