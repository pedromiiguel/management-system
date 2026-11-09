import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

export type TableRow = {
  key: string;
  cells: ReactNode[];
  highlight?: boolean;
  onClick?: () => void;
  testId?: string;
};

export function Table({
  cols,
  widths,
  rows,
  align,
  dense,
  emptyText,
}: {
  cols: ReactNode[];
  widths: string;
  rows: TableRow[];
  align?: (CSSProperties['textAlign'] | null)[];
  dense?: boolean;
  emptyText?: string;
}) {
  return (
    <div className={clsx('s-table', dense && 'is-dense')}>
      <div className="s-tr s-th" style={{ gridTemplateColumns: widths }}>
        {cols.map((c, i) => (
          <div key={i} style={{ textAlign: align?.[i] ?? 'left' }}>
            {c}
          </div>
        ))}
      </div>
      {rows.length === 0 && (
        <div className="s-dim" style={{ padding: '14px 12px', fontSize: 13 }}>
          {emptyText ?? 'Nenhum registro'}
        </div>
      )}
      {rows.map((row) => (
        <div
          key={row.key}
          data-testid={row.testId}
          className={clsx('s-tr', row.highlight && 'is-hl', row.onClick && 'is-selectable')}
          style={{ gridTemplateColumns: widths }}
          onClick={row.onClick}
        >
          {row.cells.map((c, j) => (
            <div key={j} style={{ textAlign: align?.[j] ?? 'left' }}>
              {c}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
