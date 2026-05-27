import { FC, useState } from "react";
import { Assets, Graphics, Text } from "pixi.js";
import { extend } from "@pixi/react";
import PixiBitmapText from "../pixi/PixiBitmapText";
import Button from "./Button";
import { useLayoutStore } from "../../store/useLayoutStore";

extend({ Graphics, Text });

type PopupButton = {
  label: string;
  onClick?: () => void;
  texture?: string;
};

interface ModalPopUpProps {
  title?: string;
  description?: string;

  titleTint?: number;
  descriptionTint?: number;

  buttons: PopupButton[];

  onOverlayClick?: () => void;
  titleSize?: number;
  descriptionSize?: number;
}

const ModalPopUp: FC<ModalPopUpProps> = ({
  title,
  description,

  titleTint = 0xdfad54,
  descriptionTint = 0xffffff,
  titleSize = 24,
  descriptionSize = 16,
  buttons,

  onOverlayClick,
}) => {
  const { width, height } = useLayoutStore();
  const [pressedButtonIndex, setPressedButtonIndex] = useState<number | null>(
    null,
  );
  const popupWidth = Math.min(width, 350);
  const popupHeight = Math.min(height * 0.5, 180);

  const centerX = width / 2;
  const centerY = height / 2;

  const isSingleButton = buttons.length === 1;

  const buttonWidth = isSingleButton ? popupWidth * 0.8 : popupWidth * 0.45;

  const buttonHeight = popupHeight * 0.2;

  const buttonGap = popupWidth * 0.04;

  return (
    <pixiContainer>
      {/* Overlay */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.rect(0, 0, width, height);
          g.fill({
            color: 0x000000,
            alpha: 0.7,
          });
        }}
        interactive={true}
        onPointerTap={onOverlayClick}
      />

      {/* Popup */}
      <pixiContainer x={centerX - popupWidth / 2} y={centerY - popupHeight / 2}>
        <pixiSprite
          texture={Assets.get("ui-popup-window")}
          width={popupWidth}
          height={popupHeight}
        />

        {/* Title */}
        {title && (
          <PixiBitmapText
            text={title}
            x={popupWidth / 2}
            y={popupHeight * 0.32}
            anchor={0.5}
            fontSize={titleSize}
            tint={titleTint}
          />
        )}

        {/* Description */}
        {description && (
          <PixiBitmapText
            text={description}
            x={popupWidth / 2}
            y={title ? popupHeight * 0.48 : popupHeight * 0.4}
            anchor={0.5}
            fontSize={descriptionSize}
            tint={descriptionTint}
          />
        )}

        {/* Buttons */}
        {buttons.map((button, index) => {
          const x = isSingleButton
            ? popupWidth / 2
            : popupWidth / 2 -
              buttonWidth / 2 -
              buttonGap / 2 +
              index * (buttonWidth + buttonGap);

          return (
            <Button
              key={button.label}
              x={x}
              y={popupHeight * 0.8}
              width={buttonWidth}
              height={buttonHeight}
              text={button.label}
              texture={
                pressedButtonIndex === index
                  ? "ui-popup-button-pressed"
                  : "ui-popup-button-idle"
              }
              horizontalSlice={0}
              verticalSlice={0}
              onClick={() => {
                button.onClick?.();
                setPressedButtonIndex(null);
              }}
              onPointerDown={() => setPressedButtonIndex(index)}
            />
          );
        })}
      </pixiContainer>
    </pixiContainer>
  );
};

export default ModalPopUp;
