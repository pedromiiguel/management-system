import { CardView } from './Card.view';
import type { CardProps } from './Card.types';

export function Card(props: CardProps) {
  return <CardView {...props} />;
}
