

import RouletteGameScreen from "../screen/RouletteGameScreen";
import { useNavigationStore } from "../store/useNavigationStore";


const PixiNavigation = () => {
    const { currentScreen } = useNavigationStore();

    return (
        <>
            {currentScreen === "game" && <RouletteGameScreen />}
        </>
    );
};

export default PixiNavigation;
