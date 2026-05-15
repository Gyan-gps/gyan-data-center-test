import React, { useState, useEffect, useMemo } from "react";
import { NewsItem } from "./NewsItem";
import { TrendMetric } from "./TrendMetric";
import { SignalsFilterSidebar } from "./SignalsFilterSidebar";
import { Button, Loading, Pagination } from "@/components/ui";
import {
  fetchNewsSignalDashboard,
  fetchNewsArticles,
} from "@/network/signals/signals.api";
import {
  Filter,
  Newspaper,
  Presentation,
  SignpostBig,
  ChartNoAxesColumn,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import {
  signalsFilterInitialState,
  useSessionFilters,
  type TSignalsFilterState,
} from "@/hooks/useSessionFilters";
import type {
  GetNewsResponse,
  NewsSignalDashboardResponse,
  NewsStreamItem,
} from "@/network/signals/signals.types";
import type { NewsArticle } from "@/network/news/news.types";
import SidBarHOC from "../analytics/SidBarHOC";
import SignalCarousal from "./SignalCarousal";

// Helper function to validate trend values
const getValidTrend = (trend: string | undefined): "up" | "down" | "stable" => {
  if (trend === "up" || trend === "down" || trend === "stable") {
    return trend;
  }
  return "stable";
};

// Helper function to get the count of active signals filters
const getActiveSignalsFiltersCount = (filters: TSignalsFilterState) => {
  let count = 0;
  if (filters.searchQuery?.trim()) count++;
  if (filters.region) count++;
  if (filters.impact) count++;
  if (filters.categories?.length) count++;
  if (filters.subCategories?.length) count++;
  if (filters.startDate) count++;
  if (filters.endDate) count++;
  return count;
};

export const SignalsDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const [isUIRefreshing, setIsUIRefreshing] = useState(false);
  const { sessionFilters, setFiltersInSession } =
    useSessionFilters<TSignalsFilterState>("signals");

  const [filters, setFilters] = useState<TSignalsFilterState>(
    signalsFilterInitialState
  );
  const [tempFilters, setTempFilters] = useState<TSignalsFilterState>(filters);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount] = useState(20);

  useEffect(() => {
    if (sessionFilters) {
      setFilters(sessionFilters);
      setTempFilters(sessionFilters);
    }
  }, [sessionFilters]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  // Query for dashboard data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery<NewsSignalDashboardResponse>({
    queryKey: ["signals-dashboard"],
    queryFn: fetchNewsSignalDashboard,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Query for news articles with pagination and filters
  const { data: articlesData, isLoading: articlesLoading } =
    useQuery<GetNewsResponse>({
      queryKey: ["articles", currentPage, pageCount, filters],
      queryFn: () =>
        fetchNewsArticles({
          page: currentPage,
          count: pageCount,
          searchQuery: filters?.searchQuery || undefined,
          region: filters?.region || undefined,
          impact: filters?.impact || undefined,
          categories: filters?.categories || undefined,
          subCategories: filters?.subCategories || undefined,
          startDate: filters?.startDate || undefined,
          endDate: filters?.endDate || undefined,
        }),
      staleTime: 2 * 60 * 1000,
    });

  // Use newsStream from dashboard and filter based on search query matching LLM_headline or summary
  const newsStream = useMemo(() => {
    const rawNewsStream = (
      Array.isArray(articlesData?.articles)
        ? articlesData.articles
        : Array.isArray(dashboardData?.newsStream?.news)
        ? dashboardData.newsStream.news
        : []
    ) as (NewsStreamItem | NewsArticle)[];

    if (!filters.searchQuery?.trim()) {
      return rawNewsStream;
    }

    const searchTerm = filters.searchQuery.toLowerCase().trim();
    return rawNewsStream.filter((item) => {
      const headline = (item.LLM_headline || "").toLowerCase();
      const summary = (item.summary || "").toLowerCase();
      return headline.includes(searchTerm) || summary.includes(searchTerm);
    });
  }, [
    articlesData?.articles,
    dashboardData?.newsStream?.news,
    filters.searchQuery,
  ]);

  const currentPageFromApi =
    articlesData?.page || dashboardData?.newsStream?.page || currentPage;
  const totalArticles =
    articlesData?.totalCount || dashboardData?.newsStream?.totalCount || 0;
  const perPage = articlesData
    ? pageCount
    : dashboardData?.newsStream?.count || pageCount;
  const hasMore =
    articlesData?.hasMore ?? dashboardData?.newsStream?.hasMore ?? false;
  const handleApplyFilters = (appliedFilters: TSignalsFilterState) => {
    setIsUIRefreshing(true); // show loader
    setFilters(appliedFilters);
    setFiltersInSession(appliedFilters);
    setCurrentPage(1);
    setShowFiltersMobile(false);
    setIsUIRefreshing(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = signalsFilterInitialState;
    setFiltersInSession(clearedFilters);
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
    setCurrentPage(1);
  };

  const toggleMobileFilters = () => {
    setShowFiltersMobile(!showFiltersMobile);
  };

  const handlePageChange = (newPage: number) => {
    setIsUIRefreshing(true);
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsUIRefreshing(false);
  };
  // console.log("dashboard data",dashboardData);

  const metrics = [
    {
      label: "News Covered",
      value: dashboardData?.trendDashboard?.articlesIndexed || 0,
      trend: "up" as const, // Show trending up for news coverage
    },
    {
      label: "Most Mentioned Operator",
      value:
        dashboardData?.trendDashboard?.mostMentionedOperator?.companyName ||
        "N/A",
      trend: "up" as const, // Show trending up for popular operator
      companyId:
        dashboardData?.trendDashboard?.mostMentionedOperator?.companyId,
    },
    {
      label: "Hottest Theme",
      value: dashboardData?.trendDashboard?.hottestTheme || "N/A",
      trend: "up" as const, // Show trending up for hot themes
    },
    {
      label: `Region (${
        dashboardData?.trendDashboard?.regionMomentum?.region || "N/A"
      })`,
      value: dashboardData?.trendDashboard?.regionMomentum?.region || "N/A",
      trend: getValidTrend(
        dashboardData?.trendDashboard?.regionMomentum?.trend
      ),
    },
  ];

  if (dashboardError) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-destructive font-medium">
          Failed to fetch dashboard data
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-200px)]">
      {/* Mobile Filter Sidebar — unchanged */}
      {showFiltersMobile && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
            onClick={toggleMobileFilters}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 shadow-lg overflow-y-auto">
            <SignalsFilterSidebar
              filters={tempFilters}
              filterOptions={dashboardData?.filters ?? { regions: [], impacts: [] }}
              onFiltersChange={setTempFilters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              isMobile={true}
              onClose={toggleMobileFilters}
              myWatchList={dashboardData?.myWatchlist || []}
              loading={dashboardLoading}
            />
          </div>
        </>
      )}

      {/* Desktop Watchlist Sidebar — in SidBarHOC, watchlist only */}
      <div className="hidden lg:block">
        <SidBarHOC>
          <SignalsFilterSidebar
            filters={tempFilters}
            filterOptions={dashboardData?.filters ?? { regions: [], impacts: [] }}
            onFiltersChange={setTempFilters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            isMobile={false}
            myWatchList={dashboardData?.myWatchlist || []}
            loading={dashboardLoading}
            watchlistOnly={true}
          />
        </SidBarHOC>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:mb-2">
                <h1 className="text-md sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <SignpostBig className="w-5 h-5 sm:w-6 sm:h-6" />
                  Market Signals & News
                </h1>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed hidden sm:block">
                Stay updated with the latest data center developments, project
                announcements, investments, and technology trends curated from
                trusted global sources.
              </p>
            </div>

            {/* Mobile Filter Button */}
            <Button
              onClick={toggleMobileFilters}
              className="ml-4 p-3 text-black rounded-lg shadow-sm lg:hidden relative"
            >
              <Filter className="w-4 h-4" />
              {getActiveSignalsFiltersCount(filters) > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {getActiveSignalsFiltersCount(filters)}
                  </span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Desktop Filter Topbar — hidden on mobile/tablet */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
          <SignalsFilterSidebar
            filters={tempFilters}
            filterOptions={dashboardData?.filters ?? { regions: [], impacts: [] }}
            onFiltersChange={setTempFilters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            isMobile={false}
            myWatchList={dashboardData?.myWatchlist || []}
            loading={dashboardLoading}
          />
        </div>

        {dashboardLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loading />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto sm:mx-2">
            <div className="flex flex-col lg:flex-row gap-6 mx-2">
              <div className="flex-1 space-y-4 md:space-y-6">
                {/* Weekly Signals and Trend Metrics */}
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                  {dashboardData?.weeklySignals && dashboardData.weeklySignals.length > 0 && (
                    <div className="flex-1 lg:w-1/2">
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Presentation className="w-4 h-4 sm:w-5 sm:h-5" />
                        Top Weekly Signals
                      </h2>
                      <SignalCarousal signals={dashboardData.weeklySignals} />
                    </div>
                  )}

                  <div className="flex-1 lg:w-1/2">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                      <ChartNoAxesColumn className="w-4 h-4 sm:w-5 sm:h-5" />
                      Key Metrics
                    </h2>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      {metrics.map((metric, index) => (
                        <TrendMetric key={index} metric={metric} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 my-4" />

                {/* News Articles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
                      <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
                      Latest News
                    </h2>
                  </div>

                  <div className="space-y-4 relative min-h-[200px]">
                    {isUIRefreshing || articlesLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10 rounded-md">
                        <Loading text="Loading news..." />
                      </div>
                    ) : newsStream.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-gray-500 text-lg mb-2">No results found</div>
                        <p className="text-gray-400 text-sm mb-4 text-center max-w-md">
                          Try adjusting your search filters to see more results
                        </p>
                        <Button onClick={handleClearFilters}>Clear All Filters</Button>
                      </div>
                    ) : (
                      newsStream.map((article) => (
                        <NewsItem
                          key={
                            (article as NewsStreamItem)._id ||
                            (article as NewsArticle).uri
                          }
                          item={article}
                          isFavorite={
                            dashboardData?.myWatchlist?.some(
                              (item) =>
                                item._id === (article as NewsStreamItem)._id ||
                                item._id === (article as NewsArticle).uri
                            ) || false
                          }
                          onFavoriteChange={() => {
                            queryClient.invalidateQueries({
                              queryKey: ["signals-dashboard"],
                            });
                          }}
                        />
                      ))
                    )}
                  </div>

                  {newsStream.length > 0 && totalArticles > 0 && (
                    <Pagination
                      currentPage={currentPageFromApi}
                      totalCount={totalArticles}
                      itemsPerPage={perPage}
                      onPageChange={handlePageChange}
                      loading={articlesLoading}
                      hasMore={hasMore}
                      className="pt-4"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};