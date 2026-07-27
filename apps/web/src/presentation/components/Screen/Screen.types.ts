import type { ReactNode } from 'react';

export type ScreenProps = {
  title: string;
  topRight?: ReactNode;
  children: ReactNode;
};
