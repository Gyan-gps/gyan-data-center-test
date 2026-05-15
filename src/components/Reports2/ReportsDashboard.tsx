import React, { useState, useEffect } from "react";
import { ReportsFilterSidebar } from "./ReportsFilterSidebar";
import { ReportsGrid } from "./ReportsGrid";
import { Button } from "@/components/ui";
import { FileText, Filter } from "lucide-react";
import type { ReportFilters } from "@/network/datacenter/datacenter.types";
import SidBarHOC from "../analytics/SidBarHOC";
import { reportFilterInitialState, useSessionFilters,MyreportFilterInitialState } from "@/hooks/useSessionFilters";
import { useAuthStore } from "@/store";

// Helper function to get the count of active filters
const getActiveReportFiltersCount = (filters: ReportFilters) => {
  let count = 0;
  if (filters.category) count++;
  if (filters.regions && filters.regions.length > 0) count++;
  if (filters.countries && filters.countries.length > 0) count++;
  if (filters.publishedYears && filters.publishedYears.length > 0) count++;
  if (filters.myAccessedReports) count++;
  if (filters.search && filters.search.trim()) count++;
  return count;
};

export const ReportsDashboard: React.FC = () => {

  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState<"catalogue" | "my">("catalogue");

  const { sessionFilters, setFiltersInSession } = useSessionFilters<ReportFilters>('reports');

  const [filters, setFilters] = useState<ReportFilters>(reportFilterInitialState);
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(reportFilterInitialState);
  const [myReportFilters, setMyReportFilters] = useState<ReportFilters>(MyreportFilterInitialState);
  useEffect(() => {
    if (sessionFilters) {
      setFilters(sessionFilters);
      setAppliedFilters(sessionFilters);
    }
  }, [sessionFilters]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const currentIsMobile = window.innerWidth < 1024;
      setIsMobile(currentIsMobile);

      // Close mobile filter when switching to desktop
      if (!currentIsMobile) {
        setIsFilterOpen(false);
      }
    };

    // Immediately check mobile status
    checkMobile();

    // Add event listeners
    window.addEventListener("resize", checkMobile);
    window.addEventListener("focus", checkMobile);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkMobile();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("focus", checkMobile);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Filter management functions
  const handleFiltersChange = (newFilters: ReportFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    const finalFilters = { ...filters, userEmail: user?.email || "" };

    // Add search to filters if present, or remove it if empty
    if (searchValue.trim()) {
      finalFilters.search = searchValue.trim();
    } else {
      finalFilters.search = '';
    }

    setAppliedFilters(finalFilters);
    setFiltersInSession(finalFilters);

    // Close mobile filter on apply
    if (isMobile) {
      setIsFilterOpen(false);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters: ReportFilters = { ...reportFilterInitialState, userEmail: user?.email || "" };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setFiltersInSession(clearedFilters);
    setSearchValue("");

    // Close mobile filter on clear
    if (isMobile) {
      setIsFilterOpen(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Filter Overlay — unchanged */}
      {isMobile && isFilterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-opacity-50 z-40"
            style={{ backdropFilter: "blur(1px)" }}
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Mobile Filter Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm">
            <ReportsFilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              isMobile={true}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:mb-2">
                <h1 className="text-md sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  Reports
                </h1>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed hidden sm:block">
                Access in-depth research reports and market analyses for deeper
                insights into data center infrastructure, trends, and growth
                opportunities worldwide.
              </p>
            </div>

            {/* Mobile Filter Button */}
            {isMobile && (
              <Button
                onClick={() => setIsFilterOpen(true)}
                className="p-3 text-black rounded-lg shadow-sm relative"
              >
                <Filter className="w-4 h-4" />
                {getActiveReportFiltersCount(appliedFilters) > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {getActiveReportFiltersCount(appliedFilters)}
                    </span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Filter Topbar — hidden on mobile/tablet */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
          <ReportsFilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            isMobile={false}
          />
        </div>
        <div className="px-4 lg:px-6 py-3">
          <div className="flex gap-2 bg-white border rounded-xl p-1 shadow-sm w-fit">

            <button
              onClick={() => setActiveTab("catalogue")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
        ${activeTab === "catalogue"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
               On Demand Reports
            </button>

            <button
              onClick={() => setActiveTab("my")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
        ${activeTab === "my"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
               My Reports
            </button>

          </div>
        </div>
        {activeTab === "catalogue" && (
          <ReportsGrid filters={appliedFilters} />
        )}

        {activeTab === "my" && (
          <ReportsGrid filters={{ ...myReportFilters }} />
        )}

      </div>
    </div>
  );
};