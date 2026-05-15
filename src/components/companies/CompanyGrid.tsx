import React from "react";
import { Card, CardContent, Loading, Button } from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  MapPin,
  Globe,
  Building,
} from "lucide-react";
import type { ExtendedCompany } from "./types";

interface CompanyGridProps {
  companies: ExtendedCompany[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCompanySelect?: (company: ExtendedCompany) => void;
}

export const CompanyGrid: React.FC<CompanyGridProps> = ({
  companies,
  loading,
  error,
  onRetry,
  currentPage,
  totalPages,
  onPageChange,
  onCompanySelect,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const getCompanyTypeColor = (type?: string) => {
    switch (type) {
      case "operator":
        return "bg-blue-100 text-blue-800";
      case "tenant":
        return "bg-green-100 text-green-800";
      case "provider":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === "string" ? parseInt(num) : num;
    return isNaN(n) ? "0" : n.toLocaleString();
  };

  if (loading && companies.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loading />
      </div>
    );
  }

  if (error && companies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-2">Error</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (companies.length === 0 && !loading) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500">
        <Building2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 text-gray-300" />
        <h3 className="text-base sm:text-lg font-medium mb-1 text-gray-700">
          No companies found
        </h3>
        <p className="text-xs sm:text-sm">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 w-full overflow-hidden">
      {/* Company Cards - Single Column */}
      <div className="space-y-2 sm:space-y-3 w-full">
        {companies.map((company) => (
          <div
            key={company.id}
            className="cursor-pointer w-full"
            onClick={() => onCompanySelect?.(company)}
          >
            <Card className="hover:shadow-md transition-shadow border border-gray-200 w-full overflow-hidden">
            <CardContent className="w-full">
              <div className="space-y-2 sm:space-y-3 w-full">
                {/* Header Row - Company Name and Type */}
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="flex-1 min-w-0 max-w-[60%] sm:max-w-[70%]">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">
                      {company.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end max-w-[40%] sm:max-w-[30%]">
                    {company.type && (
                      <span
                        className={`px-1 sm:px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getCompanyTypeColor(
                          company.type
                        )}`}
                      >
                        {company.type}
                      </span>
                    )}
                    <span
                      className={`px-1 sm:px-1.5 py-0.5 rounded text-xs whitespace-nowrap ${
                        company.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {company.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Stats Grid - Responsive Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm w-full">
                  <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600 min-w-0">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">
                      {formatNumber(company.assetCount)} assets
                    </span>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600 min-w-0">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">
                      {formatNumber(company.contactCount)} contacts
                    </span>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600 min-w-0">
                    <Building className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">
                      {formatNumber(company.countryCount)} countries
                    </span>
                  </div>

                  {company.country && company.country.length > 0 && (
                    <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600 min-w-0">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">
                        {company.country.slice(0, 2).join(", ")}
                        {company.country.length > 2 && ` +${company.country.length - 2}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Website Link - Separate Row for better mobile display */}
                {company.website && (
                  <div className="pt-1">
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 sm:gap-1.5 text-blue-600 hover:text-blue-700 text-xs sm:text-sm min-w-0 w-fit"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span className="truncate">
                        {company.website.replace(/^https?:\/\//, "")}
                      </span>
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 w-full overflow-hidden">
          {/* Page Info - Always visible */}
          <div className="text-xs sm:text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center space-x-1 w-full overflow-x-auto px-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="flex items-center space-x-1 px-2 sm:px-3 shrink-0"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">Previous</span>
            </Button>

            <div className="flex items-center space-x-1 overflow-x-auto">
              {/* Show first page */}
              {currentPage > 2 && (
                <>
                  <Button
                    variant={
                      1 === currentPage
                        ? ("outline" as const)
                        : ("secondary" as const)
                    }
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={loading}
                    className="min-w-6 sm:min-w-8 h-6 sm:h-8 text-xs sm:text-sm shrink-0"
                  >
                    1
                  </Button>
                  {currentPage > 3 && (
                    <span className="text-gray-400 px-1 text-xs shrink-0">...</span>
                  )}
                </>
              )}

              {/* Show pages around current page - Fewer on mobile */}
              {Array.from({ length: isMobile ? 3 : 5 }, (_, i) => currentPage - Math.floor((isMobile ? 3 : 5) / 2) + i)
                .filter((page) => page >= 1 && page <= totalPages)
                .map((page) => (
                  <Button
                    key={page}
                    variant={
                      page === currentPage
                        ? ("outline" as const)
                        : ("secondary" as const)
                    }
                    size="sm"
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    className="min-w-6 sm:min-w-8 h-6 sm:h-8 text-xs sm:text-sm shrink-0"
                  >
                    {page}
                  </Button>
                ))}

              {/* Show last page */}
              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <span className="text-gray-400 px-1 text-xs shrink-0">...</span>
                  )}
                  <Button
                    variant={
                      totalPages === currentPage
                        ? ("outline" as const)
                        : ("secondary" as const)
                    }
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={loading}
                    className="min-w-6 sm:min-w-8 h-6 sm:h-8 text-xs sm:text-sm shrink-0"
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
              disabled={currentPage === totalPages || loading}
              className="flex items-center space-x-1 px-2 sm:px-3 shrink-0"
            >
              <span className="hidden sm:inline text-xs sm:text-sm">Next</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
