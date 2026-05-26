import { Assets, Graphics } from "pixi.js";
import PixiContainer from "../components/pixi/PixiContainer";
import { useLayoutStore } from "../store/useLayoutStore";
import PixiSprite from "../components/pixi/PixiSprite";
import GameAnimation from "../components/ui/GameAnimation";

type LoadingScreenProps = {
  loadingAssetsReady: boolean;
  errorMessage?: string | null;
};

const LoadingScreen = ({
  loadingAssetsReady,
  errorMessage,
}: LoadingScreenProps) => {
  const { width, height, layoutMode } = useLayoutStore();

  const bgTexture = Assets.get(
    layoutMode === "mobile-portrait"
      ? "loading-scenario-mobile-vertical"
      : "loading-scenario-desktop",
  );

  const hasTexture = !!bgTexture;
  const textureWidth = bgTexture?.width || 1;
  const textureHeight = bgTexture?.height || 1;
  const scale = Math.max(width / textureWidth, height / textureHeight);
  const scaledWidth = textureWidth * scale;
  const scaledHeight = textureHeight * scale;

  const statusText = errorMessage
    ? "Unable to load game assets"
    : loadingAssetsReady
      ? "Loading Roulette..."
      : "Preparing loading screen...";

  return (
    <PixiContainer x={0} y={0}>
      {!hasTexture && (
        <pixiGraphics
          draw={(g: Graphics) => {
            g.clear();
            g.rect(0, 0, width, height);
            g.fill({ color: 0x0b0f0d, alpha: 1 });
          }}
        />
      )}

      {hasTexture && (
        <PixiSprite
          texture={bgTexture}
          x={width / 2}
          y={height / 2}
          width={scaledWidth}
          height={scaledHeight}
          anchor={0.5}
        />
      )}

      {loadingAssetsReady && (
        <GameAnimation
          animationKeyword="game-logo-animation"
          x={width / 2}
          y={height / 2}
          width={layoutMode === "mobile-portrait" ? width * 0.7 : width * 0.3}
          height={
            layoutMode === "mobile-portrait" ? height * 0.2 : height * 0.3
          }
          loop={true}
          animationSpeed={0.55}
          restartKey={`loading-${statusText}`} // Restart animation when status text changes
        />
      )}
    </PixiContainer>
  );
};

export default LoadingScreen;
