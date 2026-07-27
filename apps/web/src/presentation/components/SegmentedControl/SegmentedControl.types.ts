export type SegmentedControlProps<T extends string> = {
  items: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
};
