import React from "react";
import { StackedBarChart } from "@/components/charts/StackedBarChart"
import type { SupplyOverview } from "@/network/location-intelligence/location-intelligence.types";


interface TableProps {
  data: Record<string, unknown>[];
  columns: { key: string; label: string }[];
  unconstrained?: boolean;
}

const DataTable: React.FC<TableProps> = ({ data, columns, unconstrained }) => {
  if (!data.length) return <div className="text-sm text-gray-400">No data</div>;

  return (
    <div
      className={`overflow-auto ${unconstrained ? "max-h-none" : "max-h-[300px]"}`}
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
                  {String(row[col.key] ?? "")}
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
  <div className="h-[220px] rounded-lg bg-gray-50 border border-gray-100 animate-pulse" />
);

export const SupplySection: React.FC<{
  data?: SupplyOverview;
  loading?: boolean;
  exportLayout?: boolean;
}> = ({ data, loading, exportLayout = false }) => {
  const [sizeView, setSizeView] = React.useState<"chart" | "table">("chart");
  const [tierView, setTierView] = React.useState<"chart" | "table">("chart");
  const sizeRows = (data?.supplyBySize.data || []) as unknown as Record<string, unknown>[];
  const tierRows = (data?.supplyByTier.data || []) as unknown as Record<string, unknown>[];
  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-5">
      <div className="px-4 py-3 border-b border-gray-50 flex items-start justify-between bg-gray-50/50">
        <div className="flex flex-col gap-0.5">
          <strong className="text-sm font-semibold text-gray-800">Data Center Supply Footprint</strong>
          <span className="text-xs text-gray-400">A Forward-Looking Market Estimation by Category</span>
        </div>

      </div>
      <div
        className={`p-4 ${exportLayout ? "grid grid-cols-2 gap-4" : "grid gap-4 grid-cols-1 md:grid-cols-2"}`}
      >
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex flex-col gap-0.5">
              <strong className="text-sm font-semibold text-gray-800">Market Projections by Size of Data Center</strong>
              <span className="text-xs text-gray-400">Total Installed IT Load Capacity, By Data Center Size, {data?.scopeValue}, in MW, 2021-2031</span>
            </div>

            {!exportLayout && (
              <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
                <button type="button" onClick={() => setSizeView("chart")} className={sizeView === "chart" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                  Chart
                </button>
                <button type="button" onClick={() => setSizeView("table")} className={sizeView === "table" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
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
                <StackedBarChart
                  data={data?.supplyBySize.data as unknown as Record<string, unknown>[] || []}
                  xDataKey="period"
                  stackKeys={["hyperscale", "large", "medium", "small"]}
                  colors={["#3b82f6", "#64748b", "#94a3b8", "#e2e8f0"]}
                  height={300}
                />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#3b82f6" }} />
                    <span className="text-sm text-gray-600">Hyperscale</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#64748b" }} />
                    <span className="text-sm text-gray-600">Large</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#94a3b8" }} />
                    <span className="text-sm text-gray-600">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#e2e8f0" }} />
                    <span className="text-sm text-gray-600">Small</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-6">
                  <DataTable
                    unconstrained
                    data={sizeRows}
                    columns={[
                      { key: "period", label: "Year" },
                      { key: "hyperscale", label: "Hyperscale" },
                      { key: "large", label: "Large" },
                      { key: "medium", label: "Medium" },
                      { key: "small", label: "Small" },
                    ]}
                  />
                </div>
              </div>
            ) : sizeView === "chart" ? (
              <StackedBarChart
                data={data?.supplyBySize.data as unknown as Record<string, unknown>[] || []}
                xDataKey="period"
                stackKeys={["hyperscale", "large", "medium", "small"]}
                colors={["#3b82f6", "#64748b", "#94a3b8", "#e2e8f0"]}
                height={300}
              />
            ) : (
              <DataTable
                data={sizeRows}
                columns={[
                  { key: "period", label: "Year" },
                  { key: "hyperscale", label: "Hyperscale" },
                  { key: "large", label: "Large" },
                  { key: "medium", label: "Medium" },
                  { key: "small", label: "Small" },
                ]}
              />
            )}

          </div>
          {!exportLayout && (
          <div className="px-4 py-2 border-t border-gray-50 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#3b82f6" }} />
              <span className="text-sm text-gray-600">Hyperscale</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#64748b" }} />
              <span className="text-sm text-gray-600">Large</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#94a3b8" }} />
              <span className="text-sm text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#e2e8f0" }} />
              <span className="text-sm text-gray-600">Small</span>
            </div>
          </div>
          )}
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex flex-col gap-0.5">
              <strong className="text-sm font-semibold text-gray-800">Market Projections by Tier Certification of Data Center</strong>
              <span className="text-xs text-gray-400">Total Installed IT Load Capacity, By Tier Certification, {data?.scopeValue}, in MW, 2021-2031</span>
            </div>

            {!exportLayout && (
              <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
                <button type="button" onClick={() => setTierView("chart")} className={tierView === "chart" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
                  Chart
                </button>
                <button type="button" onClick={() => setTierView("table")} className={tierView === "table" ? "bg-white px-2 py-1 rounded shadow" : "px-2 py-1"}>
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
                <StackedBarChart
                  data={data?.supplyByTier.data as unknown as Record<string, unknown>[] || []}
                  xDataKey="period"
                  stackKeys={["tier1", "tier2", "tier3", "tier4"]}
                  colors={["#3b82f6", "#94a3b8", "#cbd5e1", "#e2e8f0"]}
                  height={300}
                />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#3b82f6" }} />
                    <span className="text-sm text-gray-600">Tier I</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#94a3b8" }} />
                    <span className="text-sm text-gray-600">Tier II</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#cbd5e1" }} />
                    <span className="text-sm text-gray-600">Tier III</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: "#e2e8f0" }} />
                    <span className="text-sm text-gray-600">Tier IV</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-6">
                  <DataTable
                    unconstrained
                    data={tierRows}
                    columns={[
                      { key: "period", label: "Year" },
                      { key: "tier1", label: "Tier 1" },
                      { key: "tier2", label: "Tier 2" },
                      { key: "tier3", label: "Tier 3" },
                      { key: "tier4", label: "Tier 4" },
                    ]}
                  />
                </div>
              </div>
            ) : tierView === "chart" ? (
              <StackedBarChart
                data={data?.supplyByTier.data as unknown as Record<string, unknown>[] || []}
                xDataKey="period"
                stackKeys={["tier1", "tier2", "tier3", "tier4"]}
                colors={["#3b82f6", "#94a3b8", "#cbd5e1", "#e2e8f0"]}
                height={300}
              />
            ) : (
              <DataTable
                data={tierRows}
                columns={[
                  { key: "period", label: "Year" },
                  { key: "tier1", label: "Tier 1" },
                  { key: "tier2", label: "Tier 2" },
                  { key: "tier3", label: "Tier 3" },
                  { key: "tier4", label: "Tier 4" },
                ]}
              />
            )}
          </div>
          {!exportLayout && (
          <div className="px-4 py-2 border-t border-gray-50 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#3b82f6" }} />
              <span className="text-sm text-gray-600">Tier I</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#94a3b8" }} />
              <span className="text-sm text-gray-600">Tier II</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#cbd5e1" }} />
              <span className="text-sm text-gray-600">Tier III</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: "#e2e8f0" }} />
              <span className="text-sm text-gray-600">Tier IV</span>
            </div>
          </div>
          )}
        </div>
      </div>

    </section>
  );
}