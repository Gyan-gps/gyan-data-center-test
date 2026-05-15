import React from "react";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  hasMore?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
  loading = false,
  hasMore = true,
  className = "",
}) => {
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Don't render pagination if there's only one page or less
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={`bg-white border-t border-gray-200 py-4 px-4 sm:px-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Results Info */}
        <div className="text-sm text-gray-600">
          Showing page <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span> ({totalCount}{" "}
          total items)
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Show first page */}
            {currentPage > 3 && (
              <>
                <Button
                  variant={1 === currentPage ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={loading}
                  className="min-w-[2.5rem] px-3"
                >
                  1
                </Button>
                {currentPage > 4 && (
                  <span className="text-gray-400 px-1">...</span>
                )}
              </>
            )}

            {/* Show pages around current page */}
            {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i)
              .filter((page) => page >= 1 && page <= totalPages)
              .map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                  className="min-w-[2.5rem] px-3"
                >
                  {page}
                </Button>
              ))}

            {/* Show last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <span className="text-gray-400 px-1">...</span>
                )}
                <Button
                  variant={totalPages === currentPage ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={loading}
                  className="min-w-[2.5rem] px-3"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || !hasMore || loading}
            className="flex items-center space-x-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
