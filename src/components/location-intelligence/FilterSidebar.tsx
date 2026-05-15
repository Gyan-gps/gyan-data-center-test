import React from "react";
import { Button, Select, Loading } from "@/components/ui";
import { X } from "lucide-react";
import { GeographySelect } from "../common/GeographySelect";
import { useCompanyFilters } from "@/hooks/useCompanyFilters";
import excludedCitiesData from "@/constants/excludedCities.json";

interface FilterState {
  regions: string[];
  countries: string[];
  cities: string[];
  base_year?: number;
  base_quarter?: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  activeSection?: string;
  isMobile?: boolean;
  onClose?: () => void;
  handleApplyFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onReset,
  isMobile = false,
  onClose,
  handleApplyFilters,
}) => {
  const { data: filterOptions, isLoading, error } = useCompanyFilters();

  const BASE_YEAR_OPTIONS = Array.from(
    { length: 2026 - 2016 + 1 },
    (_, i) => 2016 + i,
  );

  const YEAR_QUARTER_MAP: Record<number, number[]> = {
  2025: [1, 2, 3, 4],

  // currently only Q1 data available
  2026: [1],
};
const availableQuarters =
  filters.base_year
    ? YEAR_QUARTER_MAP[filters.base_year] || []
    : [];
    const isQuarterRequired =
  availableQuarters.length > 0;

const isApplyDisabled =
  isQuarterRequired &&
  !filters.base_quarter;
  // Loading / error — mobile only (desktop returns null so topbar stays clean)
  if (isLoading) {
    return (
      <div
        className={`${
          isMobile ? "w-80 h-screen border-r" : "w-full"
        } bg-white border-gray-200 flex items-center justify-center py-4`}
      >
        <Loading text="Loading filters..." />
      </div>
    );
  }

  if (error) {
    return isMobile ? (
      <div className="w-80 h-screen bg-white border-r border-gray-200 flex items-center justify-center">
        <span className="text-red-500">Failed to load filters</span>
      </div>
    ) : null;
  }

  // ── Desktop: horizontal topbar row ────────────────────────────────────────
  if (!isMobile) {
    return (
      <div className="w-full flex items-center gap-3 flex-wrap">
        {/* Geography */}
        <GeographySelect
          filters={filters}
          options={{
            regions: filterOptions?.hqRegions ?? [],
            countries: filterOptions?.hqCountries ?? [],
            cities:
              filterOptions?.hqCities?.filter(
                (c) => !excludedCitiesData.excludeFromLocationIntel.includes(c),
              ) ?? [],
            excludedCities: excludedCitiesData.excludeFromLocationIntel,
          }}
        >
          {({
            regions,
            countries,
            cities,
            isCountriesEnabled,
            isCitiesEnabled,
          }) => (
            <>
              <div className="min-w-[150px]">
                <Select
                  options={(regions || []).map((r) => ({ value: r, label: r }))}
                  value={filters.regions?.[0] || ""}
                  searchable
                  placeholder="Region..."
                  onChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      regions: value ? [value as string] : [],
                      countries: [],
                      cities: [],
                    })
                  }
                />
              </div>

              <div className="min-w-[150px]">
                <Select
                  options={(countries || []).map((c) => ({
                    value: c,
                    label: c,
                  }))}
                  value={filters.countries?.[0] || ""}
                  searchable
                  disabled={!isCountriesEnabled}
                  placeholder={
                    isCountriesEnabled ? "Country..." : "Select region first"
                  }
                  onChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      countries: value ? [value as string] : [],
                      cities: [],
                    })
                  }
                />
              </div>

              <div className="min-w-[150px]">
                <Select
                  options={(cities || []).map((city) => ({
                    value: city,
                    label: city,
                  }))}
                  value={filters.cities?.[0] || ""}
                  searchable
                  disabled={!isCitiesEnabled}
                  placeholder={
                    isCitiesEnabled ? "City..." : "Select country first"
                  }
                  onChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      cities: value ? [value as string] : [],
                    })
                  }
                />
              </div>
            </>
          )}
        </GeographySelect>

        {/* Base Year */}
        <div className="min-w-[130px]">
          <Select
            options={BASE_YEAR_OPTIONS.map((year) => ({
              value: year.toString(),
              label: year.toString(),
            }))}
            value={filters.base_year?.toString() || ""}
            placeholder="Base year..."
            onChange={(value) =>
              onFiltersChange({
                ...filters,
                base_year: value ? Number(value) : undefined,
                base_quarter: undefined,
              })
            }
          />
        </div>

        {/* Quarter */}
        {availableQuarters.length > 0 && (
            <div className="min-w-[120px]">
              <Select
                options={availableQuarters.map((q) => ({
                  value: q.toString(),
                  label: `Q${q}`,
                }))}
                value={filters.base_quarter?.toString() || ""}
                placeholder="Quarter..."
                onChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    base_quarter: value ? (value as string) : undefined,
                  })
                }
              />
            </div>
          )}

        {/* Actions */}
        <div className="flex gap-2 ml-auto shrink-0">
          <Button
            variant="outline"
            onClick={onReset}
            className="h-9 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            Reset
          </Button>
          <Button
            onClick={handleApplyFilters}
            disabled={isApplyDisabled}
            className="h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            Apply
          </Button>
        </div>
      </div>
    );
  }

  // ── Mobile/Tablet: original sidebar (100% unchanged) ──────────────────────
  return (
    <div
      className={`${
        isMobile
          ? "w-80 fixed left-0 top-0 h-full bg-white shadow-xl z-50"
          : "w-80 h-full min-h-0"
      } bg-white border-r border-gray-200 flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>

        {isMobile && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-20">
        {/* Geography Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Geography
          </h3>

          <GeographySelect
            filters={filters}
            options={{
              regions: filterOptions?.hqRegions ?? [],
              countries: filterOptions?.hqCountries ?? [],
              cities:
                filterOptions?.hqCities?.filter(
                  (c) =>
                    !excludedCitiesData.excludeFromLocationIntel.includes(c),
                ) ?? [],
              excludedCities: excludedCitiesData.excludeFromLocationIntel,
            }}
          >
            {({
              regions,
              countries,
              cities,
              isCountriesEnabled,
              isCitiesEnabled,
            }) => (
              <>
                {/* Region */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Region
                  </label>
                  <Select
                    options={(regions || []).map((r) => ({
                      value: r,
                      label: r,
                    }))}
                    value={filters.regions?.[0] || ""}
                    searchable
                    placeholder="Select region..."
                    onChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        regions: value ? [value as string] : [],
                        countries: [],
                        cities: [],
                      })
                    }
                  />
                </div>

                {/* Country */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Country
                  </label>
                  <Select
                    options={(countries || []).map((c) => ({
                      value: c,
                      label: c,
                    }))}
                    value={filters.countries?.[0] || ""}
                    searchable
                    disabled={!isCountriesEnabled}
                    placeholder={
                      isCountriesEnabled
                        ? "Select country..."
                        : "Select region first"
                    }
                    onChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        countries: value ? [value as string] : [],
                        cities: [],
                      })
                    }
                  />
                </div>

                {/* Cities */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Cities
                  </label>
                  <Select
                    options={(cities || []).map((city) => ({
                      value: city,
                      label: city,
                    }))}
                    value={filters.cities?.[0] || ""}
                    searchable
                    disabled={!isCitiesEnabled}
                    placeholder={
                      isCitiesEnabled
                        ? "Select cities..."
                        : "Select country first"
                    }
                    onChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        cities: value ? [value as string] : [],
                      })
                    }
                  />
                </div>
              </>
            )}
          </GeographySelect>

          {/* Base Year */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Base Year
            </label>
            <Select
              options={BASE_YEAR_OPTIONS.map((year) => ({
                value: year.toString(),
                label: year.toString(),
              }))}
              value={filters.base_year?.toString() || ""}
              placeholder="Select base year..."
              onChange={(value) =>
                onFiltersChange({
                  ...filters,
                  base_year: value ? Number(value) : undefined,
                  base_quarter: undefined,
                })
              }
            />
          </div>

          {/* Quarter */}
          {availableQuarters.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Quarter
              </label>
                <Select
                  options={availableQuarters.map((q) => ({
                    value: q.toString(),
                    label: `Q${q}`,
                  }))}
                  value={filters.base_quarter?.toString() || ""}
                  placeholder="Select quarter..."
                  onChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      base_quarter: value ? (value as string) : undefined,
                    })
                  }
                />
              </div>
            )}
        </div>

        {/* Apply + Reset Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onReset();
              if (isMobile && onClose) onClose();
            }}
            className="flex-1"
          >
            Reset
          </Button>

          <Button
            onClick={() => {
              handleApplyFilters();
              if (isMobile && onClose) onClose();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isApplyDisabled}
          >
            Apply
          </Button>
        </div>

        {/* Quick Links */}
        {/* <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Explore</h3>

          <div className="space-y-1">
            {quickLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition
                ${
                  activeSection === link.id
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};
