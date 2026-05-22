import InfoScreen from "../screen/InfoScreen";
import RouletteGameScreen from "../screen/RouletteGameScreen";
import { useNavigationStore } from "../store/useNavigationStore";

const PixiNavigation = () => {
  const { currentScreen, activeOverlay } = useNavigationStore();
  return (
    <>
      {currentScreen === "game" && <RouletteGameScreen />}
      {activeOverlay === "info" && <InfoScreen />}
    </>
  );
};

export default PixiNavigation;
