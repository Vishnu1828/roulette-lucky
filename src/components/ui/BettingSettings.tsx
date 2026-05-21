import PixiContainer from "../pixi/PixiContainer";
import { useLayoutStore } from "../../store/useLayoutStore";
import PixiNineSliceSprite from "../pixi/pixiNineSliceSprite";

const BettingSettings = () => {
    const { width, height, layoutMode } = useLayoutStore();
    const footerHeight = Math.max(48, height * 0.06);
    return (
        <PixiContainer x={0} y={height - footerHeight}>
            <PixiNineSliceSprite
                texture={layoutMode === "mobile-portrait" ? "ui-footer-mobile-portrait" : "ui-footer-desktop"}
                width={width}
                height={footerHeight}
            />
        </PixiContainer>
    );
};

export default BettingSettings;