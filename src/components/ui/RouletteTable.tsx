import { FederatedPointerEvent } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import TableCell from "./TableCell";

const RouletteTable = () => {
  const handleClick = (e: FederatedPointerEvent) => {
    console.log("yyy", e);
  };
  return (
    <PixiContainer>
      <TableCell
        number={0}
        x={200}
        y={100}
        cellWidth={55}
        cellHeight={35}
        selected={false}
        onPointerTap={handleClick}
      />
    </PixiContainer>
  );
};
export default RouletteTable;
