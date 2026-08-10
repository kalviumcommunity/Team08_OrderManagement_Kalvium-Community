"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Pagination({
  pagination,
  onPageChange,
}) {
  if (!pagination || pagination.totalCount === 0) {
    return null;
  }

  const {
    page,
    totalPages,
    totalCount,
    limit,
  } = pagination;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-t-0 rounded-b-2xl px-6 py-4">

      <p className="text-sm text-gray-500">
        Showing {start} - {end} of {totalCount} products
      </p>

      <div className="flex items-center gap-2">

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-9 h-9 rounded-lg border hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <ChevronLeft size={18} />
        </button>

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`w-9 h-9 rounded-lg border ${
              page === pageNumber
                ? "bg-indigo-600 text-white border-indigo-600"
                : "hover:bg-gray-100"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-9 h-9 rounded-lg border hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <ChevronRight size={18} />
        </button>

      </div>

    </div>
  );
}