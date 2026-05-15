import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, Loading, Button } from "@/components/ui";
import { FilterSidebar } from "../home/FilterSidebar";
import { FilterTopbar } from "../home/FilterTopbar";
import {
  getAnalyticsV2Summary,
  getAnalyticsV2Charts,
  getAnalyticsV2TopOperators,
} from "@/network/datacenter/datacenter.api";
import type { AnalyticsFilters } from "@/network/datacenter/datacenter.types";
import type { FilterState } from "@/network";
import { ChartBar, Filter } from "lucide-react";
import { AnalyticsContent } from "./AnalyticsContent";
import SidBarHOC from "./SidBarHOC";
import { filterInitialState, useSessionFilters } from "@/hooks/useSessionFilters";

// Convert FilterState to AnalyticsFilters format for the API
const convertFilters = (filters: FilterState): AnalyticsFilters => {
  const analyticsFilters: AnalyticsFilters = {};
  if (filters.regions?.length) analyticsFilters.regions = filters.regions;
  if (filters.operators?.length) analyticsFilters.operators = filters.operators;
  if (filters.statuses?.length) analyticsFilters.status = filters.statuses;
  if (filters.tierLevels?.length) analyticsFilters.tiers = filters.tierLevels;
  if (filters.countries?.length) analyticsFilters.countries = filters.countries;
  if (filters.cities?.length) analyticsFilters.cities = filters.cities;
  if (filters.dcTypes?.length) analyticsFilters.dcTypes = filters.dcTypes;
  return analyticsFilters;
};

export const AnalyticsDashboard: React.FC = () => {
  const { sessionFilters, setFiltersInSession } = useSessionFilters<FilterState>('analytics');

  const [filters, setFilters] = useState<FilterState>(filterInitialState);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(filterInitialState);

  useEffect(() => {
    if (sessionFilters) {
      setFilters(sessionFilters);
      setAppliedFilters(sessionFilters);
    }
  }, [sessionFilters]);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const analyticsFilters = convertFilters(appliedFilters);

  // 3 parallel queries
  const summaryQuery = useQuery({
    queryKey: ["analyticsV2Summary", appliedFilters],
    queryFn: () => getAnalyticsV2Summary(analyticsFilters),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  console.log("Summary:", summaryQuery.data);

  const chartsQuery = useQuery({
    queryKey: ["analyticsV2Charts", appliedFilters],
    queryFn: () => getAnalyticsV2Charts(analyticsFilters),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const operatorsQuery = useQuery({
    queryKey: ["analyticsV2TopOperators", appliedFilters],
    queryFn: () => getAnalyticsV2TopOperators(analyticsFilters),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const loading = summaryQuery.isLoading || chartsQuery.isLoading || operatorsQuery.isLoading;
  const error = summaryQuery.error || chartsQuery.error || operatorsQuery.error;
  const hasAnyData = summaryQuery.data || chartsQuery.data || operatorsQuery.data;

  const errorMessage = error
    ? error instanceof Error ? error.message : "Failed to load analytics data"
    : null;

  const handleFiltersChange = (newFilters: FilterState) => setFilters(newFilters);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setFiltersInSession(filters);
    setIsMobileFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters(filterInitialState);
    setFiltersInSession(filterInitialState);
    setAppliedFilters(filterInitialState);
    setIsMobileFilterOpen(false);
  };

  if (error && !hasAnyData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-opacity-50" onClick={() => setIsMobileFilterOpen(false)} />
            <div className="relative">
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                isMobile={true}
                onClose={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>

        <div className="lg:ml-80">
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 relative"
                      onClick={() => setIsMobileFilterOpen(true)}
                    >
                      <Filter className="w-5 h-5" />
                    </button>
                    <h1 className="text-md sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <ChartBar className="w-5 h-5 sm:w-6 sm:h-6" />
                      Analytics Dashboard
                    </h1>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Manage and view analytics data across data centers
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center text-red-600">
                    Error: {errorMessage}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Filter Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-opacity-50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              isMobile={true}
              onClose={() => setIsMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {/* <SidBarHOC>
        <FilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isMobile={false}
        />
      </SidBarHOC> */}

      {/* Main Content */}
      <div className="w-full">
        <div>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:mb-2">
                  <h1 className="text-md sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ChartBar className="w-5 h-5 sm:w-6 sm:h-6" />
                    Analytics
                  </h1>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed hidden sm:block">
                  Transform data into intelligence with interactive dashboards
                  and visualizations. Monitor market trends, capacity
                  distribution, regional growth, and competitive landscapes at a
                  glance.
                </p>
              </div>

              <Button
                onClick={() => setIsMobileFilterOpen(true)}
                className="ml-4 p-3 text-black rounded-lg shadow-sm lg:hidden"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <FilterTopbar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          {loading && !hasAnyData ? (
            <div className="flex justify-center items-center h-full min-h-screen">
              <Loading />
            </div>
          ) : (
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 top-4 bg-opacity-10 flex items-center justify-center z-50">
                  <Loading size="lg" />
                </div>
              )}
              <div style={{ filter: loading ? "blur(4px)" : "none" }}>
                <AnalyticsContent
                  summary={summaryQuery.data}
                  charts={chartsQuery.data}
                  topOperators={operatorsQuery.data}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
