"use client";

/**
 * OrdersPagination Component
 * Simple page navigation bar for paginated order lists.
 * 
 * @param {object} pagination - Object containing totalPages metadata
 * @param {number} page - Current active page number
 * @param {Function} setPage - Page number updater callback
 */
export default function OrdersPagination({
  pagination,
  page,
  setPage,
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-3 mt-8">
      {/* Previous Page */}
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
      >
        Previous
      </button>

      {/* Page Indicator */}
      <span className="px-4 py-2 font-medium text-gray-700">
        {page} / {pagination.totalPages}
      </span>

      {/* Next Page */}
      <button
        disabled={page === pagination.totalPages}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
      >
        Next
      </button>
    </div>
  );
}
