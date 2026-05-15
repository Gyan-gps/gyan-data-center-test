import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Loading,
} from "@/components/ui";
import { getCompanies } from "@/network";
import type { Company, CompanyFilters } from "@/network";

interface CompanyListProps {
  filters?: CompanyFilters;
  onSelect?: (company: Company) => void;
  showPagination?: boolean;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  filters = {},
  onSelect,
  showPagination = true,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCompanies = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCompanies({
          ...filters,
          page,
          limit: 20,
        });

        if (response.companies) {
          setCompanies(response.companies);
          setTotalPages(response.totalPages);
          setTotal(response.total);
          setCurrentPage(page);
        } else {
          setError("Failed to load companies");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load companies"
        );
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const filtersString = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    fetchCompanies(1);
  }, [fetchCompanies, filtersString]);

  const handlePageChange = (page: number) => {
    fetchCompanies(page);
  };

  const handleCompanyClick = (company: Company) => {
    if (onSelect) {
      onSelect(company);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error: {error}
            <button
              onClick={() => fetchCompanies(currentPage)}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {companies.length} of {total} companies
        </p>
        {showPagination && totalPages > 1 && (
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Companies grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div
            key={company.id}
            className={`cursor-pointer transition-all ${
              onSelect ? "hover:scale-105" : ""
            }`}
            onClick={() => handleCompanyClick(company)}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Assets:</span>
                    <div className="font-medium text-blue-600">
                      {company.assetCount.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-600">Contacts:</span>
                    <div className="font-medium text-green-600">
                      {company.contactCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {companies.length === 0 && !loading && (
        <Card>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              No companies found matching your criteria
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, currentPage - 2) + i;
            if (pageNum > totalPages) return null;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 border rounded ${
                  pageNum === currentPage
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
