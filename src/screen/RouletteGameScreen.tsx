import Footer from "../components/ui/Footer";
import GameArea from "../components/ui/GameArea";
import Header from "../components/ui/Header";
import RouletteBackground from "../components/ui/RouletteBackground";

const RouletteGameScreen = () => {
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
