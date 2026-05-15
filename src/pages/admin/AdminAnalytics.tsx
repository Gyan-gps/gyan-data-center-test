import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminAnalytics } from "@/network/admin/admin.api";
import { Loading } from "@/components/ui";
import { PieChart, StackedBarChart, LineChart } from "@/components/charts";
import { useAdminAnalyticsStore } from "@/store/adminAnalyticsStore";

interface AnalyticsData {
  LLM_category: Array<{ category: string; count: number }>;
  primary_region: Array<{ region: string; count: number }>;
  impact: Array<{ impact: string; count: number }>;
}

interface TimelineResponse {
  timeline: Array<{ day: number; count: number }>;
}

const AdminAnalytics: React.FC = () => {
  const {
    appliedStartDate,
    appliedEndDate,
    viewBy,
    selectedYear,
    selectedMonth,
    setState,
  } = useAdminAnalyticsStore();

  const [chartType, setChartType] = useState<"pie" | "stacked">("pie");

  // responsive flag
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", onResize);
      }
    };
  }, []);

  // ---------------- MAIN ANALYTICS QUERY ----------------
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics", appliedStartDate, appliedEndDate],
    queryFn: () =>
      fetchAdminAnalytics({
        startDate: appliedStartDate,
        endDate: appliedEndDate,
      }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ---------------- TIMELINE QUERY (SEPARATE) ----------------
  const { data: timelineDataRes, isLoading: isTimelineLoading } =
    useQuery<TimelineResponse>({
      queryKey: ["admin-timeline", selectedYear, selectedMonth],
      queryFn: () =>
        fetchAdminAnalytics({
          selectedYear,
          selectedMonth,
        }),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

  // ---------------- PIE + STACKED ----------------
  const chartItems = useMemo(() => {
    if (!data) return [];

    if (viewBy === "llm_category")
      return data.LLM_category.map((x) => ({
        name: x.category || "Unknown",
        value: x.count || 0,
      }));

    if (viewBy === "region")
      return data.primary_region.map((x) => ({
        name: x.region || "Unknown",
        value: x.count || 0,
      }));

    return data.impact.map((x) => ({
      name: x.impact || "Unknown",
      value: x.count || 0,
    }));
  }, [data, viewBy]);

  const totalBuckets = chartItems.length;
  const totalCount = chartItems.reduce((s, x) => s + x.value, 0);

  // Custom pie chart tooltip renderer
  const renderPieTooltip = (props: Record<string, unknown>) => {
    if (
      !props.active ||
      !props.payload ||
      !Array.isArray(props.payload) ||
      props.payload.length === 0
    ) {
      return null;
    }

    const value = props.payload[0].value as number;
    const name = props.payload[0].name as string;
    const percentage = totalCount ? Math.round((value / totalCount) * 100) : 0;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-blue-600 text-sm mt-1">{`Count: ${value}`}</p>
        <p className="text-gray-600 text-sm">{`${percentage}%`}</p>
      </div>
    );
  };

  // ---------------- TIMELINE TRANSFORM ----------------
  const timelineData = useMemo(() => {
    if (!timelineDataRes?.timeline) return [];
    return timelineDataRes.timeline.map((t) => ({
      day: t.day,
      value: t.count,
    }));
  }, [timelineDataRes]);

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-5">
      <h2 className="text-base sm:text-xl font-semibold text-gray-900">
        Analytics Dashboard
      </h2>

      {/* ================= DISTRIBUTION ================= */}
      <div className="bg-white rounded-lg shadow p-2 sm:p-5 space-y-2 sm:space-y-4">
        {/* HEADER: stats and controls inline on desktop, stacked on mobile */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {/* Controls on left for desktop, stacked first on mobile */}
            <div className="flex items-center gap-2 order-first sm:order-first">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as "pie" | "stacked")}
                className="border rounded px-2 py-1 text-[11px] sm:text-sm"
              >
                <option value="pie">Pie Chart</option>
                <option value="stacked">Stacked Column</option>
              </select>

              <select
                value={viewBy}
                onChange={(e) => setState({ viewBy: e.target.value as any })}
                className="border rounded px-2 py-1 text-[11px] sm:text-sm"
              >
                <option value="llm_category">LLM Category</option>
                <option value="region">Region</option>
                <option value="impact">Impact</option>
              </select>
            </div>

            {/* Stats to the right on desktop */}
            <div className="flex gap-3 sm:gap-6 items-start sm:items-center">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500">Total Categories</p>
                <p className="text-sm sm:text-lg font-semibold">{totalBuckets}</p>
              </div>

              <div>
                <p className="text-[10px] sm:text-xs text-gray-500">Total Count</p>
                <p className="text-sm sm:text-lg font-semibold">{totalCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CHART */}
        {isLoading ? (
          <Loading />
        ) : (
          <div>
            {chartType === "pie" ? (
              // PIE CHART - Centered, responsive height, custom mobile legend
              <div className="relative w-full flex flex-col items-center py-1 sm:py-4">
                <div className="h-32 w-full sm:h-72 sm:w-full flex items-center justify-center px-1 sm:px-0">
                  <div className="w-full max-w-[224px] sm:max-w-full">
                    <PieChart
                      data={chartItems}
                      dataKey="value"
                      nameKey="name"
                      height={isMobile ? 120 : 288}
                      outerRadius={isMobile ? 48 : undefined}
                      showLegend={!isMobile}
                      showTooltip
                      renderTooltip={renderPieTooltip}
                    />
                  </div>
                </div>

                {/* mobile legend: compact and scrollable if many items */}
                {isMobile && chartItems.length > 0 && (
                  <div className="mt-2 w-full px-4">
                    <div className="flex flex-col gap-2 text-[12px]">
                      {chartItems.map((it, idx) => {
                        const val = typeof it.value === 'number' ? it.value : Number(it.value || 0)
                        const pct = totalCount ? Math.round((val / totalCount) * 100) : 0
                        const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16']
                        return (
                          <div key={it.name + idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                              <span className="text-[13px] text-gray-700">{String(it.name)}</span>
                            </div>
                            <div className="text-[12px] text-gray-500">{pct}%</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // STACKED CHART - Scrollable on mobile only
              <div className={`relative ${isMobile ? 'overflow-x-auto -mx-2' : ''}`}>
                {/* Y AXIS LABEL (desktop only) */}
                <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-gray-500 whitespace-nowrap">
                  Tag Count
                </div>

                <div className={`${isMobile ? 'h-[220px] sm:h-72 min-w-[600px]' : 'h-40 sm:h-72 w-full sm:min-w-fit'} px-2 sm:px-0 sm:pl-8`}>
                  <StackedBarChart
                    data={chartItems}
                    xDataKey="name"
                    stackKeys={["value"]}
                    height={isMobile ? 220 : 300}
                  />
                </div>
              </div>
            )}

            {/* AXIS LABELS (mobile) */}
            {chartType === "stacked" && (
              <div className="sm:hidden mt-2 text-center text-[10px] font-medium text-gray-500">
                Scroll → Categories • Tag Count
              </div>
            )}

            {/* X AXIS LABEL (desktop) */}
            {chartType === "stacked" && (
              <div className="hidden sm:block mt-2 text-center text-xs font-semibold text-gray-500">
                Categories
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= TIMELINE ================= */}
      <div className="bg-white rounded-lg shadow p-2 sm:p-5 space-y-2 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <p className="font-semibold text-xs sm:text-base">
            Timeline ({selectedMonth}/{selectedYear})
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500">
            Number of news articles published per day in the selected month.
          </p>

          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <select
              value={selectedYear}
              onChange={(e) =>
                setState({ selectedYear: Number(e.target.value) })
              }
              className="border rounded px-2 py-1 text-[11px] sm:text-sm"
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) =>
                setState({ selectedMonth: Number(e.target.value) })
              }
              className="border rounded px-2 py-1 text-[11px] sm:text-sm"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isTimelineLoading ? (
          <Loading />
        ) : (
          <div className={`relative ${isMobile ? 'overflow-x-auto -mx-2' : ''}`}>
            {/* Y AXIS LABEL (desktop) */}
            <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-gray-500 whitespace-nowrap">
              News Count
            </div>

            <div className={`${isMobile ? 'h-[220px] sm:h-72 min-w-[600px]' : 'h-40 sm:h-72 w-full sm:min-w-fit'} px-2 sm:px-0 sm:pl-8`}>
              <LineChart
                data={timelineData}
                xDataKey="day"
                yDataKey="value"
                height={isMobile ? 220 : 300}
              />
            </div>

            {/* AXIS LABELS (mobile) */}
            <div className="sm:hidden mt-1 text-center text-[10px] font-medium text-gray-500">
              Scroll → Day of Month • News Count
            </div>

            {/* X AXIS LABEL (desktop) */}
            <div className="hidden sm:block mt-2 text-center text-xs font-semibold text-gray-500">
              Day of Month
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;