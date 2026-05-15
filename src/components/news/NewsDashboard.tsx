import React, { useState, useEffect } from "react";
import { NewsCard } from "./NewsCard";
import { NewsFilterSidebar } from "./NewsFilterSidebar";
import { Button, Loading, Pagination } from "@/components/ui";
import { getNewsStream } from "@/network";
import type {
  NewsStreamResponse,
  NewsFilters,
} from "@/network/news/news.types";
import { Filter, Newspaper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  newFilterInitialState,
  useSessionFilters,
} from "@/hooks/useSessionFilters";

// Helper function to get the count of active news filters
const getActiveNewsFiltersCount = (filters: NewsFilters) => {
  let count = 0;
  if (filters.searchQuery?.trim()) count++;
  if (filters.startDate) count++;
  if (filters.endDate) count++;
  return count;
};

export const NewsDashboard: React.FC = () => {
  const { sessionFilters, setFiltersInSession } =
    useSessionFilters<NewsFilters>("news");

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<NewsFilters>(newFilterInitialState);
  const [tempFilters, setTempFilters] = useState<NewsFilters>(filters);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    if (sessionFilters) {
      setFilters(sessionFilters);
    }
  }, [sessionFilters]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  useEffect(() => {
    setCurrentPage(filters.page || 1);
  }, [filters.page]);

  // Query for news data with caching
  const {
    data: newsData,
    isLoading: loading,
    error,
  } = useQuery<NewsStreamResponse>({
    queryKey: ["news", filters],
    queryFn: () => getNewsStream(filters),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setFilters({ ...filters, page: newPage });
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyFilters = () => {
    // Reset to page 1 when applying new filters
    setCurrentPage(1);
    setFilters({ ...tempFilters, page: 1 });
    setFiltersInSession({ ...tempFilters, page: 1 });
    setShowFiltersMobile(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = newFilterInitialState;
    setFiltersInSession(clearedFilters);
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
    setCurrentPage(1);
  };

  const toggleMobileFilters = () => {
    setShowFiltersMobile(!showFiltersMobile);
  };

  if (error && !newsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">Error</div>
            <div className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : "Error loading news. Please try again."}
            </div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] justify-between">
      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block shrink-0">
        <NewsFilterSidebar
          filters={tempFilters}
          onFiltersChange={setTempFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Mobile Filter Sidebar (Conditional) */}
      {showFiltersMobile && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-opacity-50 z-40"
            style={{ backdropFilter: "blur(1px)" }}
            onClick={toggleMobileFilters}
          />

          <div
            className="fixed inset-0 z-40"
            onClick={toggleMobileFilters}
          ></div>
          <NewsFilterSidebar
            filters={tempFilters}
            onFiltersChange={setTempFilters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            isMobile={true}
            onClose={toggleMobileFilters}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:mb-2">
                <h1 className="text-md sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Newspaper className="w-5 h-5 sm:w-6 sm:h-6" />
                  News
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
              {getActiveNewsFiltersCount(filters) > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {getActiveNewsFiltersCount(filters)}
                  </span>
                </div>
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto sm:mx-2">
          {/* Loading State */}
          {loading && (
            <div className="fixed inset-0 bg-opacity-10 flex items-center justify-center z-50">
              <Loading />
            </div>
          )}

          {/* News Articles */}
          <div
            className="space-y-4 mb-8"
            style={loading ? { filter: "blur(4px)" } : {}}
          >
            {newsData?.articles?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  No results found
                </div>
                <p className="text-gray-400 text-sm mb-4 text-center max-w-md">
                  Try adjusting your search filters to see more results
                </p>
                <Button onClick={handleClearFilters}>Clear All Filters</Button>
              </div>
            ) : (
                            newsData?.articles?.map((article) => (
                <NewsCard key={article._id} article={article} />
              ))
            )}
          </div>

          {/* Pagination */}
          {newsData && (
            <Pagination
              currentPage={currentPage}
              totalCount={newsData.totalCount}
              itemsPerPage={newsData.count}
              onPageChange={handlePageChange}
              loading={loading}
              hasMore={newsData.hasMore}
            />
          )}

          {/* Loading overlay for pagination */}
          {loading && newsData && (
            <div className="fixed inset-0 bg-opacity-10 flex items-center justify-center z-50">
              <Loading />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
