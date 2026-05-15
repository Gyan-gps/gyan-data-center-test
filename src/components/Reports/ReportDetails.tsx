import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Report } from "@/network/datacenter/datacenter.types";
import {
  requestReportAccess,
  sendReportInterest,
} from "@/network/datacenter/datacenter.api";
import { useAuthStore } from "@/store/authStore";
import { Button, Loading } from "../ui";
import { useNavigate } from "react-router";
import Snippet from "./Snippet";
import { ChevronLeft } from "lucide-react";
import { GetAccessModal, BuyNowModal } from "./shared";

interface ReportDetailsProps {
  report?: Report;
  loading?: boolean;
  error?: string;
  snippetData?: { data: string; template: string };
}

const bgImage =
  "https://subscription-public.s3.us-west-2.amazonaws.com/static-assets/images/Banner.svg";

export const ReportDetails: React.FC<ReportDetailsProps> = ({
  report,
  loading,
  error,
  snippetData,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSendingInterest, setIsSendingInterest] = useState(false);
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const navigate = useNavigate();

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
    if (!user?.email || !report) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setIsRequesting(true);
      await requestReportAccess(user.email, report.id);

      toast.success("Your request has been submitted.", { duration: 5000 });

      // Update user's credit count locally
      if (user) {
        setUser({
          ...user,
          onDemandRemainingCredits: user.onDemandRemainingCredits - 1,
        });
      }

      // Refresh reports data to update subscription status
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", report.slug] });

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
    if (!user?.email || !report) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setIsSendingInterest(true);
      await sendReportInterest(user.email, report.id, report.title);

      toast.success("Thank you for your interest! We will contact you soon.", {
        duration: 5000,
      });
      setShowBuyNowModal(false);
    } catch (error) {
      toast.error("Failed to send interest");
      console.error("Error sending report interest:", error);
    } finally {
      setIsSendingInterest(false);
    }
  };

  const hasCredits =
    user?.onDemandRemainingCredits && user.onDemandRemainingCredits > 0;
  const hasSampleUrl = report?.sample_info?.sample_url;

  const handleSampleDownload = () => {
    if (hasSampleUrl) {
      window.open(report.sample_info.sample_url, "_blank");
      toast.success("Sample report is downloading...");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading text="Loading report details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading report
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-yellow-800">
            Report not found
          </h3>
          <p className="mt-2 text-sm text-yellow-700">
            The requested report could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Report Header Section */}
      <div
        className="bg-gradient-to-r bg-[#e8f1fd] rounded-lg p-4 sm:p-8"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <button
          onClick={() => navigate("/reports")}
          className="flex items-center text-[#189cde] hover:underline mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="text-sm text-gray-500">Reports</span>
        </button>
        <div className="space-y-6">
          {/* Title and Basic Info */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 max-w-2xl">
              {report.title.toUpperCase()}
            </h1>
            <div className="flex flex-col gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Published On:</span>{" "}
                {new Date(report.published_year).toLocaleDateString()}
              </div>
              {report.regions_covered && (
                <div>
                  <span className="font-medium">Regions Covered:</span>{" "}
                  {report.regions_covered}
                </div>
              )}
              {report.countries_covered && (
                <div className="md:col-span-2">
                  <span className="font-medium">Countries Covered:</span>{" "}
                  {report.countries_covered}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
      <div className="w-full flex flex-col-reverse sm:flex-row gap-3 justify-between items-center py-4">
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
          {report.subscribed === "yes" ? (
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
          {report.subscribed === "yes" &&
            report.report_expiry &&
              new Date(report.report_expiry) < new Date() ? (
              <p className="text-sm font-medium text-red-600 mt-2">
                Report is expired
              </p>
            ) : null}
        </div>
      </div>

      {/* Snippet Section */}
      <div className="border-gray-200 rounded-lg">
        {snippetData && <Snippet snippetData={snippetData} />}
      </div>

      {/* Confirmation Modals */}
      <GetAccessModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        report={report}
        user={user}
        isRequesting={isRequesting}
        onConfirmRequest={handleConfirmRequest}
      />

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
