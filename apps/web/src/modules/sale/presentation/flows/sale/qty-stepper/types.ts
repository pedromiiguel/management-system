export type TQtyStepperProps = {
  quantity: number;
  onStep: (delta: number) => void;
  onTyped: (quantity: number) => void;
  onDone: () => void;
};

export type TQtyStepperLayoutProps = {
  raw: string;
  canDecrease: boolean;
  onStep: (delta: number) => void;
  onRawChange: (raw: string) => void;
  onCommit: () => void;
};
