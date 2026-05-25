import { useCallback, useMemo, useState } from "react";
import { Assets } from "pixi.js";
import PixiContainer from "../pixi/PixiContainer";
import PixiSprite from "../pixi/PixiSprite";
import { useLayoutStore } from "../../store/useLayoutStore";

type VolumeSliderProps = {
  min?: number;
  max?: number;
  value?: number;
  x?: number;
  y?: number;
  onChange?: (value: number) => void;
  zIndex?: number;
};

export function VolumeSlider({
  min = 0,
  max = 100,
  value = 60,
  x = 0,
  y = 0,
  onChange,
  zIndex,
}: VolumeSliderProps) {
  const { layoutMode } = useLayoutStore();
  const [currentValue, setCurrentValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  // Responsive dimensions based on layout mode
  const isDesktop = layoutMode === "desktop";
  const isMobileLandscape = layoutMode === "mobile-landscape";

  // Base texture dimensions (1080p): 325x59 bg, 237x7 bar, 30x30 knob, 27x20 icon
  const bgWidth = isDesktop ? 325 : isMobileLandscape ? 280 : 260;
  const bgHeight = isDesktop ? 59 : isMobileLandscape ? 52 : 48;
  const iconWidth = isDesktop ? 27 : 24;
  const iconHeight = isDesktop ? 20 : 18;
  const knobSize = isDesktop ? 30 : isMobileLandscape ? 26 : 24;
  const barHeight = isDesktop ? 7 : 6;

  // Spacing - measured from texture
  const leftPadding = isDesktop ? 31 : 26;
  const rightPadding = isDesktop ? 33 : 28;
  const iconToBarGap = isDesktop ? 17 : 14;

  // Calculate bar dimensions based on container
  const barWidth =
    bgWidth - leftPadding - iconWidth - iconToBarGap - rightPadding;

  // Positioning (relative to container center since bg anchor is 0.5)
  const bgLeft = -bgWidth / 2;
  const iconX = bgLeft + leftPadding + iconWidth / 2;
  const barStartX = iconX + iconWidth / 2 + iconToBarGap;

  const percentage = useMemo(() => {
    return (currentValue - min) / (max - min);
  }, [currentValue, min, max]);

  // Fill width based on percentage
  const fillWidth = Math.max(0, percentage * barWidth);

  // Knob position - at the end of the fill
  const knobX = barStartX + fillWidth;

  const updateValue = useCallback(
    (localX: number) => {
      // localX is relative to the container (background sprite is center-anchored)
      // Convert from center-anchored to left edge
      const absoluteX = localX + bgWidth / 2;
      const relativeToBar =
        absoluteX - (leftPadding + iconWidth + iconToBarGap);
      const clamped = Math.max(0, Math.min(barWidth, relativeToBar));
      const newValue = min + (clamped / barWidth) * (max - min);

      setCurrentValue(newValue);
      onChange?.(newValue);
    },
    [
      bgWidth,
      leftPadding,
      iconWidth,
      iconToBarGap,
      barWidth,
      min,
      max,
      onChange,
    ],
  );

  const handleKnobDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleKnobDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleContainerPointerMove = useCallback(
    (e: any) => {
      if (isDragging && e.getLocalPosition) {
        const pos = e.getLocalPosition(e.currentTarget);
        updateValue(pos.x);
      }
    },
    [isDragging, updateValue],
  );

  // Load textures
  const bgTexture = Assets.get("ui-sound-slider-bg");
  const iconTexture = Assets.get("ui-sound-icon");
  const barTexture = Assets.get("ui-sound-bar");
  const barFilledTexture = Assets.get("ui-sound-bar-filled");
  const knobTexture = Assets.get("ui-sound-knob");

  return (
    <PixiContainer
      x={x}
      y={y}
      interactive
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleKnobDragEnd}
      onPointerUpOutside={handleKnobDragEnd}
      zIndex={zIndex}
    >
      {/* Background - non-interactive */}
      <PixiSprite
        texture={bgTexture}
        width={bgWidth}
        height={bgHeight}
        anchor={0.5}
      />

      {/* Speaker icon */}
      <PixiSprite
        texture={iconTexture}
        x={iconX}
        y={0}
        width={iconWidth}
        height={iconHeight}
        anchor={0.5}
      />

      {/* Base bar (unfilled) - click to jump to position */}
      <PixiSprite
        texture={barTexture}
        x={barStartX}
        y={0}
        width={barWidth}
        height={barHeight}
        anchor={{ x: 0, y: 0.5 }}
        interactive
        cursor="pointer"
        eventMode="static"
        onPointerDown={(e: any) => {
          if (e.getLocalPosition && e.currentTarget.parent) {
            // Get position relative to container (parent)
            const pos = e.getLocalPosition(e.currentTarget.parent);
            updateValue(pos.x);
          }
        }}
      />

      {/* Filled bar */}
      {fillWidth > 0 && (
        <PixiSprite
          texture={barFilledTexture}
          x={barStartX}
          y={0}
          width={fillWidth}
          height={barHeight}
          anchor={{ x: 0, y: 0.5 }}
          interactive
          cursor="pointer"
          eventMode="static"
          onPointerDown={(e: any) => {
            if (e.getLocalPosition && e.currentTarget.parent) {
              // Get position relative to container (parent)
              const pos = e.getLocalPosition(e.currentTarget.parent);
              updateValue(pos.x);
            }
          }}
        />
      )}

      {/* Knob */}
      <PixiSprite
        texture={knobTexture}
        x={knobX}
        y={0}
        width={knobSize}
        height={knobSize}
        anchor={0.5}
        interactive
        cursor="pointer"
        eventMode="static"
        onPointerDown={handleKnobDragStart}
      />
    </PixiContainer>
  );
}
