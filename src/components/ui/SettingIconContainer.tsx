import { Assets } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import PixiNineSliceSprite from "../pixi/pixiNineSliceSprite";

const SettingIconContainer = () => {
    console.log(Assets.get("ui-sound-button-idle"), "uu")
    return (
        <PixiContainer x={0} y={0}>
            <PixiSprite
                texture={Assets.get("ui-sound-button-idle")}
                x={0}
                y={0}
                scale={0.2}
            />

            {/* <PixiNineSliceSprite
                texture="ui-sound-button-idle"
                x={0}
                y={0}
                width={50}
                height={50}
            />
            <PixiNineSliceSprite
                texture="ui-sound-button-idle"
                x={0}
                y={0}
                width={50}
                height={50}
            /> */}

        </PixiContainer>
    );
};

export default SettingIconContainer;