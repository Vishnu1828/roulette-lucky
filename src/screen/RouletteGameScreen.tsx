import Footer from "../components/ui/Footer";
import Header from "../components/ui/Header";
import RouletteBackground from "../components/ui/RouletteBackground";


const RouletteGameScreen = () => {

    return (
        <>
            <RouletteBackground />
            <Header text="PLACE YOUR BET!" />
            <Footer />
        </>
    );
};

export default RouletteGameScreen;