import { Application } from "@pixi/react";
import { useEffect, useState, useRef } from "react";
import { loadAssets } from "./utils/assets";
import { useLayoutStore } from "./store/useLayoutStore";
import PixiNavigation from "./navigation/PixiNavigation";
import ResolutionIndicator from "./components/ui/ResolutionIndicator";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const { updateLayout } = useLayoutStore();
  const resizeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    loadAssets().then(() => setLoaded(true));

    // Handle orientation changes immediately (no debounce)
    const handleOrientationChange = () => {
      // Clear any pending resize timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }

      // Update immediately for orientation changes
      updateLayout();

      // Use rAF for smooth transition
      requestAnimationFrame(() => {
        updateLayout();
      });
    };

    // Debounced resize handler for regular window resize
    const handleResize = () => {
      // Clear any pending resize timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Debounce resize to prevent excessive updates during drag-resize
      resizeTimeoutRef.current = window.setTimeout(() => {
        updateLayout();

        // Force a second update to ensure everything is rendered
        requestAnimationFrame(() => {
          updateLayout();
        });
      }, 50); // Reduced from 100ms to 50ms for faster response
    };

    // Initial layout update
    updateLayout();

    // Listen to both resize and orientationchange events
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [updateLayout]);

  return (
    <>
      <Application
        resizeTo={window}
        autoDensity={true}
        resolution={window.devicePixelRatio || 1}
      >
        {loaded && <PixiNavigation />}
      </Application>
      {/* <ResolutionIndicator /> */}
    </>
  );
}
