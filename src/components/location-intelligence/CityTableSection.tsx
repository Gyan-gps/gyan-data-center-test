import React from "react";
import { DonutChart } from "@/components/charts/DonutChart";
import type { CityWiseCapacities } from "@/network/location-intelligence/location-intelligence.types";

interface CityTableSectionProps {
  data?: CityWiseCapacities;
  loading?: boolean;
  exportLayout?: boolean;
  filters?: { regions?: string[]; countries?: string[]; cities?: string[] };
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

const dotColor: Record<string, string> = {
  good: "bg-green-500",
  warn: "bg-amber-400",
  gray: "bg-gray-300",
};

const getGrowthLevel = (growthPct: number) => {
  if (growthPct >= 5) return "good";
  if (growthPct >= 2) return "warn";
  return "gray";
};

const formatGrowth = (growthPct: number) =>
  `${growthPct >= 0 ? "+" : ""}${growthPct.toFixed(0)}%`;

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
          <th className="px-3 py-2 text-left">Type</th>
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
export const CityTableSection: React.FC<CityTableSectionProps> = ({
  data,
  loading = false,
  exportLayout = false,
  filters,
}) => {
  const rows = data?.table?.rows || [];
  //need to calculate percentage for status mix as it's not provided by API
  const totalStatusValue = (data?.statusMix?.segments || []).reduce(
    (sum, segment) => sum + segment.value,
    0
  );
  const totaltypeValue = (data?.typeMix?.segments || []).reduce(
    (sum, segment) => sum + segment.value,
    0
  );

  const statusData = (data?.statusMix?.segments || []).map((segment) => ({
    status: segment.label,
    value: segment.value,
    percentage: totalStatusValue ? (segment.value / totalStatusValue) * 100 : 0,
  }));
  const typeData = (data?.typeMix?.segments || []).map((segment) => ({
    status: segment.label,
    value: segment.value,
    percentage: totaltypeValue ? (segment.value / totaltypeValue) * 100 : 0,
  }));
  const showtable = data?.scope === "cities";
  const [statusView, setStatusView] = React.useState<"chart" | "table">("chart");
  const [typeView, setTypeView] = React.useState<"chart" | "table">("chart");

  let capacityTitle = "City Capacity Table";
  let capacitySubtitle = "Top 6 cities — MW, NRC, # facilities, YoY growth";

  if (!(filters?.regions?.length) && !(filters?.countries?.length)) {
    capacityTitle = "Region Capacity Table";
    capacitySubtitle = "Top 6 regions — MW, NRC, # facilities, YoY growth";
  } else if ((filters?.regions?.length ?? 0) > 0 && !(filters?.countries?.length)) {
    capacityTitle = "Country Capacity Table";
    capacitySubtitle = "Top 6 countries — MW, NRC, # facilities, YoY growth";
  } else if ((filters?.countries?.length ?? 0) > 0) {
    capacityTitle = "City Capacity Table";
    capacitySubtitle = "Top 6 cities — MW, NRC, # facilities, YoY growth";
  }

  return (
    <section
      id="citytable"
className="bg-transparent border-0 shadow-none rounded-none overflow-hidden"    >
    
      <div className="p-4">
        <div
          className={`grid gap-4 ${
            !showtable
              ? "grid-cols-1 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {/* Table — takes 2 cols */}
          {!showtable && ( <div className={`bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm ${exportLayout ? "col-span-3": "lg:col-span-2"}`}>
            <div className="px-4 py-3 border-b border-gray-50 flex items-start justify-between bg-gray-50/50">
              <div className="flex flex-col gap-0.5">
                <strong className="text-sm font-semibold text-gray-800">
                  {data?.table.title || capacityTitle}
                </strong>
                <span className="text-xs text-gray-400">
                  {data?.table.subtitle || capacitySubtitle}
                </span>
              </div>
            </div>
            {loading ? (
              <TablePlaceholder />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px]">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      {[
                        "Rank",
                        "Name",
                        "IT Load (MW)",
                        "NRC",
                        "# Sites",
                        "Growth",
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
                    {rows.map((row) => {
                      const level = getGrowthLevel(row.growthPct);
                      return (
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
                            {row.nrcSqFt.toLocaleString()} sq ft
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">
                            {row.sites}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border border-gray-100 bg-gray-50">
                              <span
                                className={`w-1.5 h-1.5 rounded-full inline-block ${dotColor[level]}`}
                              />
                              {formatGrowth(row.growthPct)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>)}

          {/* Pie charts stacked */}
          <div
            className={`gap-4 ${
              exportLayout
                ? "col-span-3 grid grid-cols-2 gap-4"
                : !showtable
                  ? "flex flex-col"
                  : "grid grid-cols-1 md:grid-cols-2 justify-center"
            }`}
          >
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <strong className="text-sm font-semibold text-gray-800">
                    {data?.statusMix?.title || "Status Mix"}
                  </strong>
                  <span className="block text-xs text-gray-400">
                    {data?.statusMix?.subtitle || "Capacity mix by status"}
                  </span>
                </div>

                {!exportLayout && (
                  <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
                    <button type="button" onClick={() => setStatusView("chart")} className={statusView === "chart" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                      Chart
                    </button>
                    <button type="button" onClick={() => setStatusView("table")} className={statusView === "table" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                      Table
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col items-center">
                {loading ? (
                  <ChartPlaceholder />
                ) : exportLayout ? (
                  <div className="w-full space-y-6">
                    <div className={`flex flex-col items-center ${!showtable ? "" : "w-full max-w-md mx-auto"}`}>
                      <DonutChart
                        data={statusData}
                        dataKey="value"
                        nameKey="status"
                        height={180}
                      />
                    </div>
                    <div className="border-t border-gray-100 pt-6 w-full">
                      <DataTable unconstrained data={statusData} />
                    </div>
                  </div>
                ) : statusView === "chart" ? (
                  <div className={`${!showtable ? "" : "w-full max-w-md"}`}>
                    <DonutChart
                      data={statusData}
                      dataKey="value"
                      nameKey="status"
                      height={180}
                    />
                  </div>
                ) : (
                  <DataTable data={statusData} />
                )}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <strong className="text-sm font-semibold text-gray-800">
                    {data?.typeMix?.title || "Type Mix"}
                  </strong>
                  <span className="block text-xs text-gray-400">
                    {data?.typeMix?.subtitle || "Capacity mix by type"}
                  </span>
                </div>

                {!exportLayout && (
                  <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
                    <button type="button" onClick={() => setTypeView("chart")} className={typeView === "chart" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                      Chart
                    </button>
                    <button type="button" onClick={() => setTypeView("table")} className={typeView === "table" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                      Table
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4">
                {loading ? (
                  <ChartPlaceholder />
                ) : exportLayout ? (
                  <div className="w-full space-y-6">
                    <div className={`${!showtable ? "" : "w-full max-w-md mx-auto"}`}>
                      <DonutChart
                        data={typeData}
                        dataKey="value"
                        nameKey="status"
                        height={180}
                      />
                    </div>
                    <div className="border-t border-gray-100 pt-6">
                      <DataTable unconstrained data={typeData} />
                    </div>
                  </div>
                ) : typeView === "chart" ? (
                  <div className={`${!showtable ? "" : "w-full max-w-md"}`}>
                    <DonutChart
                      data={typeData}
                      dataKey="value"
                      nameKey="status"
                      height={180}
                    />
                  </div>
                ) : (
                  <DataTable data={typeData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!loading &&
        data &&
        rows.length === 0 &&
        statusData.length === 0 &&
        typeData.length === 0 && (
          <div className="px-4 pb-4 text-sm text-gray-500">
            No city-wise capacity data found for selected filters.
          </div>
        )}
    </section>
  );
};
