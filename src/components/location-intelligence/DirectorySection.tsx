import React from "react";
import type { DataCenterListItem, DataCenterListRequest } from "@/network/location-intelligence/location-intelligence.types";
import { useNavigate } from 'react-router'

interface DirectorySectionProps {
  data: DataCenterListItem[];
  scopeValue?: string; 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  onApplyFilters: (filters: Pick<DataCenterListRequest, "status" | "scale">) => void;
  onResetFilters: () => void;

  showPagination?: boolean;
  loading?: boolean;
  /** PDF: hide status/scale filters and pagination (still exports current page items only). */
  exportLayout?: boolean;
}

const statusColor: Record<string, string> = {
  Announced: "bg-blue-50 border-blue-100 text-blue-700",
  Cancelled: "bg-red-50 border-red-100 text-red-700",
  Commissioned: "bg-green-50 border-green-100 text-green-700",
  "Under Construction": "bg-amber-50 border-amber-100 text-amber-700",
};


export const DirectorySection: React.FC<DirectorySectionProps> = ({
  data,
  scopeValue= "",
  currentPage,
  totalPages,
  onPageChange,
  onApplyFilters,
  onResetFilters,
  showPagination = true,
  loading,
  exportLayout = false,
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<DataCenterListRequest["status"]>();
  const [scale, setScale] = React.useState<DataCenterListRequest["scale"]>();
  const handleDataCenterClick = (dc: DataCenterListItem) => {
    navigate(`/datacenter/${dc.dc_id || dc.id}`);
  };
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };
  const handleApply = () => {
    onApplyFilters({
      status,
      scale
    });
  };

  const handleReset = () => {
    setStatus(undefined);
    setScale(undefined);
    onResetFilters();
  };

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mt-5">

      <div className="px-4 py-3 border-b border-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-50/50">

        <div className="flex flex-col gap-0.5">
          <strong className="text-sm font-semibold text-gray-800">
            DC Directory
          </strong>
          <span className="text-xs text-gray-400">
            Repository of Data Centers for Selected {scopeValue || "Location"}
          </span>
        </div>

        {!exportLayout && (
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={status || ""}
            onChange={(e) =>
              setStatus((e.target.value || undefined) as DataCenterListRequest["status"])
            }
            className="text-xs border rounded-lg px-2 py-1"
          >
            <option value="" disabled>
              Select Status
            </option>
            <option value="Announced">Announced</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Commissioned">Commissioned</option>
            <option value="Under Construction">Under Construction</option>
          </select>

          {/* Scale Filter */}
          <select
            value={scale || ""}
            onChange={(e) =>
              setScale((e.target.value || undefined) as DataCenterListRequest["scale"])
            }
            className="text-xs border rounded-lg px-2 py-1"
          >
            <option value="" disabled>
              Select Scale
            </option>
            <option value="Hyperscale">Hyperscale</option>
            <option value="Large">Large</option>
            <option value="Medium">Medium</option>
            <option value="Small">Small</option>
          </select>

          {/* Apply */}
          <button
            onClick={handleApply}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
          >
            Apply
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="text-xs border px-3 py-1 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>

        </div>
        )}

      </div>

      {loading ? (
        <div className="p-4">
          <div className="h-48 rounded-lg bg-gray-50 border border-gray-100 animate-pulse" />
        </div>
      ) : (
        data?.length === 0 && (
          <div className="p-4 text-center text-gray-500">No data centers found for the selected {scopeValue || "Location"}.</div>
        )
      )}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {data?.map((dc, i) => {

          return (
            <div
              key={i}
              onClick={() => handleDataCenterClick(dc)}
              className="group border border-gray-100 bg-gray-50/50 rounded-2xl p-4 flex items-start justify-between gap-3 cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex flex-col gap-2 min-w-0">
                <strong className="text-sm font-semibold text-gray-800 truncate">
                  {dc?.name}
                </strong>

                <span className="text-xs text-gray-400 leading-relaxed">
                  {dc?.operator}  • {dc?.country} • {dc?.tier}
                </span>

                <span
                  className={`self-start text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor[dc.status] ||
                    "bg-gray-50 border-gray-100 text-gray-500"
                    }`}
                >
                  {dc?.status}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 items-end shrink-0">
                {[`IT: ${dc.status === "Under Construction" || dc.status === "Announced" ? dc.expectITLoadMW : dc.itLoadMW}`,
                  `PUE: ${dc.pue}`].map((tag, j) => (
                  <span
                    key={j}
                    className="text-xs text-gray-400 border border-gray-100 bg-white/70 px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {!loading && !exportLayout && showPagination && totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4 pb-4">          <button
          onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, currentPage - 2) + i;
            if (pageNum > totalPages) return null;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 border rounded ${pageNum === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-50"
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};