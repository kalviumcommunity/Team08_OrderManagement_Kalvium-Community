"use client";

export default function OrdersPagination({
  pagination,
  page,
  setPage,
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-3 mt-8">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >
        Previous
      </button>

      <span className="px-4 py-2">
        {page} / {pagination.totalPages}
      </span>

      <button
        disabled={page === pagination.totalPages}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
