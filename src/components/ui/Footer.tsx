import PixiContainer from "../pixi/PixiContainer";
import BettingSettings from "./BettingSettings";

const Footer = () => {
    return (
        <PixiContainer x={0} y={0}>
            <BettingSettings />
        </PixiContainer>
    );
};

export default Footer;