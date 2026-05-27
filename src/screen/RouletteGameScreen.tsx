import { useEffect } from "react";
import Footer from "../components/ui/Footer";
import GameArea from "../components/ui/GameArea";
import Header from "../components/ui/Header";
import RouletteBackground from "../components/ui/RouletteBackground";
import { useWalletStore } from "../store/useWalletStore";
import { useNavigationStore } from "../store/useNavigationStore";

const RouletteGameScreen = () => {
  const { balance } = useWalletStore();
  const { showOverlay } = useNavigationStore();
  useEffect(() => {
    showOverlay("balance");
  }, [balance]);
  return (
    <>
      <RouletteBackground />
      <Header text="PLACE YOUR BET!" />
      <GameArea />
      <Footer />
    </>
  );
};

export default RouletteGameScreen;
