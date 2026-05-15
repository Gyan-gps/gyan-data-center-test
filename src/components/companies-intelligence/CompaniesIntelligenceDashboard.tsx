import { SearchIcon, X } from "lucide-react";
import React, {
  useMemo,
  useState, useEffect,
} from "react";
import HeroSection from "./HeroSection";
import CapacitySection from "./CapacitySection";
import { KpiSection } from "./KpiSection";
import { useQuery } from "@tanstack/react-query";
import CountryDetailsSection from "./CountryDetailsSection";
import ContactDirectory from "./ContactDirectory";
import FacilitiesDirectory from "./FacilitiesDirectory";
import { getOperatorIntelligenceKpi, getYearlyTimeline, getCompanyCountryDetails, getCompanyStatusDistribution, getCompanyDataCenters, getCompanySearchResults,getHeroSection,getTopCompanies } from "@/network/operator-intelligence/operator-intelligence.api";
import type { OperatorIntelligenceKpiRequest, GetKpiCardsResponse, YearlyTimelineResponse, CompanyCountryDetailsResponse, CompanyStatusDistributionResponse, CompanyDataCentersResponse,HeroSectionResponse } from "@/network/operator-intelligence/operator-intelligence.types";

export const CompaniesIntelligenceDashboard: React.FC = () => {


  const [facilityPage, setFacilityPage] = useState(1);
  const [facilitySearch, setFacilitySearch] = useState("");
  const [debouncedFacilitySearch, setDebouncedFacilitySearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput,] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [
    selectedCompanyName,
    setSelectedCompanyName,
  ] = useState("");


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFacilitySearch(
        facilitySearch
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [facilitySearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchInput(
        searchInput
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const summaryPayload =
    useMemo<OperatorIntelligenceKpiRequest>(
      () => {
        return {
          companyName:
            selectedCompanyName ||
            "Vision247 Ltd",

          companyId:
            selectedCompanyId ||
            "recHmbVLHzfMJJvRP",
        };
      },
      [
        selectedCompanyId,
        selectedCompanyName,
      ]
    );

    const {
  data: topCompaniesData,
} = useQuery({
  queryKey: [
    "top-companies",
  ],

  queryFn: getTopCompanies,

  staleTime:
    5 * 60 * 1000,

  refetchOnWindowFocus: false,
});
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<GetKpiCardsResponse, Error>({
    queryKey: ["operator-intelligence-kpi", selectedCompanyId,],
    queryFn: () => getOperatorIntelligenceKpi(summaryPayload),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: yearlyTimelineData,
    isLoading: yearlyTimelineLoading,
    error: yearlyTimelineError,
  } = useQuery<YearlyTimelineResponse, Error>({
    queryKey: ["operator-intelligence-yearly-timeline", selectedCompanyId,],
    queryFn: () => getYearlyTimeline(summaryPayload),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: companyCountryDetailsData,
    isLoading: companyCountryDetailsLoading,
    error: companyCountryDetailsError,
  } = useQuery<CompanyCountryDetailsResponse, Error>({
    queryKey: ["operator-intelligence-company-country-details", selectedCompanyId,],
    queryFn: () => getCompanyCountryDetails(summaryPayload),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const {
    data: getCompanyStatusDistributionData,
    isLoading: getCompanyStatusDistributionDataLoading,
    error: getCompanyStatusDistributionDataError,
  } = useQuery<CompanyStatusDistributionResponse, Error>({
    queryKey: ["operator-intelligence-company-status-distribution", selectedCompanyId,],
    queryFn: () => getCompanyStatusDistribution(summaryPayload),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const {
    data: getCompanyDataCentersData,
    isLoading: getCompanyDataCentersLoading,
    error: getCompanyDataCentersError,
  } = useQuery<CompanyDataCentersResponse, Error>({
    queryKey: [
      "operator-intelligence-company-datacenters",
      selectedCompanyId,
      facilityPage,
      debouncedFacilitySearch],
    queryFn: () =>
      getCompanyDataCenters({
        ...summaryPayload,

        page: facilityPage,

        limit: 10,

        search: debouncedFacilitySearch,
      }),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: companySearchResults,
    isFetching: companySearchLoading,
  } = useQuery({
    queryKey: [
      "company-search",
      debouncedSearchInput,
    ],

    queryFn: () =>
      getCompanySearchResults({
        companyName:
          debouncedSearchInput,
      }),

    enabled:
      debouncedSearchInput.trim()
        .length > 1,
  });

  const {
  data: heroSectionData,
  isLoading: heroSectionLoading,
  error: heroSectionError,
} = useQuery<HeroSectionResponse, Error>({
  queryKey: [
    "operator-intelligence-hero-section",
    selectedCompanyId,
  ],

  queryFn: () =>
    getHeroSection(
      summaryPayload
    ),

  enabled: true,

  staleTime: 5 * 60 * 1000,

  gcTime:
    24 * 60 * 60 * 1000,

  refetchOnWindowFocus: false,

  retry: 1,
});
  const marqueeStyles = `
@keyframes marquee {
  0% {
    transform: translateX(0%);
  }

  100% {
    transform: translateX(-20%);
  }
}
`;

return (
  <>
    <style>{marqueeStyles}</style>

    <div className="min-h-screen overflow-hidden bg-[#f5f7fb]">

      {/* Top Companies Marquee */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">

        <div className="flex py-3 whitespace-nowrap">

          <div className="flex items-center gap-4 w-max animate-[marquee_30s_linear_infinite]">

            {[
              ...(topCompaniesData || []),
              ...(topCompaniesData || []),
            ].map(
              (
                company: any,
                index
              ) => (

                <button
                  key={`${company.id}-${index}`}
                  type="button"
                  onClick={() => {

                    setSearchInput(
                      company.company_name
                    );

                    setSelectedCompanyName(
                      company.company_name
                    );

                    setSelectedCompanyId(
                      company.id
                    );
                  }}
                  className="flex items-center gap-3 bg-[#f8fafc] hover:bg-[#eef2ff] border border-slate-200 rounded-full px-4 py-2 shrink-0 transition-all duration-300 ease-out hover:scale-[0.92] hover:shadow-lg hover:-translate-y-[1px]"                >

                  {company.company_logo ? (
                    <img
                      src={
                        company.company_logo
                      }
                      alt={
                        company.company_name
                      }
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-white"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {company.company_name
                        ?.slice(0, 2)
                        ?.toUpperCase()}
                    </div>
                  )}

                  <span className="text-sm font-semibold text-slate-800">
                    {company.company_name}
                  </span>

                </button>
              )
            )}

          </div>

        </div>

      </div>

      {/* Search Section */}
      <div id="form-container" className="py-4 2xl:py-8 bg-[#fff]">
        <div className="max-w-container px-4 lg:px-6">
          <div className="relative">
            <form
              // onSubmit={handleSearch}
              className="relative flex items-center gap-3 w-full rounded-[18px] py-3 px-[14px] border bg-[#fbfcff] border-[#0f172a1a] shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
            >
              <SearchIcon className="text-gray-400" />

              <input
                type="text"
                placeholder="Search operator name…"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSearchResults(true);
                }}
                className="border-none outline-none bg-transparent w-full text-[14px]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setDebouncedSearchInput("");
                    setSelectedCompanyId("");
                    setSelectedCompanyName("");
                    setShowSearchResults(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </form>

            {showSearchResults &&
              debouncedSearchInput.trim().length >
              1 ? (
              companySearchResults?.data
                ?.length ? (
                <div className="absolute z-50 top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
                  {companySearchResults.data.map(
                    (company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => {
                          setSearchInput(
                            company.companyName
                          );

                          setSelectedCompanyName(
                            company.companyName
                          );

                          setSelectedCompanyId(
                            company.id
                          );

                          setShowSearchResults(
                            false
                          );
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="text-sm font-medium text-slate-800">
                          {company.companyName}
                        </div>
                      </button>
                    )
                  )}
                </div>
              ) : companySearchLoading ? (
                <div className="absolute z-50 top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-4 py-3 text-sm text-slate-500">
                    Searching...
                  </div>
                </div>
              ) : debouncedSearchInput.trim().length > 1 ? (
                <div className="absolute z-50 top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-4 py-3 text-sm text-slate-500">
                    Company not found
                  </div>
                </div>
              ) : null
            ) : null}
          </div>
        </div>
      </div>
      {summaryError && (
        <p className="text-sm text-red-500 mt-2">
          {summaryError.message ||
            "Failed to load company intelligence summary"}
        </p>
      )}
      {yearlyTimelineError && (
        <p className="text-sm text-red-500 mt-2">
          {yearlyTimelineError.message ||
            "Failed to load intelligence timeline error"}
        </p>
      )}
      {companyCountryDetailsError && (
        <p className="text-sm text-red-500 mt-2">
          {companyCountryDetailsError.message ||
            "Failed to load intelligence country details"}
        </p>
      )}
      {getCompanyStatusDistributionDataError && (
        <p className="text-sm text-red-500 mt-2">
          {getCompanyStatusDistributionDataError.message ||
            "Failed to load intelligence status details"}
        </p>
      )}
      {getCompanyDataCentersError && (
        <p className="text-sm text-red-500 mt-2">
          {getCompanyDataCentersError.message ||
            "Failed to load intelligence datacenters details"}
        </p>
      )}
      <main className="max-w-container px-4 lg:px-6 pb-6 space-y-0">
        <HeroSection
          data={heroSectionData}
          loading={heroSectionLoading}
        />
        <KpiSection cards={summaryData?.cards} loading={summaryLoading} />
        <CapacitySection
          key={
            selectedCompanyId ||
            "recHmbVLHzfMJJvRP"
          }
          timelineData={yearlyTimelineData}
          loading={yearlyTimelineLoading}
          companyId={
            selectedCompanyId ||
            "recHmbVLHzfMJJvRP"
          }
        />
        <CountryDetailsSection companyCountryDetailsData={companyCountryDetailsData} getCompanyStatusDistributionData={getCompanyStatusDistributionData} loading={companyCountryDetailsLoading} StatusDistributionDataLoading={getCompanyStatusDistributionDataLoading} />
        <ContactDirectory />
        <FacilitiesDirectory
          loading={getCompanyDataCentersLoading}
          companyDataCentersData={getCompanyDataCentersData}
          page={facilityPage}
          setPage={setFacilityPage}
          search={facilitySearch}
          setSearch={setFacilitySearch} />
      </main>
   </div>
  </>
);
};
