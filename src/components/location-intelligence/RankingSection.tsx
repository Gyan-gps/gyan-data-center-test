import React from "react";
import { BarChart } from "@/components/charts/BarChart";
import type { RankingOverview } from "@/network/location-intelligence/location-intelligence.types";
import { TrophyInfographic } from "./RankingInfographics";
import {MountainInfographic} from "./MountainInfographic";
interface TableProps {
  data: BarData[];
  columns: { key: keyof BarData; label: string; suffix?: string }[];
}

const DataTable: React.FC<TableProps & { unconstrained?: boolean }> = ({
  data,
  columns,
  unconstrained,
}) => {
  if (!data.length) return <NoData />;

  return (
    <div
      className={`overflow-auto ${unconstrained ? "max-h-none" : "max-h-[220px]"}`}
    >
      <table className="w-full text-xs border border-gray-100 rounded-lg overflow-hidden">
       
        <thead className="bg-gray-50 sticky top-0">
          
          <tr>
            
          <th key="rank" className="px-3 py-2 text-left text-gray-500 font-medium">
            Rank
          </th>
        
            {columns.map((col) => (
              <th key={col.key as string} className="px-3 py-2 text-left text-gray-500 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
          
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-gray-100">
              <td key="rank" className="px-3 py-2 text-gray-700">
                {i + 1}
              </td>
              {columns.map((col) => (
                <td key={col.key as string} className="px-3 py-2 text-gray-700">
                  {row[col.key] ?? "-"} {col.suffix || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
interface BarData {
  [key: string]: string | number | undefined;
  label: string;
  value: number;
  sites?: number; // for top locations tooltip
  site?: string; // for top hyperscale tooltip
  status?: string; // for top hyperscale tooltip
}

interface RankingSectionProps {
  data?: RankingOverview;
  loading?: boolean;
  exportLayout?: boolean;
  filters?: { regions?: string[]; countries?: string[]; cities?: string[] };
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  exportLayout?: boolean;
  children: (view: "chart" | "table") => React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  exportLayout,
  children,
}) => {
  const [view, setView] = React.useState<"chart" | "table">("chart");

  if (exportLayout) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex flex-col gap-0.5">
            <strong className="text-sm font-semibold text-gray-800">
              {title}
            </strong>
            <span className="text-xs text-gray-400">{subtitle}</span>
          </div>
        </div>
        <div className="p-4 space-y-6">
          {children("chart")}
          <div className="border-t border-gray-100 pt-6">{children("table")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-visible shadow-sm">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div className="flex flex-col gap-0.5">
          <strong className="text-sm font-semibold text-gray-800">{title}</strong>
          <span className="text-xs text-gray-400">{subtitle}</span>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
          <button
            type="button"
            onClick={() => setView("chart")}
            className={`px-2 py-1 rounded-md ${view === "chart" ? "bg-white shadow text-gray-800" : "text-gray-500"
              }`}
          >
            Graph
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={`px-2 py-1 rounded-md ${view === "table" ? "bg-white shadow text-gray-800" : "text-gray-500"
              }`}
          >
            Table
          </button>
        </div>
      </div>

      <div className="p-4">{children(view)}</div>
    </div>
  );
};

const toBarData = (items?: { name: string; value: number; sites?: number; site?: string; status?: string }[]): BarData[] =>
  (items || []).map((item, index) => ({
    label: item.name,
    uniqueKey: `${item.name}__${index}`,
    value: Number(item.value || 0),
    sites: Number(item.sites || 0), // for tooltip in top locations
    site: item.site, // for tooltip in top hyperscale
    status: item.status || "Unknown Status", // for tooltip in top hyperscale
    rank: index + 1, // for ranking badge in tooltip
  }));

const ChartPlaceholder: React.FC = () => (
  <div className="h-[220px] rounded-lg bg-gray-50 border border-gray-100 animate-pulse" />
);
const NoData: React.FC = () => (
  <div className="h-[220px] flex items-center justify-center text-sm text-gray-400 border border-gray-100 rounded-lg bg-gray-50">
    No data found
  </div>
);

export const RankingSection: React.FC<RankingSectionProps> = ({
  data,
  loading = false,
  exportLayout = false,
  filters,
}) => {
  const topLocations = toBarData(data?.topLocations.items);
  const topCompetition = toBarData(data?.topCompetition.items);
  const topHyperscale = toBarData(data?.topHyperscale.items);
  const topOpportunities = toBarData(data?.topOpportunities.items);
  // Show graphs only if not at cities level
  const showgraphs = data?.scope === "cities" || filters?.cities?.length;

  let locationTitle = "Leading Data Center Markets";
  if (!(filters?.regions?.length) && !(filters?.countries?.length)) {
    locationTitle = "Leading Regions";
  } else if ((filters?.regions?.length ?? 0) > 0 && !(filters?.countries?.length)) {
    locationTitle = "Leading Countries";
  } else if ((filters?.countries?.length ?? 0) > 0) {
    locationTitle = "Leading Cities";
  }

  return (
    <section
      id="ranking"
      className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-visible mt-5"
    >
      <div className="px-4 py-3 border-b border-gray-50 flex items-start justify-between bg-gray-50/50">
        <div className="flex flex-col gap-0.5">
          <strong className="text-sm font-semibold text-gray-800">
            Leadership Dashboard
          </strong>
          <span className="text-xs text-gray-400">
            Leading Data Center Market, Top Competitors, Hyperscale Projects and Potential Upcoming Markets
          </span>
        </div>
      </div>
      <div
        className={`p-4 ${exportLayout ? "grid grid-cols-2 gap-4" : "grid gap-4 grid-cols-1 md:grid-cols-2"}`}
      >
        {!showgraphs && (
          <ChartCard
            title={locationTitle}
            subtitle={`${data?.topLocations.subtitle || "Market Ranking, By Installed IT Load Capacity, in MW"}`}
          >
            {(view) =>
              loading ? (
                <ChartPlaceholder />
              ) : view === "chart" ? (
                // <BarChart
                //   data={topLocations}
                //   xDataKey="uniqueKey"
                //   yDataKey="value"
                //   height={220}
                //   tooltipFields={[
                //     { key: "value", label: "Capacity", color: "#4a90e2", suffix: " MW" },
                //     { key: "sites", label: "Sites", color: "#6b7280" },
                //   ]}
                //   ranked={true}
                // />
                <TrophyInfographic
                  data={topLocations}
                  tooltipFields={[
                    { key: "value", label: "Capacity", color: "#4a90e2", suffix: " MW" },
                    { key: "sites", label: "Sites", color: "#6b7280" },
                  ]}
                />
              ) : (
                <DataTable
                  unconstrained={exportLayout}
                  data={topLocations}
                  columns={[
                    { key: "label", label: "Location" },
                    { key: "value", label: "Capacity", suffix: "MW" },
                    { key: "sites", label: "Sites" },
                  ]}
                />
              )
            }
          </ChartCard>
        )}
        <ChartCard
          title={data?.topCompetition.title || "Leading Competitors"}
          subtitle={`${data?.topCompetition.subtitle || "Competitors Ranking, By Installed IT Load Capacity, in MW, Base(Yr)"}`}
        >
          {(view) =>
            loading ? (
              <ChartPlaceholder />
            ) : view === "chart" ? (
              // <BarChart
              //   data={topCompetition}
              //   xDataKey="uniqueKey"
              //   yDataKey="value"
              //   height={220}
              //   tooltipFields={[
              //     { key: "value", label: "Capacity", color: "#4a90e2", suffix: " MW" },
              //     { key: "sites", label: "Sites", color: "#6b7280" },
              //   ]}
              //   ranked={true}
              // />
                <MountainInfographic
                  data={topCompetition}
                  tooltipFields={[
                    { key: "value", label: "Capacity", color: "#4a90e2", suffix: " MW" },
                    { key: "sites", label: "Sites", color: "#6b7280" },
                  ]}
                />
            ) : (
              <DataTable
                unconstrained={exportLayout}
                data={topCompetition}
                columns={[
                  { key: "label", label: "Name" },
                  { key: "value", label: "Capacity", suffix: "MW" },
                  { key: "sites", label: "Sites" },
                ]}
              />
            )
          }
        </ChartCard>
        <ChartCard
          title={data?.topHyperscale.title || "Top Hyperscale Projects"}
          subtitle={`${data?.topHyperscale.subtitle || "Project Details (Project Name, IT Capacity and Project Status)"}`}
        >
          {(view) =>
            loading ? (
              <ChartPlaceholder />
            ) : topHyperscale.length === 0 ? (
              <NoData />
            ) : view === "chart" ? (
              // <BarChart
              //   data={topHyperscale}
              //  xDataKey="uniqueKey"
              //   yDataKey="value"
              //   height={220}
              //   tooltipFields={[
              //     { key: "value", label: "Capacity", color: "#4a90e2", suffix: " MW" },
              //     { key: "site", label: "Site", color: "#6b7280" },
              //     { key: "status", label: "Status", color: "#8b5cf6" },
              //   ]}
              //   ranked={true}
              // />
            <MountainInfographic
                  data={topHyperscale}
                tooltipFields={[
                  { key: "value", label: "Capacity", color: "#4a90e2", suffix: " MW" },
                  { key: "site", label: "Site", color: "#6b7280" },
                  { key: "status", label: "Status", color: "#8b5cf6" },
                ]}
                />

            ) : (
              <DataTable
                unconstrained={exportLayout}
                data={topHyperscale}
                columns={[
                  { key: "label", label: "Name" },
                  { key: "value", label: "Capacity", suffix: "MW" },
                  { key: "site", label: "Site" },
                  { key: "status", label: "Status" },
                ]}
              />
            )
          }
        </ChartCard>
        {!showgraphs && (
          <ChartCard
            title={data?.topOpportunities.title || "Potential Upcoming Markets"}
            subtitle={`${data?.topOpportunities.subtitle || "Potential Markets, By Upcoming Project Capacity, in MW, Base (Yr)"}`}
          >
            {(view) =>
              loading ? (
                <ChartPlaceholder />
              ) : view === "chart" ? (
                // <BarChart
                //   data={topOpportunities}
                //   xDataKey="uniqueKey"
                //   yDataKey="value"
                //   height={220}
                //   tooltipFields={[
                //     { key: "value", label: "Capacity", color: "#4a90e2", suffix: " MW" },
                //     { key: "sites", label: "Sites", color: "#6b7280" },
                //   ]}
                //   ranked={true}
                // />
                 <TrophyInfographic
                  data={topOpportunities}
                  tooltipFields={[
                    { key: "value", label: "Capacity", color: "#4a90e2", suffix: " MW" },
                    { key: "sites", label: "Sites", color: "#6b7280" },
                  ]}
                />
              ) : (
                <DataTable
                  unconstrained={exportLayout}
                  data={topOpportunities}
                  columns={[
                    { key: "label", label: "Location" },
                    { key: "value", label: "Capacity", suffix: "MW" },
                    { key: "sites", label: "Sites" },
                  ]}
                />
              )
            }
          </ChartCard>
        )}
      </div>

      {!loading &&
        data &&
        topLocations.length === 0 &&
        topCompetition.length === 0 &&
        topHyperscale.length === 0 &&
        topOpportunities.length === 0 && (
          <div className="px-4 pb-4 text-sm text-gray-500">
            No ranking data found for selected filters.
          </div>
        )}
    </section>
  );
};
