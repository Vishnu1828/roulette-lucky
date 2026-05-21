import { Application } from "@pixi/react";
import { useEffect, useState } from "react";
import { loadAssets } from "./utils/assets";
import { useLayoutStore } from "./store/useLayoutStore";
import PixiNavigation from "./navigation/PixiNavigation";

export default function App() {
    const [loaded, setLoaded] = useState(false);
    const { updateLayout } = useLayoutStore();

    useEffect(() => {
        loadAssets().then(() => setLoaded(true));

        window.addEventListener("resize", updateLayout);
        return () => window.removeEventListener("resize", updateLayout);
    }, [updateLayout]);



    return (
        <Application resizeTo={window}>
            {loaded && (
                <PixiNavigation />
            )}
        </Application>
    );
}
