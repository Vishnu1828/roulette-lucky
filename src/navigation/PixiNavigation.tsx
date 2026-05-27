import BalanceWarningPopUp from "../screen/BalanceWarningPopUp";
import InactiveWarningPopUp from "../screen/InactiveWarningPopUp";
import InfoScreen from "../screen/InfoScreen";
import QuitWarningPopUp from "../screen/QuitWarningPopUp";
import RouletteGameScreen from "../screen/RouletteGameScreen";
import { useNavigationStore } from "../store/useNavigationStore";

const PixiNavigation = () => {
  const { currentScreen, activeOverlay } = useNavigationStore();

  return (
    <>
      {currentScreen === "game" && <RouletteGameScreen />}
      {activeOverlay === "info" && <InfoScreen />}
      {activeOverlay === "quit" && <QuitWarningPopUp />}
      {activeOverlay === "inactive" && <InactiveWarningPopUp />}
      {activeOverlay === "balance" && <BalanceWarningPopUp />}
    </>
  );
};

export default PixiNavigation;
