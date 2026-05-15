import React, { useState, useMemo } from 'react'
import CommonDataTable, { type ColumnDefType } from './CommonTable';
import { SearchIcon } from 'lucide-react';
import type { CompanyDataCentersResponse } from "@/network/operator-intelligence/operator-intelligence.types";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { dot: string; bg: string; text: string }> = {
    Operational: { dot: "bg-emerald-500", bg: "bg-white border-slate-200", text: "text-slate-700" },
    Expansion: { dot: "bg-amber-400", bg: "bg-white border-slate-200", text: "text-slate-700" },
    "Under Construction": { dot: "bg-amber-400", bg: "bg-white border-slate-200", text: "text-slate-700" },
    Announced: { dot: "bg-slate-400", bg: "bg-white border-slate-200", text: "text-slate-500" },
  };
  const s = map[status] || map["Announced"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

interface FacilitiesDirectoryProps {
  companyDataCentersData?: CompanyDataCentersResponse;
  loading?: boolean;
  page: number;
  setPage: React.Dispatch<
    React.SetStateAction<number>
  >;
  search: string;
  setSearch: React.Dispatch<
    React.SetStateAction<string>
  >;
}
function FacilitiesDirectory({ companyDataCentersData, page, setPage, search, setSearch,loading }: FacilitiesDirectoryProps) {


  const tableData = useMemo(() => {
    return companyDataCentersData?.data || [];
  }, [companyDataCentersData?.data]);
  const facilitiesColumns = useMemo<
    ColumnDefType<any>[]
  >(() => [
    {
      key: "data_center_facility_name", label: "Facility", minWidth: "min-w-[180px]",
      render: (v) => <span className="font-medium text-slate-800">{v}</span>
    },
    { key: "country", label: "Country", minWidth: "min-w-[130px]" },
    { key: "region", label: "Region", minWidth: "min-w-[100px]" },
    {
      key: "data_center_status", label: "Status", minWidth: "min-w-[160px]",
      render: (v) => <StatusPill status={v} />,
    },
    { key: "data_center_tier_level", label: "Tier", minWidth: "min-w-[80px]" },
    { key: "data_center_type", label: "Type", minWidth: "min-w-[120px]" },
    {
      key: "current_it_load_capacity", label: "IT Load", minWidth: "min-w-[80px]",
      render: (v) => `${v} MW`
    },
    {
      key: "expected_it_load_capacity_mw", label: "2030 IT Load", minWidth: "min-w-[100px]",
      render: (v) => <span className="text-indigo-600 font-medium">{v} MW</span>
    },
    {
      key: "pue_rating", label: "PUE", minWidth: "min-w-[70px]",
      render: (v) => (
        <span className={`font-semibold ${v <= 1.35 ? "text-emerald-600" : v <= 1.42 ? "text-amber-500" : "text-red-400"}`}>
          {v}
        </span>
      ),
    },
    {
      key: "dc_rack_density_kw", label: "Rack Density", minWidth: "min-w-[120px]",
      render: (v) => `${v} kW/rack`
    },
    { key: "year_of_commission", label: "Commissioned", minWidth: "min-w-[110px]" },
  ], []);;
  return (
    <section className="overflow-hidden mt-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
      <div className='space-y-4 mdflex items-center justify-between py-[14px] px-4 border-b border-[#0f172a0f]'>
        <div>
          <b className='text-[13px]'>Operator DC Facilities Directory</b>
          <p className='text-[12px]'>facility-level directory for the selected operator</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-64">
            <SearchIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />

            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search Facility..."
              className="border-none outline-none bg-transparent w-full text-[14px]"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={
                !companyDataCentersData?.pagination
                  ?.hasPreviousPage
              }
              onClick={() =>
                setPage((prev) => prev - 1)
              }
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              disabled={
                !companyDataCentersData?.pagination
                  ?.hasNextPage
              }
              onClick={() =>
                setPage((prev) => prev + 1)
              }
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="pb-4">
        <CommonDataTable
        loading = {loading}
          title="Operator DC Facilities Directory"
          subtitle="facility-level directory for the selected operator"
          // meta={`${companyDataCentersData?.data?.length}  facilities`}
          notice="Click-to-open behavior can be added later. Current view is UI reference only."
          columns={facilitiesColumns}
          data={tableData}
          defaultSort={{ key: "facility", dir: "asc" }}
          showPagination={false}
        />
      </div>
    </section>
  )
}

export default React.memo(FacilitiesDirectory);