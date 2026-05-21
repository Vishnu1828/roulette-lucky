import RouletteBackground from "../components/ui/RouletteBackground";
import { useLayoutStore } from "../store/useLayoutStore";

const RouletteGameScreen = () => {
    const { width, height, layoutMode } = useLayoutStore();

    return (
        <>
            <RouletteBackground width={width} height={height} />
        </>
    );
};

export default RouletteGameScreen;