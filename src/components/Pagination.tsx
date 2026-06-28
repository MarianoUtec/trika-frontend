interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPage: (p: number) => void;
  onSizeChange?: (s: number) => void;
  pageSizes?: number[];
}

export function Pagination({ page, totalPages, totalElements, pageSize, onPage, onSizeChange, pageSizes = [10, 25, 50] }: PaginationProps) {
  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i;
    if (page <= 2) return i;
    if (page >= totalPages - 3) return totalPages - 5 + i;
    return page - 2 + i;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '20px' }}>
      <span className="pagination-info">
        Showing {start}–{end} of {totalElements} results
      </span>
      <div className="pagination">
        <button className="pagination-btn" disabled={page === 0} onClick={() => onPage(0)}>«</button>
        <button className="pagination-btn" disabled={page === 0} onClick={() => onPage(page - 1)}>‹</button>
        {pages.map(p => (
          <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>
            {p + 1}
          </button>
        ))}
        <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)}>›</button>
        <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => onPage(totalPages - 1)}>»</button>
      </div>
      {onSizeChange && (
        <select
          value={pageSize}
          onChange={e => onSizeChange(Number(e.target.value))}
          style={{ padding: '6px 10px', borderRadius: '6px', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '13px' }}
        >
          {pageSizes.map(s => <option key={s} value={s}>{s} / page</option>)}
        </select>
      )}
    </div>
  );
}
