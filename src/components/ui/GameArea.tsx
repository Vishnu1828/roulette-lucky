import { useLayoutStore } from "../../store/useLayoutStore";
import PixiContainer from "../pixi/PixiContainer";
import WinningNumberContainer from "./WinningNumberContainer";

const GameArea = () => {
  const { width, height, layoutMode } = useLayoutStore();

  const isDesktop = layoutMode === "desktop";
  const isMobilePortrait = layoutMode === "mobile-portrait";
  const rightPadding = isDesktop ? 24 : 14;
  const winningPanelWidth = 50;
  const winningPanelHeight = isDesktop ? 300 : isMobilePortrait ? 250 : 230;

  const winningPanelX = width - rightPadding - winningPanelWidth / 2;
  const winningPanelY = height * 0.4;

  return (
    <PixiContainer x={0} y={0}>
      <WinningNumberContainer
        x={winningPanelX}
        y={winningPanelY}
        width={winningPanelWidth}
        height={winningPanelHeight}
      />
    </PixiContainer>
  );
};

export default GameArea;
