import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/Button";
import { Loading } from "../ui/Loading";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getReports,
  requestReportAccess,
  sendReportInterest,
} from "@/network/datacenter/datacenter.api";
import { useAuthStore } from "@/store/authStore";
import type { Report, ReportFilters } from "@/network/datacenter/datacenter.types";
import { trackReportDownload, trackReportAccess } from "@/utils/ga";
import { Link } from "react-router";
import { GetAccessModal, BuyNowModal } from "./shared";
import { reportFilterInitialState } from "@/hooks/useSessionFilters";

interface ReportCardProps {
  report: Report;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSendingInterest, setIsSendingInterest] = useState(false);
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const handleGetAccess = () => {
    if (!user?.onDemandRemainingCredits || user.onDemandRemainingCredits <= 0) {
      toast.error(
        "You don't have enough On Demand Credits to request this report."
      );
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmRequest = async () => {
    if (!user?.email) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setIsRequesting(true);
      await requestReportAccess(user.email, report.id);

      // Track report access request
      trackReportAccess(report.id.toString(), report.title);

      toast.success("Your request has been submitted.", { duration: 5000 });

      // Update user's credit count locally
      if (user) {
        const updatedUser = {
          ...user,
          onDemandRemainingCredits: Math.max(
            0,
            user.onDemandRemainingCredits - 1
          ),
        };
        setUser(updatedUser);
      }

      // Refresh reports data to update subscription status
      queryClient.invalidateQueries({ queryKey: ["reports"] });

      setShowConfirmModal(false);
    } catch (error) {
      toast.error("Failed to request report access");
      console.error("Error requesting report access:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleBuyNow = () => {
    setShowBuyNowModal(true);
  };

  const handleConfirmInterest = async () => {
    if (!user?.email) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setIsSendingInterest(true);
      const response = await sendReportInterest(
        user.email,
        report.id,
        report.title
      );

      if (response.success) {
        toast.success(response.message, { duration: 7000 });
        setShowBuyNowModal(false);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to send interest notification");
      console.error("Error sending interest:", error);
    } finally {
      setIsSendingInterest(false);
    }
  };

  const hasCredits =
    user?.onDemandRemainingCredits && user.onDemandRemainingCredits > 0;
  const hasSampleUrl = report.sample_info?.sample_url;

  const handleSampleDownload = () => {
    if (hasSampleUrl) {
      // Track sample download
      if (user) {
        trackReportDownload(report.id.toString(), `${report.title} (Sample)`);
      }
      window.open(report.sample_info.sample_url, "_blank");
    }
  };

  const reportImage = report.major_players?.[0]?.value?.[0];

  return (
    <div className="bg-white border border-gray-200 rounded-lg relative hover:border-blue-500 transition-colors duration-200">
      {/* Title */}
      <div className="bg-[#e0effa] px-7 py-3 rounded-t-lg">
        <h3 className="text-sm md:text-lg font-medium text-[#191919] sm:pr-8 leading-tight">
          <Link
            className="hover:underline hover:text-blue-500"
            to={`${report.slug}`}
          >
            {report.title}
          </Link>
        </h3>
      </div>

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

      {/* Report Details */}
      <div className="space-y-1 text-sm px-7 py-3 flex justify-between">
        <div className="space-y-3 max-w-lg h-fit">
          {report.published_year && (
            <div>
              <span className="text-gray-600">Published Year: </span>
              <span className="font-medium text-[#5A5A5A]">
                {new Date(report.published_year).getFullYear()}
              </span>
            </div>
          )}
          {/* <div>
            <span className="text-gray-600">Study Period: </span>
            <span className="font-medium text-[#5A5A5A]">2020 - 2030</span>
          </div> */}
          <div>
            <span className="text-gray-600">Format: </span>
            <span className="font-medium text-[#5A5A5A]">PDF, Excel</span>
          </div>
          {report.countries_covered && (
            <div>
              <span className="text-gray-600">Countries Covered: </span>
              <span className="font-medium text-[#5A5A5A]">
                {report.countries_covered}
              </span>
            </div>
          )}
          {report.regions_covered && (
            <div>
              <span className="text-gray-600">Regions Covered: </span>
              <span className="font-medium text-[#5A5A5A]">
                {report.regions_covered}
              </span>
            </div>
          )}
        </div>
        {/* Report Image - Show on desktop on the right */}
        {reportImage && (
          <div className="hidden lg:block shrink-0 w-full max-w-44 h-fit bg-gray-100 rounded-lg overflow-hidden">
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

      {/* Action Buttons */}
      <div className="w-full flex flex-col-reverse sm:flex-row gap-3 justify-between items-center px-2 sm:px-7 py-4 border-t border-gray-200">
        <div>
          <strong className="text-sm text-gray-700">
            * 24-72 Hrs Delivery Time
          </strong>
        </div>
        <div className="flex gap-3 justify-end w-fit">
          {/* Request Sample Button */}
          {hasSampleUrl ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSampleDownload}
              className="px-4 py-2 border-blue-500 text-blue-500 hover:bg-blue-50 w-full whitespace-nowrap"
            >
              Download Sample
            </Button>
          ) : (
            <></>
          )}

          {/* Get Access or Buy Now Button */}
          {report.subscriptionStatus ? (
            // Show disabled button with subscription status
            <Button
              variant="secondary"
              size="sm"
              disabled={true}
              style={{ cursor: "default" }}
              className={`px-6 py-2 cursor-not-allowed flex-1/2 whitespace-nowrap ${
                report.subscriptionStatus === "Requested"
                  ? "bg-yellow-500 disabled:bg-yellow-500 text-white"
                  : report.subscriptionStatus === "Delivered"
                  ? "bg-green-500 disabled:bg-green-500 text-white"
                  : report.subscriptionStatus === "Rejected"
                  ? "bg-red-500 disabled:bg-red-500 text-white"
                  : "bg-gray-500 disabled:bg-gray-500 text-white"
              }`}
            >
              {report.subscriptionStatus}
            </Button>
          ) : hasCredits ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGetAccess}
              disabled={isRequesting}
              className="px-6 py-2 bg-[#189cde] hover:bg-[#457ffc] text-white disabled:bg-gray-400 w-full whitespace-nowrap"
            >
              {isRequesting ? "Processing..." : "Get Access"}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBuyNow}
              className="w-full sm:w-fit px-6 py-2 bg-[#189cde] hover:bg-[#457ffc] text-white whitespace-nowrap"
            >
              Buy Now
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <GetAccessModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        report={report}
        user={user}
        isRequesting={isRequesting}
        onConfirmRequest={handleConfirmRequest}
      />

      {/* Buy Now Interest Modal */}
      <BuyNowModal
        isOpen={showBuyNowModal}
        onClose={() => setShowBuyNowModal(false)}
        report={report}
        user={user}
        isSendingInterest={isSendingInterest}
        onConfirmInterest={handleConfirmInterest}
      />
    </div>
  );
};

interface ReportsGridProps {
  filters?: ReportFilters;
}

export const ReportsGrid: React.FC<ReportsGridProps> = ({ filters = reportFilterInitialState }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const { user } = useAuthStore();

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Use React Query for data fetching and caching
  const {
    data: reportsData,
    isLoading,
    error,
    isRefetching,
  } = useQuery({
    queryKey: [
      "reports",
      { ...filters, page: currentPage, limit, userEmail: user?.email  },
    ],
    queryFn: () =>
      getReports({
        ...filters,
        page: currentPage,
        limit,
        userEmail: user?.email || "",
      }),
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
  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "Failed to fetch reports"
    : null;

  if (isLoading || isRefetching) {
    return (
      <div className="flex justify-center items-center h-full">
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
              Showing page <span className="font-semibold">{currentPage}</span>{" "}
              of <span className="font-semibold">{reportsData.totalPages}</span>{" "}
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
                      variant={1 === currentPage ? "secondary" : "outline"}
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
                  .filter((page) => page >= 1 && page <= reportsData.totalPages)
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
                          ? "secondary"
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
