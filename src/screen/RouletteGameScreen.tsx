import { useEffect } from "react";
import Footer from "../components/ui/Footer";
import GameArea from "../components/ui/GameArea";
import Header from "../components/ui/Header";
import RouletteBackground from "../components/ui/RouletteBackground";
import { useWalletStore } from "../store/useWalletStore";
import { useNavigationStore } from "../store/useNavigationStore";
import { useBetStore } from "../store/useBetStore";

const RouletteGameScreen = () => {
  const { balance } = useWalletStore();
  const { showOverlay } = useNavigationStore();
  useEffect(() => {
    if (balance === 0) {
      showOverlay("balance");
    }
  }, [balance]);
  const { placedBets } = useBetStore()
  useEffect(() => { console.log(placedBets, "placeBet") }, [placedBets])
  return (
    <>
      <RouletteBackground />
      <Header />
      <GameArea />
      <Footer />
    </>
  );
};

export default RouletteGameScreen;
