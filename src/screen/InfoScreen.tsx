import { FC, useState } from "react";
import { Graphics, Text } from "pixi.js";
import { extend } from "@pixi/react";
import PixiNineSliceSprite from "../components/pixi/pixiNineSliceSprite";
import { useNavigationStore } from "../store/useNavigationStore";
import PixiBitmapText from "../components/pixi/PixiBitmapText";
import InfoTab from "../components/ui/InfoTab";
import Table from "../components/ui/Table";
import { useLayoutStore } from "../store/useLayoutStore";
import { useSettingStore } from "../store/useSettingStore";

extend({ Graphics, Text });

interface InfoScreenProps {
  onOverlayClick?: () => void;
}

const InfoScreen: FC<InfoScreenProps> = ({
  onOverlayClick,
}: InfoScreenProps) => {
  const { setInfoVisible } = useSettingStore();
  const { width, height, layoutMode } = useLayoutStore();
  const [selectedTab, setSelectedTab] = useState<"payout" | "rules">("payout");
  const isMobilePortrait = layoutMode === "mobile-portrait";
  const isMobileLandscape = layoutMode === "mobile-landscape";

  const overlayWidth = isMobilePortrait
    ? width
    : isMobileLandscape
      ? Math.min(width * 0.66, 420)
      : Math.min(Math.max(width * 0.36, 420), 560);
  const overlayHeight = height;
  const panelX = isMobilePortrait ? 0 : width - overlayWidth;

  const closeSize = isMobilePortrait ? 28 : isMobileLandscape ? 24 : 30;
  const closeX = isMobilePortrait ? 16 : 18;
  const closeY = isMobilePortrait
    ? height * 0.02
    : isMobileLandscape
      ? height * 0.025
      : height * 0.03;

  const titleY = isMobilePortrait
    ? height * 0.045
    : isMobileLandscape
      ? height * 0.06
      : height * 0.05;
  const titleFontSize = isMobilePortrait ? 24 : isMobileLandscape ? 18 : 24;

  const infoTabY = isMobilePortrait
    ? height * 0.14
    : isMobileLandscape
      ? height * 0.2
      : height * 0.13;

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

      {/* Panel */}
      <pixiContainer x={panelX} y={0}>
        <PixiNineSliceSprite
          texture="ui-info-tab-bg"
          width={overlayWidth}
          height={overlayHeight}
          anchor={0}
          leftWidth={20}
          rightWidth={20}
          topHeight={20}
          bottomHeight={20}
        />

        {/* Close button */}
        <PixiNineSliceSprite
          texture="ui-x-button"
          width={closeSize}
          height={closeSize}
          x={closeX}
          y={closeY}
          leftWidth={0}
          rightWidth={0}
          topHeight={0}
          bottomHeight={0}
          eventMode="static"
          cursor="pointer"
          onPointerTap={() => {
            useNavigationStore.getState().hideOverlay();
            setInfoVisible(false);
          }}
        />
        <PixiBitmapText
          text="Info"
          x={overlayWidth / 2}
          y={titleY}
          anchor={0.5}
          fontSize={titleFontSize}
          tint={0xdfad54}
        />

        {/* Tabs */}
        <pixiContainer y={infoTabY}>
          <InfoTab
            width={overlayWidth}
            layoutMode={layoutMode}
            onTabChange={(tab) => {
              setSelectedTab(tab);
            }}
          />

          {selectedTab === "payout" &&
            (() => {
              const tableY = isMobilePortrait
                ? height * 0.1
                : isMobileLandscape
                  ? height * 0.13
                  : height * 0.07;
              const tableHeight =
                overlayHeight -
                infoTabY -
                tableY -
                (isMobileLandscape ? height * 0.03 : height * 0.04);

              return (
                <Table
                  x={overlayWidth * 0.05}
                  y={tableY}
                  width={overlayWidth * 0.9}
                  height={tableHeight}
                  headerFontSize={
                    isMobilePortrait ? 18 : isMobileLandscape ? 15 : 20
                  }
                  rowFontSize={
                    isMobilePortrait ? 15 : isMobileLandscape ? 12 : 16
                  }
                  rowHeight={
                    isMobilePortrait ? 34 : isMobileLandscape ? 30 : 36
                  }
                  columns={[
                    {
                      key: "bet",
                      title: "BET",
                      width: 0.27,
                    },
                    {
                      key: "limit",
                      title: "BET LIMITS",
                      width: 0.35,
                    },
                    {
                      key: "payout",
                      title: "PAYOUTS",
                      width: 0.35,
                    },
                  ]}
                  rows={[
                    {
                      bet: "Straight up",
                      limit: "$0.10 - 500",
                      payout: "29 → 499:1",
                    },
                    {
                      bet: "Split",
                      limit: "$0.10 - 500",
                      payout: "29 → 499:1",
                    },
                    {
                      bet: "Street",
                      limit: "$0.10 - 500",
                      payout: "29 → 499:1",
                    },
                    {
                      bet: "Corner",
                      limit: "$0.10 - 500",
                      payout: "29 → 499:1",
                    },
                    {
                      bet: "Line",
                      limit: "$0.10 - 500",
                      payout: "29 → 499:1",
                    },
                    {
                      bet: "Column",
                      limit: "$0.10 - 500",
                      payout: "29 → 499:1",
                    },
                    {
                      bet: "Dozen",
                      limit: "$0.10 - 500",
                      payout: "29 → 499:1",
                    },
                    {
                      bet: "Red/Black",
                      limit: "$0.10 - 500",
                      payout: "29 → 499:1",
                    },
                    {
                      bet: "Even/Odd",
                      limit: "$0.10 - 500",
                      payout: "29 → 499:1",
                    },
                    {
                      bet: "1-18/19-36",
                      limit: "$0.10 - 500",
                      payout: "29 → 499:1",
                    },
                  ]}
                />
              );
            })()}
        </pixiContainer>
      </pixiContainer>
    </pixiContainer>
  );
};

export default InfoScreen;
