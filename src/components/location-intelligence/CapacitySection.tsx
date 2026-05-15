import React from "react";
import { BarChart } from "@/components/charts/BarChart";
import { BarandLineChart } from "@/components/charts/BarandLineChart";
import type { CapacityOverview } from "@/network/location-intelligence/location-intelligence.types";

interface CapacitySectionProps {
  data?: CapacityOverview;
  loading?: boolean;
  exportLayout?: boolean;
}
interface TableProps {
  data: Record<string, unknown>[];
  columns: { key: string; label: string; suffix?: string }[];
  unconstrained?: boolean;
}

const DataTable: React.FC<TableProps> = ({
  data,
  columns,
  unconstrained,
}) => {
  if (!data.length) return <div className="text-sm text-gray-400">No data</div>;

  return (
    <div
      className={`overflow-auto ${unconstrained ? "max-h-none" : "max-h-[240px]"}`}
    >
      <table className="w-full text-xs border border-gray-100 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 text-left text-gray-500">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2">
                  {String(row[col.key] ?? "")} {col.suffix || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
const ChartPlaceholder: React.FC = () => (
  <div className="h-[240px] rounded-lg bg-gray-50 border border-gray-100 animate-pulse" />
);

export const CapacitySection: React.FC<CapacitySectionProps> = ({
  data,
  loading = false,
  exportLayout = false,
}) => {
  const capacityData = (data?.capacityVsAbsorption?.data ||
    []) as unknown as Record<string, unknown>[];
  const nrcData = (data?.yoyNRC?.data || []).map((item) => ({
    year: item.year,
    nrc: parseFloat((item.nrc / 1000).toFixed(2)),   // converting to thousand sq. ft.
  }));
  const [capacityView, setCapacityView] = React.useState<"chart" | "table">("chart");
  const [nrcView, setNrcView] = React.useState<"chart" | "table">("chart");
  return (
    <section
      id="capacity"
      className="bg-transparent border-0 shadow-none rounded-none overflow-hidden"    >
      <div className="px-4 py-3 border-b border-gray-50 flex items-start justify-between bg-gray-50/50">
        <div className="flex flex-col gap-0.5">
          <strong className="text-sm font-semibold text-gray-800">
           Market Capacity Footprint and Geographic Positioning
          </strong>
          <span className="text-xs text-gray-400">
            A Forward-Looking Market Estimation and Capacity Distribution
          </span>
        </div>
      </div>
      <div
        className={`p-4 ${exportLayout ? "grid grid-cols-2 gap-4" : "grid gap-4 grid-cols-1 md:grid-cols-2"}`}
      >
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex flex-col gap-0.5">
              <strong className="text-sm font-semibold text-gray-800">
                {data?.capacityVsAbsorption?.title || "YoY MW Capacity vs Absorption"}
              </strong>
              <span className="text-xs text-gray-400">
                {data?.capacityVsAbsorption?.subtitle ||
                  "Column= Installed IT Load. Line= Utilized IT Load "}
              </span>
            </div>

            {!exportLayout && (
              <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
                <button type="button" onClick={() => setCapacityView("chart")} className={capacityView === "chart" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                  Chart
                </button>
                <button type="button" onClick={() => setCapacityView("table")} className={capacityView === "table" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
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
                <BarandLineChart
                  data={capacityData}
                  xDataKey="period"
                  yDataKey="capacity"
                  tooltipFields={[
                    { key: "absorption", label: "Utilized IT Load", color: "#4a90e2", suffix: " MW" },
                    { key: "capacity", label: "Installed IT Load", color: "#6b7280", suffix: " MW" },
                  ]}
                />
                <div className="border-t border-gray-100 pt-6">
                  <DataTable
                    unconstrained
                    data={capacityData}
                    columns={[
                      { key: "period", label: "Year" },
                      { key: "capacity", label: "Installed", suffix: "MW" },
                      { key: "absorption", label: "Utilized", suffix: "MW" },
                    ]}
                  />
                </div>
              </div>
            ) : capacityView === "chart" ? (
              <BarandLineChart
                data={capacityData}
                xDataKey="period"
                yDataKey="capacity"
                tooltipFields={[
                  { key: "absorption", label: "Utilized IT Load", color: "#4a90e2", suffix: " MW" },
                  { key: "capacity", label: "Installed IT Load", color: "#6b7280", suffix: " MW" },
                ]}
              />
            ) : (
              <DataTable
                data={capacityData}
                columns={[
                  { key: "period", label: "Year" },
                  { key: "capacity", label: "Installed", suffix: "MW" },
                  { key: "absorption", label: "Utilized", suffix: "MW" },
                ]}
              />
            )}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex flex-col gap-0.5">
              <strong className="text-sm font-semibold text-gray-800">
                {data?.yoyNRC?.title || "YoY NRC"}
              </strong>
              <span className="text-xs text-gray-400">
                {data?.yoyNRC?.subtitle || "Net Rentable Capacity in Thousand sq. ft."}
              </span>
            </div>

            {!exportLayout && (
              <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
                <button type="button" onClick={() => setNrcView("chart")} className={nrcView === "chart" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                  Chart
                </button>
                <button type="button" onClick={() => setNrcView("table")} className={nrcView === "table" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
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
                <BarChart
                  data={nrcData}
                  xDataKey="year"
                  yDataKey="nrc"
                  height={240}
                  tooltipFields={[
                    { key: "nrc", label: "NRC", color: "#4a90e2", suffix: " K Sq. Ft" },
                  ]}
                />
                <div className="border-t border-gray-100 pt-6">
                  <DataTable
                    unconstrained
                    data={nrcData as unknown as Record<string, unknown>[]}
                    columns={[
                      { key: "year", label: "Year" },
                      { key: "nrc", label: "NRC", suffix: "K Sq. Ft" },
                    ]}
                  />
                </div>
              </div>
            ) : nrcView === "chart" ? (
              <BarChart
                data={nrcData}
                xDataKey="year"
                yDataKey="nrc"
                height={240}
                tooltipFields={[
                  { key: "nrc", label: "NRC", color: "#4a90e2", suffix: " K Sq. Ft" },
                ]}
              />
            ) : (
              <DataTable
                data={nrcData as unknown as Record<string, unknown>[]}
                columns={[
                  { key: "year", label: "Year" },
                  { key: "nrc", label: "NRC", suffix: "K Sq. Ft" },
                ]}
              />
            )}
          </div>
        </div>
      </div>

      {!loading &&
        data &&
        capacityData.length === 0 &&
        nrcData.length === 0 && (
          <div className="px-4 pb-4 text-sm text-gray-500">
            No capacity data found for selected filters.
          </div>
        )}
    </section>
  );
};
