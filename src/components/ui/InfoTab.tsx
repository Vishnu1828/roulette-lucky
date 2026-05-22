import { useState } from "react";
import Button from "./Button";

type Props = {
  width: number;
  layoutMode: "mobile-portrait" | "mobile-landscape" | "desktop";
  onTabChange?: (tab: "payout" | "rules") => void;
};

const InfoTab = ({ width, layoutMode, onTabChange }: Props) => {
  const [activeTab, setActiveTab] = useState<"payout" | "rules">("payout");

  const tabTextureAspect = 242 / 47;

  const totalWidth =
    layoutMode === "mobile-portrait"
      ? width * 0.92
      : layoutMode === "mobile-landscape"
        ? width * 0.88
        : Math.min(width * 0.86, 460);

  const tabWidth = totalWidth / 2;
  const tabHeight = Math.max(28, Math.min(47, tabWidth / tabTextureAspect));

  const containerX = width / 2;
  const containerY = 0;

  const handleTabChange = (tab: "payout" | "rules") => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };
  const overlap = 0;
  return (
    <pixiContainer x={containerX} y={containerY}>
      <Button
        x={-(tabWidth / 2) + overlap / 2}
        y={0}
        width={tabWidth + overlap}
        height={tabHeight}
        text="PAYOUT"
        texture={
          activeTab === "payout"
            ? "ui-info-header-left-active"
            : "ui-info-header-left-inactive"
        }
        onClick={() => handleTabChange("payout")}
      />

      <Button
        x={tabWidth / 2 - overlap / 2}
        y={0}
        width={tabWidth + overlap}
        height={tabHeight}
        text="RULES"
        texture={
          activeTab === "rules"
            ? "ui-info-header-right-active"
            : "ui-info-header-right-inactive"
        }
        onClick={() => handleTabChange("rules")}
      />
    </pixiContainer>
  );
};

export default InfoTab;
