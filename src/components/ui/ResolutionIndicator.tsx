import { useEffect, useState } from "react";
import { getCurrentTextureResolution } from "../../utils/assets";

/**
 * ResolutionIndicator - A debug component that displays the current texture resolution
 *
 * Usage:
 * ```tsx
 * import { ResolutionIndicator } from './components/ResolutionIndicator';
 *
 * // Add to your App or any component:
 * <ResolutionIndicator />
 * ```
 *
 * To enable in production, pass show={true}
 * By default, only shows in development mode
 */
export default function ResolutionIndicator({
  show = process.env.NODE_ENV === "development",
}: {
  show?: boolean;
}) {
  const [info, setInfo] = useState<{
    resolution: number;
    label: string;
    quality: string;
    screenSize: string;
    dpr: number;
  } | null>(null);

  useEffect(() => {
    const updateInfo = () => {
      const { resolution, label, quality } = getCurrentTextureResolution();
      setInfo({
        resolution,
        label,
        quality,
        screenSize: `${window.innerWidth}×${window.innerHeight}`,
        dpr: window.devicePixelRatio || 1,
      });
    };

    updateInfo();
    window.addEventListener("resize", updateInfo);
    return () => window.removeEventListener("resize", updateInfo);
  }, []);

  if (!show || !info) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 10000,
        pointerEvents: "none",
        border:
          info.resolution === 2 ? "2px solid #4CAF50" : "2px solid #2196F3",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
        {info.label} Textures {info.resolution === 2 ? "🟢" : "🔵"}
      </div>
      <div style={{ fontSize: "10px", opacity: 0.8 }}>
        Quality: {info.quality}
        <br />
        Screen: {info.screenSize}
        <br />
        DPR: {info.dpr}x
      </div>
    </div>
  );
}
