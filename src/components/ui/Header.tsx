import { GAME_STATES } from "../../constants/gameState";
import { useGameStateStore } from "../../store/useGameStateStore";
import { useLayoutStore } from "../../store/useLayoutStore";
import PixiContainer from "../pixi/PixiContainer";
import PixiText from "../pixi/PixiText";

const Header = () => {
  const { width, layoutMode } = useLayoutStore();
  const { gameState } = useGameStateStore();
  const fontSize = layoutMode === "desktop" ? 60 : 32;
  const y = layoutMode === "desktop" ? 42 : 24;
  const text =
    GAME_STATES[gameState?.toUpperCase() as keyof typeof GAME_STATES] || "";

  return (
    <PixiContainer x={width / 2} y={y}>
      <PixiText
        text={text}
        x={0}
        y={0}
        gradient={[0xf1be31, 0xf2dc9f]}
        fontSize={fontSize}
        anchor={0.5}
      />
    </PixiContainer>
  );
};

export default Header;
