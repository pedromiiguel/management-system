import { TagView } from './Tag.view';
import type { TagProps } from './Tag.types';

export function Tag(props: TagProps) {
  return <TagView {...props} />;
}
