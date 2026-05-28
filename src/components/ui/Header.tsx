import { useLayoutStore } from "../../store/useLayoutStore";
import PixiContainer from "../pixi/PixiContainer";
import PixiText from "../pixi/PixiText";

const Header = ({ text }: { text: string }) => {
  const { width, layoutMode } = useLayoutStore();
  const fontSize = layoutMode === "desktop" ? 60 : 32;
  const y = layoutMode === "desktop" ? 42 : 24;
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
