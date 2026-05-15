import React, { useState, useEffect, useCallback } from "react";
import { Button, Input, Loading } from "@/components/ui";
import { X, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import type {
  NewsFilters,
  NewsFilterCategory,
} from "@/network/news/news.types";
import { getNewsFilterCategories } from "@/network/news/news.api";

interface NewsFilterSidebarProps {
  filters: NewsFilters;
  onFiltersChange: (filters: NewsFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export const NewsFilterSidebar: React.FC<NewsFilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isMobile = false,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Helper function to find full paths for category names
  const findCategoryPaths = useCallback(
    (
      categories: NewsFilterCategory[],
      targetNames: string[],
      parentPath: string = ""
    ): string[] => {
      const paths: string[] = [];

      categories.forEach((category) => {
        const currentPath = parentPath
          ? `${parentPath} > ${category.title}`
          : category.title;

        // Check if this category title matches any target names
        if (targetNames.includes(category.title)) {
          paths.push(currentPath);
        }

        // Recursively search children
        if (category.children && category.children.length > 0) {
          const childPaths = findCategoryPaths(
            category.children,
            targetNames,
            currentPath
          );
          paths.push(...childPaths);
        }
      });

      return paths;
    },
    []
  );

  // Fetch filter categories
  const {
    data: filterData,
    isLoading: loadingFilters,
    error: filterError,
  } = useQuery({
    queryKey: ["newsFilterCategories"],
    queryFn: getNewsFilterCategories,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Update selected categories when filter data or filters change
  useEffect(() => {
    if (filterData?.categories) {
      const allTargetNames = [
        ...(filters.categories || []),
        ...(filters.subCategories || []),
      ];
      const fullPaths = findCategoryPaths(
        filterData.categories,
        allTargetNames
      );
      setSelectedCategories(fullPaths);
    }
  }, [
    filterData,
    filters.categories,
    filters.subCategories,
    findCategoryPaths,
  ]);

  // Synchronize other filter states when filters prop changes
  useEffect(() => {
    setSearchQuery(filters.searchQuery || "");
    setStartDate(filters.startDate || "");
    setEndDate(filters.endDate || "");
  }, [filters.searchQuery, filters.startDate, filters.endDate]);

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    // Validate that the selected date is not in the future
    if (value && value > today) {
      toast.error("Date cannot be in the future");
      return;
    }

    // Validate date range logic
    if (field === "startDate" && endDate && value && value > endDate) {
      toast.error("Start date cannot be later than End date");
      return;
    }

    if (field === "endDate" && startDate && value && value < startDate) {
      toast.error("End date cannot be earlier than Start date");
      return;
    }

    // Update state and filters
    if (field === "startDate") {
      setStartDate(value);
      onFiltersChange({ ...filters, startDate: value || undefined });
    } else {
      setEndDate(value);
      onFiltersChange({ ...filters, endDate: value || undefined });
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleCategorySelect = (categoryPath: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(categoryPath)
        ? prev.filter((c) => c !== categoryPath)
        : [...prev, categoryPath];

      // Separate L1 categories from L2+ subcategories based on path depth
      const level1Categories: string[] = [];
      const subCategories: string[] = [];

      newCategories.forEach((category) => {
        const pathParts = category.split(" > ");

        if (pathParts.length === 1) {
          // Level 1 category (no " > " separator)
          level1Categories.push(category);
        } else {
          // Level 2+ subcategory (has " > " separator) - extract only the final category name
          const finalCategoryName = pathParts[pathParts.length - 1];
          subCategories.push(finalCategoryName);
        }
      });

      // Remove duplicates
      const uniqueLevel1 = [...new Set(level1Categories)];
      const uniqueSubCategories = [...new Set(subCategories)];

      // Update filters with separated categories
      onFiltersChange({
        ...filters,
        categories: uniqueLevel1.length > 0 ? uniqueLevel1 : undefined,
        subCategories:
          uniqueSubCategories.length > 0 ? uniqueSubCategories : undefined,
      });

      return newCategories;
    });
  };

  const renderCategoryTree = (
    categories: NewsFilterCategory[],
    parentPath: string = ""
  ): React.ReactNode => {
    return categories.map((category) => {
      const currentPath = parentPath
        ? `${parentPath} > ${category.title}`
        : category.title;
      const hasSubCategories =
        category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(currentPath);
      const isSelected = selectedCategories.includes(currentPath);

      return (
        <div key={currentPath} className="mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              {" "}
              {hasSubCategories && (
                <button
                  onClick={() => toggleCategory(currentPath)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCategorySelect(currentPath)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span
                className={`text-sm ${
                  hasSubCategories ? "font-medium" : ""
                } text-gray-700`}
              >
                {category.title}
              </span>
            </label>
          </div>
          {hasSubCategories && isExpanded && (
            <div className="ml-6 mt-1">
              {renderCategoryTree(category.children, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      className={`${
        isMobile
          ? "w-80 fixed left-0 top-0 h-full bg-white shadow-xl z-50"
          : "w-80"
      } bg-white border-r border-gray-200 h-full flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <div className="flex items-center gap-2">
            {/* {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 text-xs px-2"
                onClick={onClearFilters}
              >
                Clear all
              </Button>
            )} */}
            {isMobile && onClose && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Search</h3>
          <div className="flex mb-2">
            <Input
              type="text"
              placeholder="Enter keyword to search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onFiltersChange({ ...filters, searchQuery: e.target.value });
              }}
              className="flex-1"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Publication Date Range
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Date
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={startDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    handleDateChange("startDate", e.target.value)
                  }
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Date
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={endDate}
                  max={new Date().toISOString().split("T")[0]}
                  min={startDate || undefined}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Dates cannot be in the future. Start date must be before or equal
              to End date.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Taxonomy{" "}
            {selectedCategories.length > 0 && (
              <span className="text-xs text-gray-500">
                ({selectedCategories.length} selected)
              </span>
            )}
          </h3>
          {loadingFilters ? (
            <div className="flex items-center justify-center py-4">
              <Loading size="md" text="Loading Taxonomy" />
            </div>
          ) : filterError ? (
            <p className="text-sm text-red-500">Error loading categories</p>
          ) : filterData?.categories ? (
            <div className="overflow-y-auto border border-gray-200 rounded-md p-3">
              {renderCategoryTree(filterData.categories)}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No categories available</p>
          )}
        </div>
      </div>

      {/* Apply and Reset Buttons - Sticky at bottom */}
      <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-white shadow-lg shrink-0 z-10">
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex-1 py-3 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={onApplyFilters}
            className="flex-1 py-3 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
