import React, { useState, useEffect } from "react";
import { BarandLineChart } from "../charts/BarandLineChart";
import { DonutChart } from "../charts/DonutChart";
import type { YearlyTimelineResponse, operatorMarketShareQuery, MarketShareResponse } from "@/network/operator-intelligence/operator-intelligence.types";
import { getMarketShareOptions, getMarketShare } from "@/network/operator-intelligence/operator-intelligence.api";


interface CapacitySectionProps {
  timelineData?: YearlyTimelineResponse;
  loading?: boolean;
  exportLayout?: boolean;
  companyId: string;
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
  if (!data.length) {
    return <div className="text-sm text-gray-400">No data</div>;
  }

  return (
    <div
      className={`overflow-auto ${unconstrained ? "max-h-none" : "max-h-[240px]"
        }`}
    >
      <table className="w-full text-xs border border-gray-100 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2 text-left text-gray-500"
              >
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

const ChartPlaceholder = () => (
  <div className="h-[240px] rounded-lg bg-gray-50 border border-gray-100 animate-pulse" />
);

function CapacitySection({
  timelineData,
  loading = false,
  companyId
}: CapacitySectionProps) {

  const [scopeType, setScopeType] =
    useState<
      "default" | "region" | "global"
    >("default");

  const [regions, setRegions] =
    useState<string[]>([]);

  const [selectedRegion, setSelectedRegion] =
    useState("");

  const [marketShareData, setMarketShareData] =
    useState<MarketShareResponse | null>(
      null
    );

  const [marketShareLoading, setMarketShareLoading] =
    useState(false);

  const [capacityView, setCapacityView] = useState<"chart" | "table">(
    "chart"
  );

  const [marketView, setMarketView] = useState<"chart" | "table">(
    "chart"
  );

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response =
          await getMarketShareOptions({
            companyId,
          });

        setRegions(
          response.regions || []
        );
      } catch (error) {
        console.error(error);
      }
    };

    if (companyId) {
      fetchOptions();
    }
  }, [companyId]);


  // ================================
  // FETCH MARKET SHARE
  // ================================

  useEffect(() => {
    const fetchMarketShare = async () => {
      try {
        setMarketShareLoading(true);

        const payload: operatorMarketShareQuery = {
          companyId,
        };

        if (scopeType === "region") {
          // wait until region selected
          if (!selectedRegion) return;

          payload.type = "region";
          payload.value = selectedRegion;
        }

        if (scopeType === "global") {
          payload.type = "global";
        }

        const response = await getMarketShare(payload);

        setMarketShareData(response);
      } catch (error) {
        console.error(error);
      } finally {
        setMarketShareLoading(false);
      }
    };

    if (companyId) {
      fetchMarketShare();
    }
  }, [companyId, scopeType, selectedRegion]);

  const capacityData = (timelineData?.timeline.data || []).map((item) => ({
    period: item.period,
    capacity: item.capacity,
  }));

  const totalMarketShare =
    (marketShareData?.data || []).reduce(
      (sum, item) =>
        sum + Number(item.value || 0),
      0
    );

  const marketShareWithPercentage =
    (marketShareData?.data || []).map(
      (item) => ({
        ...item,

        percentage: totalMarketShare
          ? (
            (Number(item.value) /
              totalMarketShare) *
            100
          )
          : 0,
      })
    );
  useEffect(() => {
    if (scopeType !== "region") {
      setSelectedRegion("");
    }
  }, [scopeType]);



  return (
    <section className="overflow-hidden mt-5 space-y-4">

      {/* ========================================= */}
      {/* ROW 1 : TIMELINE */}
      {/* ========================================= */}

      <div className="w-full">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">

          <div className="py-[14px] px-4 border-b border-[#0f172a0f] flex justify-between items-center">
            <div>
              <b className="text-[13px]">
                YoY Capacity Increase: 2016-2030
              </b>

              <p className="text-[12px]">
                Historical and forecast IT load capacity in MW
              </p>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <ChartPlaceholder />
            ) : capacityView === "chart" ? (
              <BarandLineChart
                data={capacityData}
                xDataKey="period"
                yDataKey="capacity"
                tooltipFields={[
                  {
                    key: "capacity",
                    label: "Installed IT Load",
                    color: "#6b7280",
                    suffix: " MW",
                  },
                ]}
              />
            ) : (
              <DataTable
                data={capacityData as Record<string, unknown>[]}
                columns={[
                  { key: "period", label: "Year" },
                  {
                    key: "capacity",
                    label: "Capacity",
                    suffix: "MW",
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* MARKET SHARE SECTION */}
      {/* ========================================= */}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">

        {/* HEADER */}
        <div className="py-[14px] px-4 border-b border-[#0f172a0f] flex justify-between items-center">

          <div>
            <b className="text-[13px]">
              Market Share View
            </b>

            <p className="text-[12px]">
              region / global
            </p>
          </div>

          <div className="flex items-center gap-2">

            <select
              value={scopeType}
              onChange={(e) =>
                setScopeType(
                  e.target.value as
                  | "default"
                  | "region"
                  | "global"
                )
              }
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white"
            >
              <option value="default">
                Default
              </option>

              <option value="region">
                Region
              </option>

              <option value="global">
                Global
              </option>
            </select>

            {scopeType === "region" && (
              <select
                value={selectedRegion}
                onChange={(e) =>
                  setSelectedRegion(
                    e.target.value
                  )
                }
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white"
              >
                <option value="">
                  Select Region
                </option>

                {regions.map((region) => (
                  <option
                    key={region}
                    value={region}
                  >
                    {region}
                  </option>
                ))}
              </select>
            )}

            <div className="flex bg-gray-100 rounded-lg p-1 text-xs">

              <button
                type="button"
                onClick={() =>
                  setMarketView("chart")
                }
                className={
                  marketView === "chart"
                    ? "bg-white px-2 py-1 rounded shadow"
                    : "px-2 py-1"
                }
              >
                Chart
              </button>

              <button
                type="button"
                onClick={() =>
                  setMarketView("table")
                }
                className={
                  marketView === "table"
                    ? "bg-white px-2 py-1 rounded shadow"
                    : "px-2 py-1"
                }
              >
                Table
              </button>

            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* DONUT CHARTS */}
        {/* ========================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">

          {/* ========================================= */}
          {/* CURRENT MARKET SHARE */}
          {/* ========================================= */}

          <div className="border border-gray-100 rounded-2xl">

            <div className="py-[14px] px-4 border-b border-[#0f172a0f]">

              <b className="text-[13px]">
                {
                  marketShareData
                    ?.currentMarketShare
                    ?.title
                }
              </b>

              <p className="text-[11px] text-gray-500">
                {
                  marketShareData
                    ?.currentMarketShare
                    ?.subtitle
                }
              </p>
            </div>

            <div className="p-4">

              {marketShareLoading ? (
                <ChartPlaceholder />
              ) : (() => {

                const total =
                  (
                    marketShareData
                      ?.currentMarketShare
                      ?.data || []
                  ).reduce(
                    (sum, item) =>
                      sum +
                      Number(item.value || 0),
                    0
                  );

                const data =
                  (
                    marketShareData
                      ?.currentMarketShare
                      ?.data || []
                  ).map((item) => ({
                    ...item,

                    percentage: total
                      ? (
                        (Number(item.value) /
                          total) *
                        100
                      )
                      : 0,
                  }));

                return marketView === "chart" ? (
                  <DonutChart
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    height={260}
                  />
                ) : (
                  <DataTable
                    data={
                      data as Record<
                        string,
                        unknown
                      >[]
                    }
                    columns={[
                      {
                        key: "name",
                        label: "Operator",
                      },
                      {
                        key: "value",
                        label: "IT Load",
                        suffix: "MW",
                      },
                    ]}
                  />
                );
              })()}
            </div>
          </div>

          {/* ========================================= */}
          {/* FORECAST MARKET SHARE */}
          {/* ========================================= */}

          <div className="border border-gray-100 rounded-2xl">

            <div className="py-[14px] px-4 border-b border-[#0f172a0f]">

              <b className="text-[13px]">
                {
                  marketShareData
                    ?.forecast2033MarketShare
                    ?.title
                }
              </b>

              <p className="text-[11px] text-gray-500">
                {
                  marketShareData
                    ?.forecast2033MarketShare
                    ?.subtitle
                }
              </p>
            </div>

            <div className="p-4">

              {marketShareLoading ? (
                <ChartPlaceholder />
              ) : (() => {

                const total =
                  (
                    marketShareData
                      ?.forecast2033MarketShare
                      ?.data || []
                  ).reduce(
                    (sum, item) =>
                      sum +
                      Number(item.value || 0),
                    0
                  );

                const data =
                  (
                    marketShareData
                      ?.forecast2033MarketShare
                      ?.data || []
                  ).map((item) => ({
                    ...item,

                    percentage: total
                      ? (
                        (Number(item.value) /
                          total) *
                        100
                      )
                      : 0,
                  }));

                return marketView === "chart" ? (
                  <DonutChart
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    height={260}
                  />
                ) : (
                  <DataTable
                    data={
                      data as Record<
                        string,
                        unknown
                      >[]
                    }
                    columns={[
                      {
                        key: "name",
                        label: "Operator",
                      },
                      {
                        key: "value",
                        label: "Forecast IT Load",
                        suffix: "MW",
                      },
                    ]}
                  />
                );
              })()}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default CapacitySection;