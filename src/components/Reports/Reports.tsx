import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// import { Bookmark } from "lucide-react";
import { Button } from "../ui/Button";
import { Loading } from "../ui/Loading";
// import { Badge } from "../ui/Badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getReports,
  downloadReport,
} from "@/network/datacenter/datacenter.api";
import type { Report } from "@/network/datacenter/datacenter.types";
import { Download } from "lucide-react";
import { trackReportDownload, trackReportAccess } from "@/utils/ga";
import { useAuthStore } from "@/store/authStore";
import { reportFilterInitialState } from "@/hooks/useSessionFilters";

interface ReportCardProps {
  report: Report;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuthStore();

  const publishedDate = new Date(report.published_year).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const handleGetAccess = async () => {
    try {
      setIsDownloading(true);
      
      // Track report access request
      if (user) {
        trackReportAccess(report.id.toString(), report.title);
      }
      
      const downloadData = await downloadReport(report.id);
      if (downloadData.download_url) {
        // Track successful report download
        if (user) {
          trackReportDownload(report.id.toString(), report.title);
        }
        window.open(downloadData.download_url, "_blank");
      }
    } catch {
      // Error is handled silently for better UX
    } finally {
      setIsDownloading(false);
    }
  };

  // Get the report image from major_players
  const reportImage = report.major_players?.[0]?.value?.[0];

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row-reverse lg:items-start lg:justify-between gap-4 lg:gap-6">
          {/* Content Section */}
          <div className="flex-1 order-1 lg:order-1">
            <h3 className="text-md sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4 leading-tight">
              <a
                className="hover:underline hover:text-blue-500"
                href={`https://www.mordorintelligence.com/industry-reports/${report.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {report.title}
              </a>
            </h3>

            {/* Report Image - Show on mobile after title */}
            {reportImage && (
              <div className="lg:hidden w-full max-w-72 h-40 bg-gray-100 rounded-lg overflow-hidden mx-auto mb-4">
                <img
                  src={reportImage.url}
                  alt={reportImage.alt_text || report.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Report Details Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm text-gray-600 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-gray-700 mb-1 sm:mb-0 sm:mr-2">
                  Published:
                </span>
                <span>{publishedDate}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-gray-700 mb-1 sm:mb-0 sm:mr-2">
                  Study Period:
                </span>
                <span>2017 - 2030</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-gray-700 mb-1 sm:mb-0 sm:mr-2">
                  Format:
                </span>
                <span>PDF, Excel</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-gray-700 mb-1 sm:mb-0 sm:mr-2">
                  Delivery:
                </span>
                <span>24-72 Hrs</span>
              </div>
              {report.regions_covered && (
                <div className="sm:col-span-2 flex flex-col sm:flex-row">
                  <span className="font-medium text-gray-700 mb-1 sm:mb-0 sm:mr-2">
                    Regions:
                  </span>
                  <span className="break-words">{report.regions_covered}</span>
                </div>
              )}
              {report.countries_covered && (
                <div className="sm:col-span-2 flex flex-col sm:flex-row">
                  <span className="font-medium text-gray-700 mb-1 sm:mb-0 sm:mr-2">
                    Countries:
                  </span>
                  <span className="break-words">
                    {report.countries_covered}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Report Image - Show on desktop on the right */}
          {reportImage && (
            <div className="hidden lg:block shrink-0 w-full max-w-72 h-40 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={reportImage.url}
                alt={reportImage.alt_text || report.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 gap-3 sm:gap-0">
          <div className="text-xs text-gray-500">Research Report</div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGetAccess}
            disabled={isDownloading}
            className="bg-[#007ea7] hover:bg-[#006a91] disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto px-4 py-2"
          >
            <Download className={`w-4 h-4 mr-2 ${isDownloading ? "animate-bounce" : ""}`} />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Reports: React.FC = () => {

  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Use React Query for data fetching and caching
  const {
    data: reportsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['reports', { page: currentPage, limit }],
    queryFn: () => getReports({...reportFilterInitialState, userEmail: user?.email || ''}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Extract reports from the paginated response
  const reports = reportsData?.reports || [];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Convert error to string for display
  const errorMessage = error ? (error instanceof Error ? error.message : 'Failed to fetch reports') : null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-opacity-10 flex items-center justify-center z-50">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <div className="text-red-600 mb-2 text-sm sm:text-base">
            Failed to load reports. Please try again.
          </div>
          <div className="text-xs sm:text-sm text-red-400 break-words">
            Error: {errorMessage}
          </div>
        </div>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="text-center text-gray-500 text-sm sm:text-base">
          No reports available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Reports Grid */}
      <div className="space-y-3 sm:space-y-4">
        {reports.map((report: Report) => (
          <ReportCard key={report._id} report={report} />
        ))}
      </div>

      {/* Pagination */}
      {reportsData && reportsData.totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results Info */}
            <div className="text-sm text-gray-600">
              Showing page{" "}
              <span className="font-semibold">{currentPage}</span> of{" "}
              <span className="font-semibold">
                {reportsData.totalPages}
              </span>{" "}
              ({reportsData.total} total reports)
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
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
                      variant={1 === currentPage ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={isLoading}
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
                  .filter(
                    (page) =>
                      page >= 1 &&
                      page <= reportsData.totalPages
                  )
                  .map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className="min-w-[2.5rem] px-3"
                    >
                      {page}
                    </Button>
                  ))}

                {/* Show last page */}
                {currentPage < reportsData.totalPages - 2 && (
                  <>
                    {currentPage < reportsData.totalPages - 3 && (
                      <span className="text-gray-400 px-1">...</span>
                    )}
                    <Button
                      variant={
                        reportsData.totalPages === currentPage
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(reportsData.totalPages)}
                      disabled={isLoading}
                      className="min-w-[2.5rem] px-3"
                    >
                      {reportsData.totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= reportsData.totalPages || isLoading}
                className="flex items-center space-x-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
