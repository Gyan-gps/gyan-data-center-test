import React from "react";
import { PieChart, MultiLineChart } from "@/components/charts";
import { Zap, Globe, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import type {
  AnalyticsV2Summary,
  AnalyticsV2Charts,
  AnalyticsV2TopOperator,
} from "@/network/datacenter/datacenter.types";

// Color palette for charts
const CHART_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899",
  "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

const STATUS_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

interface AnalyticsContentProps {
  summary?: AnalyticsV2Summary;
  charts?: AnalyticsV2Charts;
  topOperators?: AnalyticsV2TopOperator[];
}

export const AnalyticsContent: React.FC<AnalyticsContentProps> = ({
  summary,
  charts,
  topOperators,
}) => {
  // No Data Component
  const NoDataMessage: React.FC<{ message?: string; icon?: string }> = ({
    message = "No Data Available",
    icon = "📊",
  }) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      <div className="text-3xl sm:text-4xl mb-2 opacity-60">{icon}</div>
      <p className="text-sm sm:text-base font-medium">{message}</p>
    </div>
  );

  // Loading skeleton
  const SectionSkeleton: React.FC<{ height?: string }> = ({ height = "h-[200px]" }) => (
    <Card>
      <CardContent className="p-4">
        <div className={`${height} bg-gray-100 animate-pulse rounded-lg`} />
      </CardContent>
    </Card>
  );

  // Pie chart tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0].payload;
    return (
      <div className="bg-white border rounded-lg shadow-md p-3">
        <p className="font-semibold text-sm">{entry.status}</p>
        <p className="text-xs text-gray-600">IT Load: {entry.itLoad.toLocaleString()} MW</p>
        <p className="text-xs text-gray-600">Share: {entry.percentage}%</p>
      </div>
    );
  };

  // Multi-line tooltips
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRegionalTooltip = (payload: any[], label: string) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 max-w-xs">
      <p className="font-semibold text-sm text-gray-700 mb-2">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-xs font-medium">
          {entry.name}: {Number(entry.value).toLocaleString()} MW
        </p>
      ))}
    </div>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTierTooltip = (payload: any[], label: string) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3">
      <p className="font-semibold text-sm text-gray-700 mb-1">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {Number(entry.value).toLocaleString()} facilities
        </p>
      ))}
    </div>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderSizeTooltip = (payload: any[], label: string) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 max-w-xs">
      <p className="font-semibold text-sm text-gray-700 mb-2">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-xs font-medium">
          {entry.name}: {Number(entry.value).toLocaleString()} MW
        </p>
      ))}
    </div>
  );

  return (
    <div className="py-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* ========== SUMMARY SECTION ========== */}
      {summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          {/* Column 1: Capacity Overview */}
          <Card className="h-full border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Total Capacity
                  </h3>
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-900">
                    {summary.itLoadBaseYear.toLocaleString()}
                    <span className="text-lg font-medium text-gray-500 ml-1">MW</span>
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    Current Installed ({summary.baseYear})
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">
                      2031 Forecast
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-indigo-600">
                      {summary.itLoad2031.toLocaleString()} MW
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">
                      CAGR (2016-{summary.baseYear})
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-emerald-600">
                      {summary.cagrHistorical}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">
                      CAGR ({summary.baseYear}-31)
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-violet-600">
                      {summary.cagrForecast}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Column 2: Market Presence */}
          <Card className="h-full border-l-4 border-l-teal-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Market Scope
                  </h3>
                  <div className="p-2 bg-teal-50 rounded-full">
                    <Globe className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-900">
                    {summary.countriesCovered}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    Countries Covered
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                      Facilities ({summary.baseYear})
                    </p>
                    <p className="text-lg font-semibold text-teal-600">
                      {summary.dcFacilitiesBaseYear.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                      Facilities (2031)
                    </p>
                    <p className="text-lg font-semibold text-emerald-600">
                      {summary.dcFacilities2031.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Column 3: Quarterly Growth */}
          <Card className="h-full border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Quarterly Momentum
                  </h3>
                  <div className="p-2 bg-orange-50 rounded-full">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Q3 -> Q4 */}
                  <div className="group relative flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-orange-100 hover:bg-orange-50/30 transition-colors cursor-default">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Q3 → Q4 {summary.baseYear}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Sequential Growth</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${summary.quarterlyGrowthQ3Q4.isPositive ? "text-green-600" : "text-red-500"}`}
                      >
                        {summary.quarterlyGrowthQ3Q4.isPositive ? "+" : ""}
                        {summary.quarterlyGrowthQ3Q4.percentage}%
                      </span>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl text-center">
                        <p className="font-semibold mb-1 text-gray-300">Net Change (IT Load)</p>
                        <p className="text-base font-bold text-white">
                          {summary.quarterlyGrowthQ3Q4.isPositive ? "+" : "-"}
                          {summary.quarterlyGrowthQ3Q4.absoluteValue.toLocaleString()} MW
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
                    </div>
                  </div>

                  {/* Q2 -> Q3 */}
                  <div className="group relative flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-orange-100 hover:bg-orange-50/30 transition-colors cursor-default">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Q2 → Q3 {summary.baseYear}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Sequential Growth</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${summary.quarterlyGrowthQ2Q3.isPositive ? "text-green-600" : "text-red-500"}`}
                      >
                        {summary.quarterlyGrowthQ2Q3.isPositive ? "+" : ""}
                        {summary.quarterlyGrowthQ2Q3.percentage}%
                      </span>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl text-center">
                        <p className="font-semibold mb-1 text-gray-300">Net Change (IT Load)</p>
                        <p className="text-base font-bold text-white">
                          {summary.quarterlyGrowthQ2Q3.isPositive ? "+" : "-"}
                          {summary.quarterlyGrowthQ2Q3.absoluteValue.toLocaleString()} MW
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          <SectionSkeleton height="h-[250px]" />
          <SectionSkeleton height="h-[250px]" />
          <SectionSkeleton height="h-[250px]" />
        </div>
      )}

      {/* ========== CHARTS SECTION ========== */}
      {
        charts ? (
          <>
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Pie Chart – Status Distribution */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">
                    Status Distribution – by IT Load Capacity (in %, By MW) – Base Year {new Date().getFullYear() - 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[250px] sm:h-[300px]">
                    {charts.statusPie.length === 0 ? (
                      <NoDataMessage message="No Status Data" icon="📊" />
                    ) : (
                      <PieChart
                        data={charts.statusPie}
                        dataKey="itLoad"
                        nameKey="status"
                        colors={STATUS_COLORS}
                        height={250}
                        renderTooltip={renderPieTooltip}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Regional Distribution */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">
                    Regional Distribution – by Total Installed IT Load Capacity (in MW)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px] sm:h-[350px]">
                    {charts.regionalDistribution.length === 0 ? (
                      <NoDataMessage message="No Regional Data" icon="🌍" />
                    ) : (
                      <MultiLineChart
                        data={charts.regionalDistribution}
                        xDataKey="period"
                        yAxisLabel="IT Load (MW)"
                        yAxisUnit=" MW"
                        lines={charts.regionalLines.map((key, i) => ({
                          dataKey: key,
                          color: CHART_COLORS[i % CHART_COLORS.length],
                          name: key,
                        }))}
                        height={350}
                        renderTooltip={renderRegionalTooltip}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Tier Distribution */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">
                    Tier Certification Distribution – by Data Center Facility
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px] sm:h-[350px]">
                    {charts.tierDistribution.length === 0 ? (
                      <NoDataMessage message="No Tier Data" icon="🏢" />
                    ) : (
                      <MultiLineChart
                        data={charts.tierDistribution}
                        xDataKey="year"
                        yAxisLabel="DC Facilities"
                        lines={charts.tierLines.map((key, i) => ({
                          dataKey: key,
                          color: CHART_COLORS[i % CHART_COLORS.length],
                          name: key,
                        }))}
                        height={350}
                        renderTooltip={renderTierTooltip}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Size Distribution */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">
                    Data Center Size Distribution – by IT Load Capacity (in MW)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[300px] sm:h-[350px]">
                    {charts.sizeDistribution.length === 0 ? (
                      <NoDataMessage message="No Tier Capacity Data" icon="⚡" />
                    ) : (
                      <MultiLineChart
                        data={charts.sizeDistribution}
                        xDataKey="period"
                        yAxisLabel="IT Load (MW)"
                        yAxisUnit=" MW"
                        lines={charts.sizeLines.map((key, i) => ({
                          dataKey: key,
                          color: CHART_COLORS[i % CHART_COLORS.length],
                          name: key,
                        }))}
                        height={350}
                        renderTooltip={renderSizeTooltip}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <SectionSkeleton height="h-[300px]" />
              <SectionSkeleton height="h-[350px]" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <SectionSkeleton height="h-[350px]" />
              <SectionSkeleton height="h-[350px]" />
            </div>
          </>
        )
      }

      {/* ========== TOP OPERATORS SECTION ========== */}
      {
        topOperators ? (
          topOperators.length > 0 && (
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">
                  Top Companies – by IT Load Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Operator</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">IT Load (MW)</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Market Share</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assets</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topOperators.map((op, i) => (
                        <tr key={op.operator} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-500 font-medium">{i + 1}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{op.operator}</td>
                          <td className="py-3 px-4 text-right text-blue-600 font-semibold">
                            {op.totalITLoad.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(op.marketShare, 100)}%` }}
                                />
                              </div>
                              <span className="text-gray-700 font-medium min-w-[40px] text-right">
                                {op.marketShare}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-700">{op.assetCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <SectionSkeleton height="h-[300px]" />
        )
      }
    </div >
  );
};
