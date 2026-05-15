import React, { useState } from 'react'
import { DonutChart } from '../charts/DonutChart'
import CommonDataTable, { type ColumnDefType } from './CommonTable';
import type { CompanyCountryDetailsResponse, CompanyStatusDistributionResponse } from '@/network/operator-intelligence/operator-intelligence.types';

function RankBadge({ rank }: { rank: number | string }) {
  return (
    <div className="w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center text-xs font-semibold text-slate-600 shadow-sm">
      {rank}
    </div>
  );
}
const ChartPlaceholder = () => (
  <div className="h-[240px] rounded-lg bg-gray-50 border border-gray-100 animate-pulse" />
);
function PipelinePill({ status }: { status: string }) {
  const map: Record<string, { dot: string; bg: string; text: string }> = {
    Strong: { dot: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
    Controlled: { dot: "bg-amber-400", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    Expanding: { dot: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
    "High growth": { dot: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
    Limited: { dot: "bg-red-400", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  };
  const s = map[status] || map["Limited"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
interface CountryDetailsSectionProps {
  companyCountryDetailsData?: CompanyCountryDetailsResponse;
  getCompanyStatusDistributionData?: CompanyStatusDistributionResponse
  loading?: boolean;
  StatusDistributionDataLoading?: boolean;
}
function CountryDetailsSection({ companyCountryDetailsData, getCompanyStatusDistributionData, loading, StatusDistributionDataLoading }: CountryDetailsSectionProps) {
  const totalMarketShareValue = (getCompanyStatusDistributionData?.donutChart?.data || []).reduce(
    (sum, segment) => sum + segment.value,
    0
  );
  const marketShareData = (getCompanyStatusDistributionData?.donutChart?.data || []).map(
    (segment) => ({
      status: segment.name,
      value: segment.value,
      percentage: totalMarketShareValue ? (segment.value / totalMarketShareValue) * 100 : 0,
    }),
  );

  const countryColumns: ColumnDefType[] = [
    // {
    //   key: "rank", label: "Rank", minWidth: "min-w-[60px]",
    //   render: (v) => <RankBadge rank={v} />,
    // },
    {
      key: "country", label: "Country", minWidth: "min-w-[130px]",
      render: (v) => <span className="font-medium text-slate-800">{v}</span>
    },
    {
      key: "region", label: "Region", minWidth: "min-w-[110px]",
      render: (v) => <span className="text-slate-500">{v}</span>
    },
    { key: "dcCount", label: "# DCs", minWidth: "min-w-[60px]" },
    {
      key: "currentITLoad", label: "Current IT Load", minWidth: "min-w-[120px]",
      render: (v) => <span className="font-medium">{v} MW</span>
    },
    {
      key: "futureITLoad", label: "2030 IT Load", minWidth: "min-w-[110px]",
      render: (v) => <span className="font-medium text-indigo-600">{v} MW</span>
    },
    {
      key: "marketShare", label: "Market Share", minWidth: "min-w-[130px]",
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.min(v * 4, 100)}%` }} />
          </div>
          <span>{v}%</span>
        </div>
      ),
    },
    {
      key: "avgPUE", label: "Avg. PUE", minWidth: "min-w-[80px]",
      render: (v) => (
        <span className={`font-semibold ${v <= 1.35 ? "text-emerald-600" : v <= 1.40 ? "text-amber-500" : "text-red-400"}`}>
          {v}
        </span>
      ),
    },
    {
      key: "avgRackDensity", label: "Avg. Rack Density", minWidth: "min-w-[130px]",
      render: (v) => `${v} kW/rack`
    },
    {
      key: "pipelineStatus", label: "Pipeline Status", minWidth: "min-w-[130px]",
      render: (v) => <PipelinePill status={v} />,
    },
  ];
  const [portfolioView, setPortfolioView] = useState<"chart" | "table">(
    "chart"
  );

  return (
    <section className="overflow-hidden mt-5 bg-white border border-gray-100 rounded-2xl">
      <div className='py-[14px] px-4 border-b border-[#0f172a0f]'>
        <b className='text-[13px]'>Country Details</b>
        <p className='text-[12px]'>Top 5 countries and portfolio status mix for the selected operator</p>
      </div>


      <div className='lg:grid space-y-4 lg:grid-cols-10 gap-4 p-4'>
        <div className='bg-white border border-gray-100 rounded-2xl shadow-sm col-span-7'>
          <div className='flex items-center justify-between py-[14px] px-4 border-b border-[#0f172a0f]'>
            <div>
              <b className='text-[13px]'>Top 5 Countries</b>
              <p className='text-[12px]'>Country list with all key columns</p>
            </div>

            <div className="py-2 px-3 rounded-3xl border border-[#0f172a1a]">
              <span className="flex items-center gap-2 text-[12px]"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Top 5 only</span>
            </div>
          </div>

          {/* Line Chart */}
          <div className='pb-4'>
            <CommonDataTable
              title="Country Rankings"
              subtitle="Capacity footprint and market metrics by country"
              meta={`${companyCountryDetailsData?.table?.data?.length || 0} countries`}
              columns={countryColumns}
              data={companyCountryDetailsData?.table?.data || []}
              searchKeys={["country", "region", "pipelineStatus"]}
              defaultSort={{ key: "rank", dir: "asc" }}
              showPagination={false}
            />
          </div>
        </div>


        <div className='bg-white border border-gray-100 rounded-2xl shadow-sm col-span-3'>
          <div className='py-[14px] px-4 border-b border-[#0f172a0f] flex justify-between items-center'>
            <div>
              <b className='text-[13px]'>Portfolio Status Share</b>
              <p className='text-[12px]'>
                Commissioned vs under construction vs announced
              </p>
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
              <button
                type="button"
                onClick={() => setPortfolioView("chart")}
                className={
                  portfolioView === "chart"
                    ? "bg-white px-2 py-1 rounded shadow"
                    : "px-2 py-1"
                }
              >
                Chart
              </button>

              <button
                type="button"
                onClick={() => setPortfolioView("table")}
                className={
                  portfolioView === "table"
                    ? "bg-white px-2 py-1 rounded shadow"
                    : "px-2 py-1"
                }
              >
                Table
              </button>
            </div>
          </div>

          <div className='p-4'>
            {StatusDistributionDataLoading ? (
              <ChartPlaceholder />
            ) : portfolioView === "chart" ? (
              <DonutChart
                data={marketShareData}
                dataKey="value"
                nameKey="status"
                height={200}
              />
            ) : (
              <CommonDataTable
                title="Portfolio Status"
                subtitle="Distribution breakdown"
                columns={[
                  {
                    key: "status",
                    label: "Status",
                    minWidth: "min-w-[120px]",
                  },
                  {
                    key: "value",
                    label: "Value",
                    minWidth: "min-w-[80px]",
                  },
                  {
                    key: "percentage",
                    label: "Share %",
                    minWidth: "min-w-[80px]",
                    render: (v) => `${Number(v).toFixed(2)}%`,
                  },
                ]}
                data={marketShareData}
                showPagination={false}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CountryDetailsSection