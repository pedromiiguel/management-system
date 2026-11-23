import { Button } from './Button';

/** Anterior/próxima de uma listagem paginada da API (`Paginated`). */
export function Pager({
  page,
  total,
  perPage,
  onChange,
}: {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}) {
  return (
    <span className="flex gap-1.5 items-center">
      <Button ghost disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹
      </Button>
      <span className="s-dim text-[13px]">página {page}</span>
      <Button ghost disabled={total <= page * perPage} onClick={() => onChange(page + 1)}>
        ›
      </Button>
    </span>
  );
}
