import React, { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { FilterSidebar } from "../home/FilterSidebar";
import { ExplorerMap } from "./ExplorerMap";
import { getDataCentersMaps, getFilterOptions } from "@/network";
import type { FilterState, DataCenterFilters } from "@/network";
import { Loading, Button, Input } from "@/components/ui";
import { Map, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { APP_NAME } from "@/utils";
import { useMobileState } from "@/hooks";
import SidBarHOC from "../analytics/SidBarHOC";
import { filterInitialState, useSessionFilters } from "@/hooks/useSessionFilters";
import KPICard from "./KPICard";
import TopProjects from "./TopProjects";
import { FilterTopbar } from "../home/FilterTopbar";
// Helper function to get the count of active filters
const getActiveFiltersCount = (filters: FilterState) => {
  let count = 0;
  if (filters.statuses.length > 0) count++;
  if (filters.operators.length > 0) count++;
  if (filters.dcTypes.length > 0) count++;
  if (filters.tierLevels.length > 0) count++;
  if (filters.cities.length > 0) count++;
  if (filters.countries.length > 0) count++;
  if (filters.regions.length > 0) count++;
  // Note: yearRange and itLoadRange are not checked here as they default to full range
  return count;
};

export const ExplorerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mobile state management with automatic restoration
  const { isMobile, isFilterOpen, setIsFilterOpen, saveState } = useMobileState(
    {
      restoreStateKey: "explorerDashboardState",
      breakpoint: 1024,
    }
  );

  // const [isIntroExpanded, setIsIntroExpanded] = useState(false);

  const { sessionFilters, setFiltersInSession } = useSessionFilters<FilterState>('explorer');

  // Filter state
  // Applied filters - only updated when Apply button is clicked
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(filterInitialState);
  const [tempFilters, setTempFilters] = useState<FilterState>(filterInitialState);
  useEffect(() => {
    if (sessionFilters) {
      setAppliedFilters(sessionFilters);
    }
  }, [sessionFilters]);

  
  // Separate the live input from the applied search query so search
  // only runs when the user clicks Search or presses Enter
  const [mapSearchInput, setMapSearchInput] = useState("");
  const [mapSearchQuery, setMapSearchQuery] = useState("");

  // Create query key for caching
  const queryKey = ["explorerDataCenters", appliedFilters];

  // Use React Query for data fetching and caching
  const { data: dataCentersData, isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      // Convert filter state to API filters according to schema
      const apiFilters: DataCenterFilters = {};

      // For map view, we want to show many data points, so set a high limit
      apiFilters.limit = 10000;

      // Array filters
      if (appliedFilters.statuses.length > 0) {
        apiFilters.statuses = appliedFilters.statuses;
      }
      if (appliedFilters.operators.length > 0) {
        apiFilters.operators = appliedFilters.operators;
      }
      if (appliedFilters.dcTypes.length > 0) {
        apiFilters.dcTypes = appliedFilters.dcTypes;
      }
      if (appliedFilters.tierLevels.length > 0) {
        apiFilters.tierLevels = appliedFilters.tierLevels;
      }
      if (appliedFilters.regions.length > 0) {
        apiFilters.regions = appliedFilters.regions;
      }
      if (appliedFilters.countries.length > 0) {
        apiFilters.countries = appliedFilters.countries;
      }
      if (appliedFilters.cities.length > 0) {
        apiFilters.cities = appliedFilters.cities;
      }

      return await getDataCentersMaps(apiFilters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Extract data from query response
  const assets = useMemo(
    () => dataCentersData?.assets ?? [],
    [dataCentersData?.assets]
  );

  const filteredData = useMemo(() => {
    if (!mapSearchQuery.trim()) return assets;
    const query = mapSearchQuery.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesId =
        asset.dc_id?.toLowerCase().includes(query) ||
        asset.id?.toLowerCase().includes(query);

      const matchesOperator = asset.data_center_operator?.some((operator) =>
        operator.company?.toLowerCase().includes(query)
      );

      const matchesCountry = asset.country?.some((country) =>
        country?.toLowerCase().includes(query)
      );

      const matchesCity = asset.city?.some((city) =>
        city.city?.toLowerCase().includes(query)
      );

      return matchesId || matchesOperator || matchesCountry || matchesCity;
    });
  }, [assets, mapSearchQuery]);

  // Initialize filter ranges from API

  const handleViewDetails = (id: string) => {
    // Save mobile state before navigating
    saveState();

    // Navigate to data center detail page
    navigate(`/datacenter/${id}`);
  };

  const handleApplyFilters = (filters: FilterState) => {
    // Apply current filters and search value to trigger query refetch
    setAppliedFilters(filters);
    setFiltersInSession(filters); // Update session storage with applied filters
    if (isMobile) {
      setIsFilterOpen(false); // Close mobile filter after applying
    }
  };

  const handleClearFilters = async (
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  ) => {
    try {
      const filterOptions = await getFilterOptions();
      const clearedFilters: FilterState = {
        statuses: [],
        operators: [],
        dcTypes: [],
        tierLevels: [],
        yearRange:
          filterOptions && filterOptions.yearRange
            ? [filterOptions.yearRange.min, filterOptions.yearRange.max]
            : [2000, 2030],
        itLoadRange:
          filterOptions && filterOptions.itLoadRange
            ? [filterOptions.itLoadRange.min, filterOptions.itLoadRange.max]
            : [0, 1000],
        cities: [],
        countries: [],
        regions: [],
      };
      setFilters(clearedFilters);
      // Apply cleared filters to trigger query refetch
      setAppliedFilters(clearedFilters);
      setFiltersInSession(clearedFilters);
      // Clear both the live input and the applied query
      setMapSearchInput("");
      setMapSearchQuery("");
      if (isMobile) {
        setIsFilterOpen(false); // Close mobile filter after clearing
      }
    } catch (error) {
      console.error("Failed to clear filters:", error);
      // Use default values if API fails
      const clearedFilters: FilterState = filterInitialState;
      setFilters(clearedFilters);
      // Apply cleared filters to trigger query refetch
      setAppliedFilters(clearedFilters);
      // Clear both the live input and the applied query
      setMapSearchInput("");
      setMapSearchQuery("");
      if (isMobile) {
        setIsFilterOpen(false); // Close mobile filter after clearing
      }
    }
  };

  const handleSearch = () => {
    // Apply trimmed input as the active search query
    setMapSearchQuery(mapSearchInput.trim());
  };

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col">
      {/* Intro Section - Accordion (Hidden on mobile) */}
      {/* <IntroSection
        isIntroExpanded={isIntroExpanded}
        setIsIntroExpanded={setIsIntroExpanded}
      /> */}

      <div className="flex flex-1">
        {/* Desktop Filter Sidebar */}
        {/* <SidBarHOC>
          <FilterSection
            isMobile={false}
            handleApplyFilters={handleApplyFilters}
            handleClearFilters={handleClearFilters}
            setIsFilterOpen={setIsFilterOpen}
            sessionFilters={sessionFilters}
          />
        </SidBarHOC> */}

        {/* Mobile Filter Overlay */}
        {isMobile && isFilterOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-opacity-50 z-40"
              onClick={() => setIsFilterOpen(false)}
              style={{ backdropFilter: "blur(1px)" }}
            />

            {/* Filter Drawer */}
            <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 shadow-xl transform transition-transform duration-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-md font-semibold text-gray-900">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="h-full overflow-hidden">
                <FilterSection
                  isMobile
                  handleApplyFilters={handleApplyFilters}
                  handleClearFilters={handleClearFilters}
                  setIsFilterOpen={setIsFilterOpen}
                  sessionFilters={sessionFilters}
                />
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-2 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-md lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:mb-2">
                  <Map className="w-5 h-5 lg:w-6 lg:h-6" />
                  Home
                </h1>
                <p className="text-gray-600 text-xs lg:text-sm pr-4 hidden sm:block">
                  Access real-time updates on data center facilities, IT load
                  capacity, operators, and upcoming expansions worldwide.
                  Filter, analyze, and compare projects with ease—designed to
                  help you make faster, data-driven decisions.
                </p>
              </div>

              {/* Mobile Filter Button */}
              {isMobile && (
                <Button
                  onClick={() => setIsFilterOpen(true)}
                  className="ml-4 p-3 text-black rounded-lg shadow-sm relative"
                >
                  <Filter className="w-4 h-4" />
                  {getActiveFiltersCount(appliedFilters) > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border border-white flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {getActiveFiltersCount(appliedFilters)}
                      </span>
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          {/* <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
            <div className="w-full max-w-md">
              <div className="flex items-center gap-2">
                <Input
                  value={mapSearchInput}
                  onChange={(event) => setMapSearchInput(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Search by DC ID, operator, country, or city"
                  aria-label="Search data centers"
                />
                <Button
                            onClick={handleSearch}
                            className="flex-1 h-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          >
                            Search
                          </Button>
              </div>
            </div>
          </div> */}
          {/* Search + Filters Row */}
          <div className="hidden lg:block bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* SEARCH */}
              {/* <div className="flex items-center gap-2 min-w-[250px] flex-1">
                <Input
                  value={mapSearchInput}
                  onChange={(event) => setMapSearchInput(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Search by DC ID, operator, country, or city"
                  aria-label="Search data centers"
                />
                <Button
                  onClick={handleSearch}
                  className="flex-1 h-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  Search
                </Button>
              </div> */}

              {/* FILTER TOPBAR */}
              <div className="flex flex-wrap gap-2 flex-[3]">
                <FilterTopbar
                  filters={tempFilters}
                  onFiltersChange={setTempFilters}
                  onApplyFilters={() => handleApplyFilters(tempFilters)}
                  onClearFilters={() => handleClearFilters(setTempFilters)}
                />
              </div>
            </div>
          </div>

          {/* Map Container */}
         <div className="py-2 lg:p-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loading />
          </div>
        ) : (
          <>
              {/* DESKTOP: map + top projects on left, KPI on right */}
              <div className="hidden lg:flex flex-col gap-4">

                {/* KPI TOP */}
                <div className="shrink-0">
                  <KPICard data={filteredData} loading={loading} />
                </div>

                {/* MAP */}
                <div className="w-full h-[700px]">  
                 <ExplorerMap
                    data={filteredData}
                    loading={loading}
                    onViewDetails={handleViewDetails}
                    isFilterOpenInMobile={false}
                  />
                </div>

                {/* TOP PROJECTS */}
                <div className="shrink-0">
                  <TopProjects data={filteredData} loading={loading} />
                </div>

              </div>

            {/* MOBILE: stacked — Map → KPI → Top 3 Projects */}
            <div className="flex lg:hidden flex-col gap-4 overflow-y-auto h-full">

              {/* KPI FIRST */}
              <div className="shrink-0">
                <KPICard data={filteredData} loading={loading} />
              </div>

              {/* MAP SECOND */}
              <div className="h-[50vh] shrink-0">
                <ExplorerMap
                  data={filteredData}
                  loading={loading}
                  onViewDetails={handleViewDetails}
                  isFilterOpenInMobile={false}
                />
              </div>

              {/* TOP PROJECTS THIRD */}
              <div className="shrink-0 pb-4">
                <TopProjects data={filteredData} loading={loading} />
              </div>

            </div>
          </>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

const FilterSection: React.FC<{
  isMobile?: boolean;
  handleApplyFilters: (filters: FilterState) => void;
  handleClearFilters: (
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  ) => void;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sessionFilters: FilterState;
}> = ({
  isMobile = false,
  handleApplyFilters,
  handleClearFilters,
  setIsFilterOpen,
  sessionFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>(filterInitialState);

  useEffect(() => {
    if (sessionFilters) {
      setFilters(sessionFilters);
    }
  }, [sessionFilters]);

  return (
    <>
      <FilterSidebar
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={() => handleApplyFilters(filters)}
        onClearFilters={() => handleClearFilters(setFilters)}
        isMobile={isMobile}
        onClose={() => setIsFilterOpen(false)}
      />
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const IntroSection: React.FC<{
  isIntroExpanded: boolean;
  setIsIntroExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setIsIntroExpanded, isIntroExpanded }) => {
  return (
    <div className="shadow-sm my-2 bg-white hidden sm:block">
      {/* Always visible preview text */}
      <div className="px-4 py-3 bg-gray-50">
        <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
          <strong>{APP_NAME}</strong> brings together the most comprehensive
          view of global data center projects and infrastructure in one unified
          platform. Covering{" "}
          <span className="font-semibold text-blue-600">9,000+ facilities</span>
          ,
          <span className="font-semibold text-blue-600"> 1,250+ operators</span>
          , and
          <span className="font-semibold text-blue-600"> 80+ countries</span>,
          it transforms raw data and market signals into{" "}
          <span className="font-semibold text-blue-600">
            decision-ready intelligence
          </span>{" "}
          for business leaders, strategists, and investors.
        </p>

        {!isIntroExpanded && (
          <div className="mt-2 text-center">
            <button
              onClick={() => setIsIntroExpanded(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mx-auto hover:underline transition-colors"
            >
              See more details
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isIntroExpanded && (
        <div className="p-4 lg:p-6">
          <div className="text-left">
            <p className="text-sm lg:text-base text-gray-700 leading-relaxed mb-4">
              The platform delivers{" "}
              <span className="font-semibold text-blue-600">
                real-time project tracking
              </span>
              ,{" "}
              <span className="font-semibold text-blue-600">
                competitive benchmarking
              </span>
              ,{" "}
              <span className="font-semibold text-blue-600">
                IT load analytics
              </span>
              , and{" "}
              <span className="font-semibold text-blue-600">
                geospatial insights
              </span>{" "}
              across hyperscale, colocation, telecom, and energy sectors. Every
              update is sourced from trusted global feeds, processed to remove
              duplication, and linked directly to project and company profiles,
              ensuring{" "}
              <span className="font-semibold text-blue-600">
                complete data accuracy
              </span>
              .
            </p>
            <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
              With the global data center industry forecasted to grow at{" "}
              <span className="font-semibold text-blue-600">12% CAGR</span>, DCI
              empowers users to stay ahead of market trends, monitor expansion
              pipelines, and evaluate growth opportunities with precision.
              Integrated{" "}
              <span className="font-semibold text-blue-600">
                interactive dashboards
              </span>{" "}
              allow facility comparisons, capacity forecasts, and regional
              opportunity analysis—all in one place. Designed for operators,
              investors, and developers, DCI aligns intelligence with
              operational, strategic, and financial priorities in the
              fast-evolving digital infrastructure ecosystem.
            </p>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs lg:text-sm text-gray-600">
                For any queries related to Data Centers or custom solutions,
                reach out to us at{" "}
                <span className="font-medium text-blue-600">
                  {" "}
                  <a href="mailto:info@mordorintelligence.com">
                    info@mordorintelligence.com
                  </a>
                </span>
              </p>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsIntroExpanded(false)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mx-auto hover:underline transition-colors"
              >
                See less
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
