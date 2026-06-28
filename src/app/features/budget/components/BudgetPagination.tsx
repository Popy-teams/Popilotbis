import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BudgetPaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Toujours afficher la barre (même une seule page) */
  alwaysShow?: boolean;
}

export function BudgetPagination({
  page,
  total,
  pageSize,
  onPageChange,
  className = '',
  alwaysShow = true,
}: BudgetPaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  if (!alwaysShow && total <= pageSize) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const nums: number[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
  }

  const items: (number | '…')[] = [];
  nums.forEach((n, idx) => {
    if (idx > 0 && n - nums[idx - 1] > 1) items.push('…');
    items.push(n);
  });

  return (
    <div className={`budget-pagination ${className}`}>
      <p className="budget-pagination__info">
        {from}–{to} sur {total} · page {page}/{pages}
      </p>
      <nav className="budget-pagination__nav" aria-label="Pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="budget-pagination__btn"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {items.map((item, i) =>
          item === '…' ? (
            <span key={`e-${i}`} className="budget-pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              disabled={pages === 1}
              className={`budget-pagination__page ${page === item ? 'is-active' : ''}`}
              aria-current={page === item ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="budget-pagination__btn"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
