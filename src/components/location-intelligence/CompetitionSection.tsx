import React from "react";
import { DonutChart } from "@/components/charts/DonutChart";
import type { CompetitionOverview } from "@/network/location-intelligence/location-intelligence.types";

interface CompetitionSectionProps {
  data?: CompetitionOverview;
  loading?: boolean;
  exportLayout?: boolean;
}

const ChartPlaceholder: React.FC = () => (
  <div className="h-[200px] rounded-lg bg-gray-50 border border-gray-100 animate-pulse" />
);

const TablePlaceholder: React.FC = () => (
  <div className="p-4">
    <div className="h-8 bg-gray-100 rounded mb-3" />
    <div className="h-8 bg-gray-100 rounded mb-3" />
    <div className="h-8 bg-gray-100 rounded mb-3" />
    <div className="h-8 bg-gray-100 rounded" />
  </div>
);
const DataTable = ({
  data,
  unconstrained,
}: {
  data: { status: string; value: number; percentage: number }[];
  unconstrained?: boolean;
}) => (
  <div
    className={`overflow-auto w-full ${unconstrained ? "max-h-none" : "max-h-[200px]"}`}
  >
    <table className="w-full text-xs border border-gray-100 rounded-lg">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 py-2 text-left">Operator</th>
          <th className="px-3 py-2 text-left">Value</th>
          <th className="px-3 py-2 text-left">%</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-t">
            <td className="px-3 py-2">{row.status}</td>
            <td className="px-3 py-2">{row.value}</td>
            <td className="px-3 py-2">{row.percentage.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
export const CompetitionSection: React.FC<CompetitionSectionProps> = ({
  data,
  loading = false,
  exportLayout = false,
}) => {
  const rows = data?.table?.rows || [];
  //need to calculate percentage for status mix as it's not provided by API
  const totalMarketShareValue = (data?.marketShareDonut?.segments || []).reduce(
    (sum, segment) => sum + segment.value,
    0
  );
  const totalForecastValue = (data?.forecastDonut?.segments || []).reduce(
    (sum, segment) => sum + segment.value,
    0
  );
  console.log("sdfvgbhnjmk", data);
  const marketShareData = (data?.marketShareDonut?.segments || []).map(
    (segment) => ({
      status: segment.label,
      value: segment.value,
      percentage: totalMarketShareValue ? (segment.value / totalMarketShareValue) * 100 : 0,
    }),
  );
  const forecastData = (data?.forecastDonut?.segments || []).map((segment) => ({
    status: segment.label,
    value: segment.value,
    percentage: totalForecastValue ? (segment.value / totalForecastValue) * 100 : 0,
  }));
  const [marketView, setMarketView] = React.useState<"chart" | "table">("chart");
  const [forecastView, setForecastView] = React.useState<"chart" | "table">("chart");
  return (
    <section
      id="competition"
      className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-5"
    >
      <div className="px-4 py-3 border-b border-gray-50 flex items-start justify-between bg-gray-50/50">
        <div className="flex flex-col gap-0.5">
          <strong className="text-sm font-semibold text-gray-800">
            Competitive Landscape
          </strong>
          <span className="text-xs text-gray-400">
            Competitive Benchmarking and Market Positioning
          </span>
        </div>
      </div>
      <div
        className={`p-4 ${exportLayout ? "flex flex-col gap-6" : "grid gap-4 grid-cols-1 lg:grid-cols-3"}`}
      >
        {/* Top 10 table — 2 cols wide */}
        <div className={`bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm ${exportLayout ? "col-span-3" : "lg:col-span-2"}`}>
          <div className="px-4 py-3 border-b border-gray-50 flex items-start justify-between bg-gray-50/50">
            <div className="flex flex-col gap-0.5">
              <strong className="text-sm font-semibold text-gray-800">
                {data?.table?.title || "Top 10 Operators"}
              </strong>
              <span className="text-xs text-gray-400">
                {data?.table?.subtitle || "By total IT load MW"}
              </span>
            </div>
          </div>
          {loading ? (
            <TablePlaceholder />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    {[
                      "Rank",
                      "Operator",
                      "IT Load (MW)",
                      "Mkt Share",
                      "Active Facilities",
                      // "Cities",
                      // "Tier",
                      // "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-xs font-bold text-gray-400 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={`${row.rank}-${row.name}`}
                      className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg border border-gray-100 bg-blue-50 text-xs font-bold text-blue-600">
                          {row.rank}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-800">
                        {row.name}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">
                        {row.itLoadMW.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">
                        {row.marketSharePct.toFixed(0)}%
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">
                        {row.facilities}
                      </td>
                      {/* <td className="px-4 py-2.5 text-sm text-gray-600">
                        {row.cities}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">
                        {row.tier}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border border-gray-100 ${row.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full inline-block ${row.status === "Active" ? "bg-green-500" : "bg-red-500"}`}
                          />
                          {row.status}
                        </span>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pies */}
        <div className={`${exportLayout ? "col-span-3 grid grid-cols-2 gap-4" : "flex flex-col gap-4"}`}>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div>
                <strong className="text-sm font-semibold text-gray-800">
                  {data?.marketShareDonut?.title || "Market Share by Operator"}
                </strong>
                <span className="block text-xs text-gray-400">
                  {data?.marketShareDonut?.subtitle || "Top 5 + Others"}
                </span>
              </div>

              {!exportLayout && (
                <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
                  <button type="button" onClick={() => setMarketView("chart")} className={marketView === "chart" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                    Chart
                  </button>
                  <button type="button" onClick={() => setMarketView("table")} className={marketView === "table" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                    Table
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              {loading ? (
                <ChartPlaceholder />
              ) : exportLayout ? (
                <div className="space-y-6">
                  <DonutChart
                    data={marketShareData}
                    dataKey="value"
                    nameKey="status"
                    height={200}
                  />
                  <div className="border-t border-gray-100 pt-6">
                    <DataTable unconstrained data={marketShareData} />
                  </div>
                </div>
              ) : marketView === "chart" ? (
                <DonutChart
                  data={marketShareData}
                  dataKey="value"
                  nameKey="status"
                  height={200}
                />
              ) : (
                <DataTable data={marketShareData} />
              )}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div>
                <strong className="text-sm font-semibold text-gray-800">
                  {data?.forecastDonut?.title || "2031 Forecast by Operator"}
                </strong>
                <span className="block text-xs text-gray-400">
                  {data?.forecastDonut?.subtitle ||
                    "Top 5 + Others — IT load till 2031"}
                </span>
              </div>

              {!exportLayout && (
                <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
                  <button type="button" onClick={() => setForecastView("chart")} className={forecastView === "chart" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                    Chart
                  </button>
                  <button type="button" onClick={() => setForecastView("table")} className={forecastView === "table" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                    Table
                  </button>
                </div>
              )}
            </div>

            <div className="p-4">
              {loading ? (
                <ChartPlaceholder />
              ) : exportLayout ? (
                <div className="space-y-6">
                  <DonutChart
                    data={forecastData}
                    dataKey="value"
                    nameKey="status"
                    height={200}
                  />
                  <div className="border-t border-gray-100 pt-6">
                    <DataTable unconstrained data={forecastData} />
                  </div>
                </div>
              ) : forecastView === "chart" ? (
                <DonutChart
                  data={forecastData}
                  dataKey="value"
                  nameKey="status"
                  height={200}
                />
              ) : (
                <DataTable data={forecastData} />
              )}
            </div>
          </div>
        </div>
      </div>

      {!loading &&
        data &&
        rows.length === 0 &&
        marketShareData.length === 0 &&
        forecastData.length === 0 && (
          <div className="px-4 pb-4 text-sm text-gray-500">
            No competition data found for selected filters.
          </div>
        )}
    </section>
  );
};
