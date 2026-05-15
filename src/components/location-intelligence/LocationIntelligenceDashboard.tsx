import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { KpiSection } from "./KpiSection";
import { RankingSection } from "./RankingSection";
import { CapacitySection } from "./CapacitySection";
import { CityTableSection } from "./CityTableSection";
import { CompetitionSection } from "./CompetitionSection";
import { SupplySection } from "./SupplySection";
import { DirectorySection } from "./DirectorySection";
import SidBarHOC from "../analytics/SidBarHOC";
import { QuickLinksSidebar } from "./QuickLinksSidebar";
import { FilterSidebar } from "./FilterSidebar";

import { useQuery } from "@tanstack/react-query";
import {
  getLocationIntelligenceCapacity,
  getLocationIntelligenceCityWise,
  getLocationIntelligenceCompetition,
  getLocationIntelligenceRanking,
  getLocationIntelligenceSummary,
  getLocationIntelligenceSupply,
  getLocationIntelligenceDataCenters,
} from "@/network/location-intelligence/location-intelligence.api";
import type {
  CapacityOverview,
  CityWiseCapacities,
  CompetitionOverview,
  SupplyOverview,
  LocationFilters,
  RankingOverview,
  LocationIntelligenceSummary,
  LocationIntelligenceSummaryRequest,
  DataCenterListResponse,
} from "@/network/location-intelligence/location-intelligence.types";
import type { DataCenterListRequest } from "@/network/location-intelligence/location-intelligence.types";
import { Download, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  captureLocationIntelligencePdf,
  waitForLocationIntelligencePaint,
} from "@/utils/captureLocationIntelligencePdf";
import { useAuthStore } from "@/store";
import { cn } from "@/utils/cn";
import { Loading } from "../ui";

type Section =
  | "ranking"
  | "capacity"
  | "citytable"
  | "competition"
  | "supply"
  | "directory";

const DEFAULT_REGION = "North America";

const REGION_ALIAS_MAP: Record<string, string> = {
  Asia: "Asia Pacific",
  "Australia & New Zealand": "Australia and New Zealand",
};

const COUNTRY_ALIAS_MAP: Record<string, string> = {
  USA: "United States",
  UAE: "United Arab Emirates",
};

const normalizeRegion = (region?: string) => {
  if (!region) return undefined;
  return REGION_ALIAS_MAP[region] || region;
};

const normalizeCountry = (country?: string) => {
  if (!country) return undefined;
  return COUNTRY_ALIAS_MAP[country] || country;
};

export const LocationIntelligenceDashboard: React.FC = () => {
  const canExportPdf = useAuthStore((s) => s.user?.allowExport === true);
  const pdfCaptureRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [applyTrigger, setApplyTrigger] = useState(0);
  const [directoryTrigger, setDirectoryTrigger] = useState(0);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportLayout, setPdfExportLayout] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("ranking");
  const [filters, setFilters] = useState<LocationFilters>({
    regions: [],
    countries: [],
  });
  const [directoryFilters, setDirectoryFilters] = useState<
    Pick<DataCenterListRequest, "status" | "scale" | "size">
  >({
    status: undefined,
    scale: undefined,
    size: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<LocationFilters>({
    regions: [],
    countries: [],
    cities: [],
    base_year: 2026,
    base_quarter: 1,
  });

  const handleApplyFilters = () => {
    setAppliedFilters({
      regions: [...(filters.regions || [])],
      countries: [...(filters.countries || [])],
      cities: [...(filters.cities || [])],
      base_year: filters.base_year,
      base_quarter: filters.base_quarter,
    });
    setApplyTrigger((current) => current + 1);
  };

  const summaryPayload = useMemo<LocationIntelligenceSummaryRequest>(() => {
    const region = normalizeRegion(appliedFilters.regions?.[0]);
    const country = normalizeCountry(appliedFilters.countries?.[0]);

    return {
      ...(region ? { region } : {}),
      ...(country ? { country } : {}),
      ...(appliedFilters.cities?.length
        ? { cities: appliedFilters.cities }
        : {}),
      base_year: filters.base_year ?? 2026,
      base_quarter: filters.base_year
        ? filters.base_quarter // only send if user selected
        : 1, // default when nothing selected
    };
  }, [appliedFilters]);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<LocationIntelligenceSummary, Error>({
    queryKey: ["location-intelligence-summary", summaryPayload, applyTrigger],
    queryFn: () => getLocationIntelligenceSummary(summaryPayload),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: rankingData,
    isLoading: rankingLoading,
    error: rankingError,
  } = useQuery<RankingOverview, Error>({
    queryKey: ["location-intelligence-ranking", summaryPayload, applyTrigger],
    queryFn: () => getLocationIntelligenceRanking(summaryPayload),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: capacityData,
    isLoading: capacityLoading,
    error: capacityError,
  } = useQuery<CapacityOverview, Error>({
    queryKey: ["location-intelligence-capacity", summaryPayload, applyTrigger],
    queryFn: () => getLocationIntelligenceCapacity(summaryPayload),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: cityWiseData,
    isLoading: cityWiseLoading,
    error: cityWiseError,
  } = useQuery<CityWiseCapacities, Error>({
    queryKey: ["location-intelligence-city-wise", summaryPayload, applyTrigger],
    queryFn: () => getLocationIntelligenceCityWise(summaryPayload),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: competitionData,
    isLoading: competitionLoading,
    error: competitionError,
  } = useQuery<CompetitionOverview, Error>({
    queryKey: [
      "location-intelligence-competition",
      summaryPayload,
      applyTrigger,
    ],
    queryFn: () => getLocationIntelligenceCompetition(summaryPayload),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: supplyData,
    isLoading: supplyLoading,
    error: supplyError,
  } = useQuery<SupplyOverview, Error>({
    queryKey: ["location-intelligence-supply", summaryPayload, applyTrigger],
    queryFn: () => getLocationIntelligenceSupply(summaryPayload),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: dcData,
    isLoading: dcLoading,
    error: dcError,
  } = useQuery<DataCenterListResponse, Error>({
    queryKey: [
      "location-intelligence-dc-list",
      summaryPayload,
      currentPage,
      directoryFilters,
      directoryTrigger,
    ],
    queryFn: () =>
      getLocationIntelligenceDataCenters({
        ...summaryPayload,
        page: currentPage,
        status: directoryFilters.status,
        scale: directoryFilters.scale,
        size: directoryFilters.size,
      }),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const heroTitle = summaryData?.title || "GLOBAL DATA CENTER LANDSCAPE";
  const heroSubtitle =
    summaryData?.subtitle || "Select a region or country to load summary";

  const summaryChips = [
    {
      color: "bg-blue-500",
      text: `Updated: ${summaryData?.updatedQuarter || "-"}`,
    },
  ];

  // Scroll-spy
  const activeSectionRef = useRef<string>("ranking");

  useEffect(() => {
    const ids = ["ranking", "capacity", "competition", "supply", "directory"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeSectionRef.current = entry.target.id;
            // directly update DOM, no React re-render
            document.querySelectorAll("[data-quicklink]").forEach((el) => {
              const id = el.getAttribute("data-quicklink");
              el.className =
                id === entry.target.id
                  ? "text-left px-3 py-2 rounded-md text-sm transition-all bg-blue-100 text-blue-700 font-semibold w-full"
                  : "text-left px-3 py-2 rounded-md text-sm transition-all text-gray-600 hover:bg-gray-100 w-full";
            });
          }
        });
      },
      { threshold: 0.3, root: document.getElementById("scroll-container") },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
  const handleFiltersChange = (newFilters: LocationFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    const cleared = {
      regions: [],
      countries: [],
    };
    setDirectoryFilters({ status: undefined, scale: undefined });
    setDirectoryTrigger((prev) => prev + 1);
    setFilters(cleared);
    setAppliedFilters(cleared);
  };

  const handleExportToPDF = useCallback(async () => {
    if (isExportingPdf || !pdfCaptureRef.current) return;
    setIsExportingPdf(true);
    setPdfExportLayout(true);
    try {
      await waitForLocationIntelligencePaint();
      await captureLocationIntelligencePdf(pdfCaptureRef.current, {
        title: summaryData?.title || heroTitle,
      });
      toast.success("PDF downloaded");
    } catch (e) {
      console.error("[PDF Export Error]", e);
      toast.error("Could not generate PDF. Try again.");
    } finally {
      setPdfExportLayout(false);
      setIsExportingPdf(false);
    }
  }, [isExportingPdf, summaryData?.title, heroTitle]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsFilterOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleDirectoryPageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden  bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 font-sans text-gray-900">
      <SidBarHOC>
        <QuickLinksSidebar activeSection={activeSection} />
      </SidBarHOC>

      {isExportingPdf && (
        <div
          className="fixed inset-0 z-[100001] bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 text-gray-700 text-sm pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <span className="inline-block h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Generating PDF…</span>
        </div>
      )}

      <div
        id="scroll-container"
        className="flex-1 min-w-0 h-full overflow-y-auto"
      >
        {" "}
        {/* Mobile Filter Drawer */}
        {isMobile && isFilterOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 shadow-xl">
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleClearFilters}
                handleApplyFilters={() => {
                  handleApplyFilters();
                  setIsFilterOpen(false);
                }}
                activeSection={activeSection}
                isMobile={true}
                onClose={() => setIsFilterOpen(false)}
              />
            </div>
          </>
        )}
        <main className="flex-1 px-4 sm:px-6 py-6 space-y-0">
          <div
            ref={pdfCaptureRef}
            className="space-y-0 rounded-2xl bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 p-4 sm:p-5"
          >
            {/* PDF slide 1 — hero, filters (desktop), errors, KPIs */}
            <div
              id="li-pdf-slide-1"
              data-li-pdf-slide="1"
              className="pdf-slide-li space-y-0"
            >
              {/* Hero + Export */}
              <div className="relative flex items-stretch gap-0">
                {/* HERO CARD */}
                <div
                  className="relative flex-1 min-w-0 border border-gray-100 rounded-2xl bg-gradient-to-br 
    from-blue-50/70 via-white to-green-50/40 p-4 sm:p-5 pb-8 sm:pb-10 flex flex-col gap-4 shadow-sm overflow-hidden"
                >
                  {/* Radial glow */}
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 20% 50%, rgba(59,130,246,.4), transparent 60%)",
                    }}
                  />

                  {/* Decorative top-right blob */}
                  <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-[0.07] pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(59,130,246,.8), transparent 70%)",
                    }}
                  />

                  {/* Bottom wave curves */}
                  <svg
                    className="absolute bottom-0 left-0 w-full pointer-events-none"
                    viewBox="0 0 1440 60"
                    preserveAspectRatio="none"
                    style={{ height: "40px" }}
                  >
                    <path
                      d="M0,20 C360,60 720,0 1080,40 C1260,55 1380,25 1440,30 L1440,60 L0,60 Z"
                      fill="rgba(59,130,246,0.04)"
                    />
                    <path
                      d="M0,35 C240,10 480,50 720,30 C960,10 1200,50 1440,25 L1440,60 L0,60 Z"
                      fill="rgba(99,102,241,0.03)"
                    />
                  </svg>
                  {summaryLoading ? (
                    <div
                      className={`${
                        isMobile ? "w-80 h-screen border-r" : "w-full"
                      } bg-white border-gray-200 flex items-center justify-center py-4`}
                    >
                      <Loading text="Loading summary..." />
                    </div>
                  ) : (
                    <>
                      {/* HEADER ROW */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                        {/* LEFT */}
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                          <div className="w-12 sm:w-14 h-9 sm:h-10 rounded-xl border border-white/40 shadow-md overflow-hidden shrink-0 bg-white flex items-center justify-center text-2xl">
                            {/* Could use a proper <img> with country flag URLs if available, but fallback to emoji for now */}
                            <div>
                              {summaryData?.flag !== "🌐" &&
                              summaryData?.flag ? (
                                <img
                                  src={summaryData?.flag}
                                  alt="Country Flag"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                "🌐"
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 min-w-0">
                            <h1 className="text-sm sm:text-lg font-bold uppercase tracking-wide text-gray-900 truncate">
                              {heroTitle}
                            </h1>
                            <p className="text-xs text-gray-500">
                              {heroSubtitle}
                            </p>
                          </div>
                        </div>

                        {/* RIGHT TAGS */}
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                            {summaryChips.map((chip, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            border border-white/40 bg-white/70 backdrop-blur-sm text-xs text-gray-600"
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${chip.color}`}
                                />
                                {chip.text}
                              </span>
                            ))}
                          </div>
                          {/* Export PDF side-tab — desktop only */}
                          {!isMobile && canExportPdf && (
                            <button
                              type="button"
                              onClick={() => void handleExportToPDF()}
                              disabled={isExportingPdf}
                              data-html2canvas-ignore="true"
                              className="mt-1 hidden lg:flex items-center gap-2 px-6 py-3 rounded-xl
                    border border-l-0 border-gray-200 bg-white hover:bg-gray-50
                    text-blue-800 hover:text-blue-700 transition-colors shadow-sm
                    disabled:opacity-50 disabled:cursor-not-allowed
                    text-xs font-medium tracking-wider uppercase"
                            >
                              <Download className="w-3.5 h-3.5" />
                              {isExportingPdf ? "Generating…" : "Export PDF"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* OVERVIEW TEXT ROW */}
                      {!summaryLoading &&
                        summaryData &&
                        (() => {
                          const top3Locations =
                            rankingData?.topLocations?.items?.slice(0, 3) || [];
                          const top3Competitors =
                            rankingData?.topCompetition?.items?.slice(0, 3) ||
                            [];
                          const top3Hyperscale =
                            rankingData?.topHyperscale?.items?.slice(0, 3) ||
                            [];
                          const top3Cities =
                            cityWiseData?.table?.rows?.slice(0, 3) || [];
                          const top3Operators =
                            competitionData?.table?.rows?.slice(0, 3) || [];
                          const recentDCs = dcData?.items?.slice(0, 3) || [];
                          const totalDCs = dcData?.total || 0;
                          const latestCapacity =
                            capacityData?.capacityVsAbsorption?.data?.slice(
                              -1,
                            )?.[0];
                          const latestSupply =
                            supplyData?.supplyBySize?.data?.slice(-1)?.[0];
                          const statusTopSeg =
                            cityWiseData?.statusMix?.segments?.[0];
                          const typeTopSeg =
                            cityWiseData?.typeMix?.segments?.[0];
                          const marketLeader =
                            competitionData?.marketShareDonut?.segments?.[0];
                          const b = (v: React.ReactNode) => (
                            <span className="font-semibold text-gray-800">
                              {v}
                            </span>
                          );

                          return (
                            <div
                              className={`relative z-10 border-t border-white/40 ${pdfExportLayout ? "pt-4 mt-1" : ""}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-sm font-bold text-gray-800">
                                  Market Overview
                                </h2>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-justify">
                                This dashboard presents a comprehensive view of
                                the data center landscape for{" "}
                                {b(summaryData.scopeValue || "all regions")} as
                                of{" "}
                                {b(
                                  summaryData.updatedQuarter ||
                                    "the latest quarter",
                                )}
                                , base year {b(summaryData.base_year || 2026)}.
                                The total available capacity stands at{" "}
                                {b(
                                  `${summaryData.cards?.available?.value?.toLocaleString() || 0} ${summaryData.cards?.available?.unit || "MW"}`,
                                )}
                                , with{" "}
                                {b(
                                  `${summaryData.cards?.absorbed?.value?.toLocaleString() || 0} ${summaryData.cards?.absorbed?.unit || "MW"}`,
                                )}{" "}
                                already absorbed. The forecasted pipeline is{" "}
                                {b(
                                  `${summaryData.cards?.forecast?.value?.toLocaleString() || 0} ${summaryData.cards?.forecast?.unit || "MW"}`,
                                )}{" "}
                                and power consumption tracks at{" "}
                                {b(
                                  `${summaryData.cards?.powerConsumption?.value?.toLocaleString() || 0} ${summaryData.cards?.powerConsumption?.unit || "MW"}`,
                                )}
                                .
                                {top3Locations.length > 0 && (
                                  <>
                                    {" "}
                                    The top ranked locations by commissioned IT
                                    load are{" "}
                                    {top3Locations.map((it, i) => (
                                      <span key={i}>
                                        {b(it.name)}
                                        {it.value != null &&
                                          ` (${it.value.toLocaleString()} MW)`}
                                        {i < top3Locations.length - 1
                                          ? ", "
                                          : ""}
                                      </span>
                                    ))}
                                    .
                                  </>
                                )}
                                {top3Competitors.length > 0 && (
                                  <>
                                    {" "}
                                    Leading the competitive landscape are{" "}
                                    {top3Competitors.map((it, i) => (
                                      <span key={i}>
                                        {b(it.name)}
                                        {i < top3Competitors.length - 1
                                          ? ", "
                                          : ""}
                                      </span>
                                    ))}
                                    .
                                  </>
                                )}
                                {top3Hyperscale.length > 0 && (
                                  <>
                                    {" "}
                                    Top hyperscale campus builds are
                                    concentrated in{" "}
                                    {top3Hyperscale.map((it, i) => (
                                      <span key={i}>
                                        {b(it.name)}
                                        {i < top3Hyperscale.length - 1
                                          ? ", "
                                          : ""}
                                      </span>
                                    ))}
                                    .
                                  </>
                                )}
                                {top3Cities.length > 0 && (
                                  <>
                                    {" "}
                                    At the Location level, leading markets
                                    include{" "}
                                    {top3Cities.map((c, i) => (
                                      <span key={i}>
                                        {b(c.name)} (
                                        {c.itLoadMW?.toLocaleString()} MW,{" "}
                                        {c.sites} sites)
                                        {i < top3Cities.length - 1 ? ", " : ""}
                                      </span>
                                    ))}
                                    .
                                  </>
                                )}
                                {top3Operators.length > 0 && (
                                  <>
                                    {" "}
                                    The dominant operators are{" "}
                                    {top3Operators.map((op, i) => (
                                      <span key={i}>
                                        {b(op.name)} with{" "}
                                        {op.marketSharePct?.toFixed(1)}% market
                                        share across {op.facilities} facilities
                                        {i < top3Operators.length - 1
                                          ? ", "
                                          : ""}
                                      </span>
                                    ))}
                                    .
                                  </>
                                )}
                                {marketLeader && (
                                  <>
                                    {" "}
                                    {b(marketLeader.label)} holds the largest
                                    market share at{" "}
                                    {b(`${marketLeader.value} MW`)}.
                                  </>
                                )}
                                {latestCapacity && (
                                  <>
                                    <br /> In {b(latestCapacity.period)},
                                    installed capacity reached{" "}
                                    {b(
                                      `${latestCapacity.capacity?.toLocaleString()} MW`,
                                    )}{" "}
                                    against an absorption of{" "}
                                    {b(
                                      `${latestCapacity.absorption?.toLocaleString()} MW`,
                                    )}
                                    .
                                  </>
                                )}
                                {latestSupply && (
                                  <>
                                    {" "}
                                    The {b(latestSupply.year)} supply mix:
                                    Hyperscale{" "}
                                    {b(
                                      latestSupply.hyperscale?.toLocaleString() ??
                                        "—",
                                    )}
                                    , Large{" "}
                                    {b(
                                      latestSupply.large?.toLocaleString() ??
                                        "—",
                                    )}
                                    , Medium{" "}
                                    {b(
                                      latestSupply.medium?.toLocaleString() ??
                                        "—",
                                    )}
                                    , Small{" "}
                                    {b(
                                      latestSupply.small?.toLocaleString() ??
                                        "—",
                                    )}{" "}
                                    MW.
                                  </>
                                )}
                                {typeTopSeg && (
                                  <>
                                    {" "}
                                    By type, {b(typeTopSeg.label)} dominates at{" "}
                                    {typeTopSeg.value} MW.
                                  </>
                                )}
                                {totalDCs > 0 && (
                                  <>
                                    {" "}
                                    The directory tracks{" "}
                                    {b(totalDCs.toLocaleString())} individual
                                    facilities
                                    {recentDCs.length > 0 && (
                                      <>
                                        , including{" "}
                                        {recentDCs.map((dc, i) => (
                                          <span key={i}>
                                            {b(dc.name + ", ")}
                                          </span>
                                        ))}
                                      </>
                                    )}
                                    .
                                  </>
                                )}
                              </p>
                            </div>
                          );
                        })()}

                      {/* Mobile filter + Export row (inside hero card) */}
                      {isMobile && (
                        <div
                          className="relative z-10 flex items-center gap-3 mt-2"
                          data-html2canvas-ignore="true"
                        >
                          <button
                            type="button"
                            onClick={() => setIsFilterOpen(true)}
                            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-colors text-gray-700"
                          >
                            <Filter className="w-5 h-5" />
                          </button>
                          {canExportPdf && (
                            <button
                              type="button"
                              onClick={() => void handleExportToPDF()}
                              disabled={isExportingPdf}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Download className="w-4 h-4" />
                              {isExportingPdf ? "Generating…" : "Export PDF"}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Desktop Filter Topbar — hidden on mobile/tablet */}
              <div
                data-html2canvas-ignore="true"
                className="hidden lg:block bg-white border border-gray-100 rounded-xl shadow-sm px-4 py-3 mt-4"
              >
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleClearFilters}
                  handleApplyFilters={handleApplyFilters}
                  activeSection={activeSection}
                  isMobile={false}
                />
              </div>

              {/* Errors */}
              {summaryError && (
                <p className="text-sm text-red-500 mt-2">
                  {summaryError.message ||
                    "Failed to load location intelligence summary"}
                </p>
              )}
              {rankingError && (
                <p className="text-sm text-red-500 mt-2">
                  {rankingError.message ||
                    "Failed to load location intelligence ranking"}
                </p>
              )}
              {capacityError && (
                <p className="text-sm text-red-500 mt-2">
                  {capacityError.message ||
                    "Failed to load location intelligence capacity"}
                </p>
              )}
              {cityWiseError && (
                <p className="text-sm text-red-500 mt-2">
                  {cityWiseError.message ||
                    "Failed to load location intelligence city-wise capacities"}
                </p>
              )}
              {competitionError && (
                <p className="text-sm text-red-500 mt-2">
                  {competitionError.message ||
                    "Failed to load location intelligence competition"}
                </p>
              )}
              {supplyError && (
                <p className="text-sm text-red-500 mt-2">
                  {supplyError.message ||
                    "Failed to load location intelligence supply"}
                </p>
              )}
              {dcError && (
                <p className="text-sm text-red-500 mt-2">
                  {dcError.message ||
                    "Failed to load location intelligence data centers"}
                </p>
              )}

              <KpiSection cards={summaryData?.cards} loading={summaryLoading} />
            </div>

            <div
              id="li-pdf-slide-2"
              data-li-pdf-slide="2"
              className="pdf-slide-li"
            >
              <RankingSection
                data={rankingData}
                loading={rankingLoading}
                exportLayout={pdfExportLayout}
                filters={appliedFilters}
              />
            </div>

            <div
              id="li-pdf-slide-3"
              data-li-pdf-slide="3"
              className="pdf-slide-li"
            >
              <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-5">
                <div className="">
                  <CapacitySection
                    data={capacityData}
                    loading={capacityLoading}
                    exportLayout={pdfExportLayout}
                  />
                </div>
              </section>
            </div>

            <div
              id="li-pdf-slide-4"
              data-li-pdf-slide="4"
              className="pdf-slide-li"
            >
              <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-5">
                <CityTableSection
                  data={cityWiseData}
                  loading={cityWiseLoading}
                  exportLayout={pdfExportLayout}
                  filters={appliedFilters}
                />
              </section>
            </div>

            <div
              id="li-pdf-slide-5"
              data-li-pdf-slide="5"
              className="pdf-slide-li"
            >
              <CompetitionSection
                data={competitionData}
                loading={competitionLoading}
                exportLayout={pdfExportLayout}
              />
            </div>

            <div
              id="li-pdf-slide-6"
              data-li-pdf-slide="6"
              className="pdf-slide-li"
            >
              <SupplySection
                data={supplyData}
                loading={supplyLoading}
                exportLayout={pdfExportLayout}
              />
              <DirectorySection
                data={dcData?.items || []}
                scopeValue={dcData?.scopeValue}
                loading={dcLoading}
                currentPage={currentPage}
                totalPages={dcData?.totalPages || 1}
                onPageChange={handleDirectoryPageChange}
                onApplyFilters={(filters) => {
                  setDirectoryFilters(filters);
                  setDirectoryTrigger((prev) => prev + 1);
                }}
                onResetFilters={() => {
                  setDirectoryFilters({ status: undefined, scale: undefined });
                  setDirectoryTrigger((prev) => prev + 1);
                }}
                exportLayout={pdfExportLayout}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
