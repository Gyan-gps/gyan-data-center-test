import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { Button, Loading } from "@/components/ui";
import {
  ArrowUpDown,
  Eye,
  Building2,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router";
import type { ExtendedCompany } from "./types";
import { formatCompanyNameToRedirect } from "@/utils";
import { useAuthStore } from "@/store/authStore";
import { BlurMask } from "../common";

type CompanyRow = ExtendedCompany;

interface CompanyDataTableProps {
  data: CompanyRow[];
  loading?: boolean;
  isFetchingNextPage?: boolean; // Loading state for pagination
  // onViewDetails: (id: string) => void;
  hasMore: boolean;
  currentPage: number;
  pageSize: number;
  totalInCurrentPage: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onPageSizeChange: (pageSize: number) => void;
  canGoPrevious: boolean;
  totalCompanies: number;
  totalPages: number;
}

export const CompanyDataTable: React.FC<CompanyDataTableProps> = ({
  data,
  loading,
  isFetchingNextPage = false,
  // onViewDetails,
  hasMore,
  currentPage,
  pageSize,
  totalPages,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  canGoPrevious,
  totalCompanies,
}) => {
  const navigate = useNavigate();
  const { user, updateUserFavoriteCompanies, shouldBlur } = useAuthStore();
  const isTrialUser = shouldBlur();
  // Mobile state management
  const [isMobile, setIsMobile] = useState(false);
  const [tableSearchValue, setTableSearchValue] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Use md breakpoint for table vs card view
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const tableData = useMemo(() => {
    return data.map(
      (item): CompanyRow => ({
        ...item,
      })
    );
  }, [data]);

  const getCompanyTypeColor = (type?: string) => {
    switch (type) {
      case "operator":
        return "bg-blue-100 text-blue-800";
      case "tenant":
        return "bg-green-100 text-green-800";
      case "provider":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === "string" ? parseInt(num) : num;
    return isNaN(n) ? "0" : n.toLocaleString();
  };

  const columns = useMemo<ColumnDef<CompanyRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: "",
        cell: ({ getValue }) => (
          <Button
            variant="ghost"
            className="p-0 w-fit"
            title={
              user?.favouriteCompanies?.includes(String(getValue()))
                ? "Remove from favorites"
                : "Add to favorites"
            }
            onClick={() => updateUserFavoriteCompanies(String(getValue()))}
          >
            {user?.favouriteCompanies?.includes(String(getValue())) ? (
              <Star className="w-4 h-4 text-yellow-500" />
            ) : (
              <Star className="w-4 h-4 text-gray-300" />
            )}
          </Button>
        ),
        enableSorting: false,
        size: 50,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Company
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue, row }) => {
          return (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <button
                onClick={() =>
                  navigate(
                    `/company/${formatCompanyNameToRedirect(
                      String(getValue())
                    )}/${row.original.id}`
                  )
                }
                className="font-medium text-blue-600 hover:underline text-sm text-left max-w-[150px] truncate"
                title={String(getValue())}
              >
                {String(getValue())}
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "assetCount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Data Centers
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return (
            <div className="text-sm font-medium">
              {value ? formatNumber(value) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "countryCount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Countries
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return (
            <div className="text-sm font-medium">
              {value ? formatNumber(value) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "currentITLoadCapacity",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Current IT Load Capacity (MW) CHANGED
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return (
            <BlurMask shouldBlur={isTrialUser}>
              <div className="text-sm font-medium">
                {value ? formatNumber(value) : "-"}
              </div>
            </BlurMask>
          );
        },
      },
      {
        accessorKey: "expectedITLoadCapacity",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Expected IT Load - 2030 (MW)
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return (
            <BlurMask shouldBlur={isTrialUser}>
              <div className="text-sm font-medium">
                {value ? formatNumber(value) : "-"}
              </div>
            </BlurMask>
          );
        },
      },
    ],
    [navigate, updateUserFavoriteCompanies, user]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: -1, // Unknown page count with offset pagination
    state: {
      pagination: {
        pageIndex: 0, // Always 0 for current page display
        pageSize: pageSize,
      },
      globalFilter: tableSearchValue,
      sorting: sorting,
    },
    onSortingChange: setSorting,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return String(value)
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
    onGlobalFilterChange: setTableSearchValue,
  });

  // Mobile Card Component
  const MobileCard: React.FC<{ item: CompanyRow }> = ({ item }) => {
    const isFavorite = user?.favouriteCompanies?.includes(item.id) || false;

    const handleFavoriteClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await updateUserFavoriteCompanies(item.id);
      } catch (error) {
        console.error("Failed to update favorite:", error);
      }
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate(
                      `/company/${formatCompanyNameToRedirect(item.name)}/${
                        item.id
                      }`
                    )
                  }
                  className="font-medium text-blue-600 hover:underline text-left text-sm break-words flex-1"
                >
                  {item.name}
                </button>
                {user && (
                  <button
                    onClick={handleFavoriteClick}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-400 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.id}</div>
            </div>
          </div>
          {item.type && (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCompanyTypeColor(
                item.type
              )}`}
            >
              {item.type}
            </span>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* <div>
          <span className="text-gray-500">Parent Company:</span>
          <div className="font-medium text-gray-900 mt-1 break-words">
            {(item as ExtendedCompany & { parentCompany?: string })
              .parentCompany || "-"}
          </div>
        </div> */}
          <div>
            <span className="text-gray-500">Assets:</span>
            <BlurMask shouldBlur={isTrialUser}>
              <div className="font-medium text-blue-600 mt-1">
                {item.assetCount ? formatNumber(item.assetCount) : "-"}
              </div>
            </BlurMask>
          </div>
          <div>
            <span className="text-gray-500">Countries:</span>
            <BlurMask shouldBlur={isTrialUser}>
              <div className="font-medium text-purple-600 mt-1">
                {item.countryCount ? formatNumber(item.countryCount) : "-"}
              </div>
            </BlurMask>
          </div>
          {/* <div>
          <span className="text-gray-500">Contacts:</span>
          <div className="font-medium text-green-600 mt-1">
            {item.contactCount ? formatNumber(item.contactCount) : "-"}
          </div>
        </div> */}
          <div>
            <span className="text-gray-500">Current IT Load:</span>
            <BlurMask shouldBlur={isTrialUser}>
              <div className="font-medium text-orange-600 mt-1">
                {(item as ExtendedCompany & { currentITLoadCapacity?: number })
                  .currentITLoadCapacity
                  ? formatNumber(
                      (
                        item as ExtendedCompany & {
                          currentITLoadCapacity?: number;
                        }
                      ).currentITLoadCapacity!
                    ) + " MW"
                  : "-"}
              </div>
            </BlurMask>
          </div>
          <div>
            <span className="text-gray-500">Expected 2030:</span>
            <BlurMask shouldBlur={isTrialUser}>
              <div className="font-medium text-red-600 mt-1">
                {(item as ExtendedCompany & { expectedITLoad2030?: number })
                  .expectedITLoad2030
                  ? formatNumber(
                      (
                        item as ExtendedCompany & {
                          expectedITLoad2030?: number;
                        }
                      ).expectedITLoad2030!
                    ) + " MW"
                  : "-"}
              </div>
            </BlurMask>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigate(
                `/company/${formatCompanyNameToRedirect(item.name)}/${item.id}`
              );
            }}
            className="w-full flex items-center justify-center gap-2 text-xs"
          >
            <Eye className="w-3 h-3" />
            View Details
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-8">
        <div className="flex justify-center items-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Table Header */}

      {/* Content Area with Loading Overlay */}
      <div className="relative">
        {/* Loading Overlay for Pagination */}
        {isFetchingNextPage && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <Loading />
              <span className="text-sm text-gray-600 font-medium">
                Loading data...
              </span>
            </div>
          </div>
        )}

        {/* Mobile Card View */}
        {isMobile ? (
          <div className="p-4">
            {table.getRowModel().rows.length === 0 && tableSearchValue ? (
              <div className="text-center py-8 text-gray-500">
                No results found for "{tableSearchValue}"
              </div>
            ) : table.getRowModel().rows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No data available
              </div>
            ) : (
              <div className="space-y-4">
                {table.getRowModel().rows.map((row) => (
                  <MobileCard key={row.original.id} item={row.original} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full relative">
              <thead className="sticky top-0 bg-white z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-200">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {table.getRowModel().rows.length === 0 && tableSearchValue ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      No results found for "{tableSearchValue}"
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-3 py-2 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="px-3 lg:px-4 py-3 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Pagination Info */}
          <div className="text-xs text-gray-500 text-center sm:text-left">
            Page {currentPage} of{" "}
            {totalPages} • Showing{" "}
            {data.length} companies from {totalCompanies} total
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-2">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded border border-gray-300 px-2 py-1 text-xs"
            >
              {[20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                  <span className="hidden sm:inline"> per page</span>
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={!canGoPrevious}
              className="px-2 py-1 text-xs"
            >
              <ChevronLeft className="w-3 h-3" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={!hasMore}
              className="px-2 py-1 text-xs"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
