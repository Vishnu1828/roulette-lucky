import { useLayoutStore } from "../../store/useLayoutStore";
import PixiContainer from "../pixi/PixiContainer";
import PixiText from "../pixi/PixiText";

const Header = ({ text }: { text: string }) => {
    const { width, layoutMode } = useLayoutStore();
    const fontSize = layoutMode === "desktop" ? 60 : 32;
    const y = 32;
    return (
        <PixiContainer x={width / 2} y={y}>
            <PixiText text={text} x={0} y={0} gradient={[0xF1BE31, 0xF2DC9F]} fontSize={fontSize} anchor={0.5} />
        </PixiContainer>
    );
}

export default Header;