/**
 * Export utility functions
 * Helper functions for converting filter states and handling export operations
 */

import type { FilterState, ITLoadFilters } from "@/network";
import type {
  ExportDataCenterRequest,
  ExportITLoadRequest,
} from "@/network/export/export.types";

/**
 * Convert FilterState to ExportDataCenterRequest filters
 */
export const convertFilterStateToDataCenterExport = (
  filterState: FilterState,
  searchValue?: string
): ExportDataCenterRequest["filters"] => {
  const filters: ExportDataCenterRequest["filters"] = {};

  // Array filters
  if (filterState.statuses?.length > 0) {
    filters.statuses = filterState.statuses;
  }
  if (filterState.operators?.length > 0) {
    filters.operators = filterState.operators;
  }
  if (filterState.dcTypes?.length > 0) {
    filters.dcTypes = filterState.dcTypes;
  }
  if (filterState.tierLevels?.length > 0) {
    filters.tierLevels = filterState.tierLevels;
  }
  if (filterState.regions?.length > 0) {
    filters.regions = filterState.regions;
  }
  if (filterState.countries?.length > 0) {
    filters.countries = filterState.countries;
  }
  if (filterState.cities?.length > 0) {
    filters.cities = filterState.cities;
  }

  // Range filters
  if (filterState.yearRange && filterState.yearRange.length === 2) {
    const [minYear, maxYear] = filterState.yearRange;
    // Only set if different from default range
    if (minYear !== 2000 || maxYear !== 2030) {
      filters.minYear = minYear;
      filters.maxYear = maxYear;
    }
  }

  // Search filter
  if (searchValue && searchValue.trim()) {
    filters.dataCenter = searchValue.trim();
  }

  return filters;
};

/**
 * Convert ITLoadFilters to ExportITLoadRequest filters
 */
export const convertITLoadFiltersToExport = (
  itLoadFilters: ITLoadFilters
): ExportITLoadRequest["filters"] => {
  const filters: ExportITLoadRequest["filters"] = {};

  // Direct mappings
  if (itLoadFilters.regions) {
    filters.regions = Array.isArray(itLoadFilters.regions)
      ? itLoadFilters.regions
      : [itLoadFilters.regions];
  }
  if (itLoadFilters.countries) {
    filters.countries = Array.isArray(itLoadFilters.countries)
      ? itLoadFilters.countries
      : [itLoadFilters.countries];
  }
  if (itLoadFilters.cities) {
    filters.cities = Array.isArray(itLoadFilters.cities)
      ? itLoadFilters.cities
      : [itLoadFilters.cities];
  }

  if (itLoadFilters.operator) {
    filters.operator = itLoadFilters.operator;
  }
  if (itLoadFilters.year) {
    filters.year = itLoadFilters.year;
  }
  if (itLoadFilters.forecast !== undefined) {
    filters.forecast = itLoadFilters.forecast;
  }
  if (itLoadFilters.minYear) {
    filters.minYear = itLoadFilters.minYear;
  }
  if (itLoadFilters.maxYear) {
    filters.maxYear = itLoadFilters.maxYear;
  }
  if (itLoadFilters.tierLevel) {
    filters.tierLevel = itLoadFilters.tierLevel;
  }
  if (itLoadFilters.facilityType) {
    filters.facilityType = itLoadFilters.facilityType;
  }
  if (itLoadFilters.statuses) {
    filters.statuses = itLoadFilters.statuses;
  }

  if (itLoadFilters.sortBy) {
    filters.sortBy = itLoadFilters.sortBy;
  }
  if (itLoadFilters.sortOrder) {
    filters.sortOrder = itLoadFilters.sortOrder;
  }

  return filters;
};

/**
 * Convert FilterState to ITLoadFilters for IT Load export
 */
export const convertFilterStateToITLoadFilters = (
  filterState: FilterState,
  searchValue?: string
): ITLoadFilters => {
  const filters: ITLoadFilters = {};

  // Array filters
  if (filterState.regions?.length > 0) {
    filters["regions"] = filterState.regions;
  }
  if (filterState.countries?.length > 0) {
    filters.countries = filterState.countries;
  }
  if (filterState.cities?.length > 0) {
    filters.cities = filterState.cities;
  }

  if (filterState.statuses && filterState.statuses.length > 0) {
    // If only one status is selected, map it directly
    filters.statuses = filterState.statuses;
  }

  // Range filters
  if (filterState.yearRange && filterState.yearRange.length === 2) {
    const [minYear, maxYear] = filterState.yearRange;
    if (minYear !== 2000 || maxYear !== 2030) {
      filters.minYear = minYear;
      filters.maxYear = maxYear;
    }
  }

  // Operator from search value (if provided)
  if (searchValue && searchValue.trim()) {
    filters.operator = searchValue.trim();
  }

  if (filterState.dcTypes && filterState.dcTypes.length > 0) {
    // If only one DC Type is selected, map it directly
    filters.dcTypes = filterState.dcTypes;
  }

  return filters;
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate filename for export
 */
export const generateExportFilename = (
  dataType: "datacenters" | "itload",
  format: "csv" | "excel"
): string => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .split("T")[0];
  const extension = format === "excel" ? "xlsx" : "csv";
  return `${dataType}_export_${timestamp}.${extension}`;
};
