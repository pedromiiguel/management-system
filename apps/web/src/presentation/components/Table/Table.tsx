import { TableView } from './Table.view';
import type { TableProps } from './Table.types';

export function Table(props: TableProps) {
  return <TableView {...props} />;
}
