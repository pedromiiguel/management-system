import type { TagProps } from './Tag.types';

export function TagView({ children, tone = 'ok' }: TagProps) {
  return <span className={`s-tag is-${tone}`}>{children}</span>;
}
