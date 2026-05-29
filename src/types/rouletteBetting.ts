export type RouletteBetType =
  | "straight"
  | "split"
  | "corner"
  | "street"
  | "line"
  | "trio"
  | "column"
  | "color"
  | "range"
  | "parity"
  | "dozen";

export type RouletteBetZone = {
  spotKey: string;
  type: RouletteBetType;
  coveredNumbers: number[];
  payout: number;
  label: string;
  position: {
    x: number;
    y: number;
  };
  highlightShape:
  | {
    kind: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
  }
  | {
    kind: "diamond";
    x: number;
    y: number;
    width: number;
    height: number;
  }
  | {
    kind: "circle";
    x: number;
    y: number;
    radius: number;
  };
};

export type PlacedBet = {
  spotKey: string;
  type: RouletteBetType;
  coveredNumbers: number[];
  amount: number;
  chips: number[];
};
