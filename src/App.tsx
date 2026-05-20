import { Application } from "@pixi/react";
import { useEffect, useState } from "react";
import { BITMAP_FONT_FAMILY, loadAssets } from "./utils/assets";
import RouletteBackground from "./components/RouletteBackground";
import BitmapText from "./components/BitmapText";
import GameAnimation from "./components/GameAnimation";

function getViewportSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
}

export default function App() {
    const [loaded, setLoaded] = useState(false);
    const [viewport, setViewport] = useState(getViewportSize);

    useEffect(() => {
        loadAssets().then(() => setLoaded(true));

        const resize = () => {
            setViewport(getViewportSize());
        };

        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    const isMobile = viewport.width <= 768;
    const rouletteFontFamily = isMobile
        ? BITMAP_FONT_FAMILY.roulette.mobile
        : BITMAP_FONT_FAMILY.roulette.desktop;

    return (
        <Application
            resizeTo={window}
        >
            {loaded && (
                <>
                    <RouletteBackground
                        width={viewport.width}
                        height={viewport.height}
                    />
                    <BitmapText
                        text="HELLO WORLD"
                        x={viewport.width / 2}
                        y={viewport.height / 2}
                        fontFamily={rouletteFontFamily}
                        fontSize={54}

                    />
                    <GameAnimation
                        animationKeyword="animation-x5000-multiplier-entrance"
                        x={viewport.width / 2}
                        y={viewport.height / 2}
                        width={100}
                        height={100}
                        alpha={1}
                        loop={true}
                        animationSpeed={0.62}
                    />
                </>
            )}
        </Application>
    );
}
