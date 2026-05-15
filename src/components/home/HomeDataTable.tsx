import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building,
  Star,
} from "lucide-react";
import { Button, Badge, Loading } from "@/components/ui";
import { type DataCenterAsset, type DataCenterTableRows } from "@/network";
import { useAuthStore } from "@/store";
import { formatDataCenterStatus, getCurrentYearItLoadCapacity, getExpectedItLoadCapacity } from "@/utils";
import { BlurMask } from "../common";

interface HomeDataTableProps {
  data: DataCenterAsset[];
  loading?: boolean;
  isFetchingNextPage?: boolean;
  onViewDetails: (id: string) => void;
  onCompanyDetails: (companyName: string, id: string) => void;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  canGoPrevious: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onPageSizeChange: (newSize: number) => void;
  totalPages: number;
  totalDataCenters: number;
}

export const HomeDataTable: React.FC<HomeDataTableProps> = ({
  data,
  loading,
  isFetchingNextPage,
  onViewDetails,
  onCompanyDetails,
  currentPage,
  pageSize,
  hasMore,
  canGoPrevious,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  totalPages,
  totalDataCenters,
}) => {
  const { user, updateUserFavoriteDataCenters, shouldBlur } = useAuthStore();
  const isTrialUser = shouldBlur();
  // Mobile state management
  const [isMobile, setIsMobile] = useState(false);
  const [tableSearchValue, setTableSearchValue] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(
    async (dataCenterId: string) => {
      updateUserFavoriteDataCenters(dataCenterId);
    },
    [updateUserFavoriteDataCenters]
  );

  const tableData = useMemo(() => {
    return data?.map((item): DataCenterTableRows => {
      return {
        year_of_commission: item["year_of_commission"],
        data_center_facility_name: item["data_center_facility_name"],
        data_center_type: item["data_center_type"],
        net_rentable_capacity_sq_ft: item["net_rentable_capacity_sq_ft"],

        "IT_Load_Capacity_(MW)_2016":
          item["it_load_capacity_by_year"][0]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2017":
          item["it_load_capacity_by_year"][1]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2018":
          item["it_load_capacity_by_year"][2]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2019":
          item["it_load_capacity_by_year"][3]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2020":
          item["it_load_capacity_by_year"][4]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2021":
          item["it_load_capacity_by_year"][5]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2022":
          item["it_load_capacity_by_year"][6]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2023":
          item["it_load_capacity_by_year"][7]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2024":
          item["it_load_capacity_by_year"][8]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2025":
          item["it_load_capacity_by_year"][9]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2026":
          item["it_load_capacity_by_year"][10]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2027":
          item["it_load_capacity_by_year"][11]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2028":
          item["it_load_capacity_by_year"][12]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2029":
          item["it_load_capacity_by_year"][13]?.capacity_mw,
        "IT_Load_Capacity_(MW)_2030":
          item["it_load_capacity_by_year"][14]?.capacity_mw,
        current_it_load_capacity: getCurrentYearItLoadCapacity(item["it_load_capacity_by_year"]),
        it_load_capacity_by_year: item["it_load_capacity_by_year"],
        data_center_operator: item["data_center_operator"],
        data_center_tier_level: item["data_center_tier_level"],
        data_center_status: item["data_center_status"],
        expected_it_load_capacity_mw: getExpectedItLoadCapacity(item["it_load_capacity_by_year"],2030),
        city: item.city,
        country: item.country,
        id: item.id,
        dc_id: item.dc_id,
        region: item.region,
      };
    });
  }, [data]);

 const loadCapacityColumns = useMemo<ColumnDef<DataCenterTableRows>[]>(() => {
  const years = Array.from({ length: 15 }, (_, i) => 2016 + i); // Years 2016 to 2030

  const columns: ColumnDef<DataCenterTableRows>[] = [];

  years.forEach((year) => {

    //  Check if ANY row has quarterly data for this year
    const hasQuarterData = data?.some((row) =>
      row.it_load_capacity_by_year?.some(
        (y) =>
          y.year === year &&
          (y.q1_mw || y.q2_mw || y.q3_mw || y.q4_mw)
      )
    );
    // Main Year Column
    if (!hasQuarterData) {
    columns.push({
      accessorKey: `IT_Load_Capacity_(MW)_${year}`,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 p-0 font-medium text-xs"
        >
          {year}
          <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ getValue }) => {
        const value = String(getValue() || "-");
        return (
          <BlurMask shouldBlur={isTrialUser}>
            <div className="text-gray-900 text-sm">{value}</div>
          </BlurMask>
        );
      },
      enableSorting: true,
      size: 80,
    });}



    if (hasQuarterData) {
      ["q1_mw", "q2_mw", "q3_mw", "q4_mw"].forEach((quarter) => {
  columns.push({
    id: `${year}_${quarter}`,

    accessorFn: (row) => {
      const yearData = row.it_load_capacity_by_year?.find(
        (y) => y.year === year
      );
      return yearData?.[quarter] ?? null;
    },

    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-2 p-0 font-medium text-xs"
      >
        {year} {quarter.replace("_mw", "").toUpperCase()}
        <ArrowUpDown className="w-3 h-3" />
      </Button>
    ),

    cell: ({ getValue }) => {
      const value = getValue() ?? "-";
      return (
        <BlurMask shouldBlur={isTrialUser}>
          <div className="text-gray-900 text-sm">{value}</div>
        </BlurMask>
      );
    },
    enableSorting: true,
    size: 80,
  });
});

    }
  });

  return columns;
}, [isTrialUser]);

  const columns = useMemo<ColumnDef<DataCenterTableRows>[]>(
    () => [
      {
        accessorKey: "id",
        header: "",
        cell: ({ getValue }) => (
          <Button
            variant="ghost"
            className="p-0"
            title={
              user?.favouriteDataCenters?.includes(String(getValue()))
                ? "Remove from favorites"
                : "Add to favorites"
            }
            onClick={() => handleFavoriteToggle(String(getValue()))}
          >
            {user?.favouriteDataCenters?.includes(String(getValue())) ? (
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
        accessorKey: "data_center_facility_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Data Center
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue, row }) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">
                {String(getValue()).trim().charAt(0)}
              </span>
            </div>
            <div>
              <button
                onClick={() =>
                  onViewDetails(row.original.dc_id || row.original.id)
                }
                className="font-medium text-blue-600 hover:underline text-sm text-left max-w-[150px] truncate"
                title={String(getValue()).trim()}
              >
                {String(getValue()).trim()}
              </button>
              <div className="text-xs text-gray-500">{row.original.dc_id}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "data_center_operator",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-x"
          >
            Operator
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.original["data_center_operator"][0]?.company;

          return (
            <div
              className="text-sm max-w-[150px] truncate hover:*:underline cursor-pointer text-blue-600 hover:underline"
              title={value}
              onClick={() =>
                onCompanyDetails(
                  value,
                  row.original["data_center_operator"][0].id || ""
                )
              }
            >
              {value}
            </div>
          );
        },
      },
      {
        accessorKey: "city",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            City
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const value = row.original.city?.[0]?.city || "-";
          return (
            <BlurMask shouldBlur={isTrialUser}>
              <div
                className="text-gray-900 text-sm max-w-[100px] truncate"
                title={value}
              >
                {value}
              </div>
            </BlurMask>
          );
        },
      },

      {
        accessorKey: "region",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Region
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = String(getValue());
          return (
            <BlurMask shouldBlur={isTrialUser}>
              <div
                className="text-gray-900 text-sm max-w-[100px] truncate"
                title={value}
              >
                {value}
              </div>
            </BlurMask>
          );
        },
      },
      {
        accessorKey: "country",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Country
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = String(getValue());
          return (
            <BlurMask shouldBlur={isTrialUser}>
              <div
                className="text-gray-900 text-sm max-w-[100px] truncate"
                title={value}
              >
                {value}
              </div>
            </BlurMask>
          );
        },
      },
      {
        accessorKey: "data_center_status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Status
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const status = String(getValue()).toLowerCase();
          const variant = formatDataCenterStatus(status);
          return (
            <BlurMask shouldBlur={isTrialUser}>
              <Badge variant={variant} className="text-xs px-2 py-1">
                {String(getValue())}
              </Badge>
            </BlurMask>
          );
        },
      },
      {
        accessorKey: "year_of_commission",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Commissioned (Year)
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = String(getValue() || "N/A");
          return (
            <BlurMask shouldBlur={isTrialUser}>
              <div
                className="text-gray-900 text-sm max-w-[100px] truncate"
                title={value}
              >
                {value}
              </div>
            </BlurMask>
          );
        },
      },
      {
        accessorKey: "data_center_tier_level",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Tier Certification
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = String(getValue());
          return (
            <BlurMask shouldBlur={isTrialUser}>
              <div
                className="text-gray-900 text-sm max-w-[100px] truncate"
                title={value}
              >
                {value}
              </div>
            </BlurMask>
          );
        },
      },
      {
        accessorKey: "data_center_type",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Facility Type
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = String(getValue());
          return (
            <BlurMask shouldBlur={isTrialUser}>
              <div
                className="text-gray-900 text-sm max-w-[100px] truncate"
                title={value}
              >
                {value}
              </div>
            </BlurMask>
          );
        },
      },
      {
        accessorKey: "current_it_load_capacity",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Current IT Load Capacity (MW)
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const currentCapacity = getValue() as number | null;
          return (
            <BlurMask shouldBlur={isTrialUser}>
              <div
                className="text-gray-900 font-medium text-sm max-w-[100px] truncate"
                title={currentCapacity?.toString() || "N/A"}
              >
                {currentCapacity}
              </div>
            </BlurMask>
          );
        },
      },
      {
        accessorKey: "expected_it_load_capacity_mw",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Expected IT Load Capacity (MW)
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = String(getValue());
          return (
            <BlurMask shouldBlur={isTrialUser}>
              <div
                className="text-gray-900 font-medium text-sm max-w-[100px] truncate"
                title={value}
              >
                {value}
              </div>
            </BlurMask>
          );
        },
      },
      ...loadCapacityColumns,
      {
        id: "actions",
        header: () => (
          <Button
            variant="ghost"
            className="flex items-center gap-2 p-0 font-medium text-xs"
            disabled
          >
            Actions
          </Button>
        ),
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(row.original.dc_id || row.original.id)}
            className="flex items-center gap-1 px-2 py-1 text-xs"
          >
            <Eye className="w-3 h-3" />
            View
          </Button>
        ),
      },
    ],
    [loadCapacityColumns, user?.favouriteDataCenters, handleFavoriteToggle, onViewDetails, onCompanyDetails, isTrialUser]
  );

  // console.log("tableData is ",tableData);
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, // Enable server-side pagination
    pageCount: -1, // Unknown total pages for cursor-based pagination
    state: {
      globalFilter: tableSearchValue,
      sorting: sorting,
    },
    onSortingChange: setSorting,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase();
      const value = String(row.getValue(columnId) || "").toLowerCase();
      return value.includes(searchValue);
    },
    onGlobalFilterChange: setTableSearchValue,
  });

  // Mobile Card Component
  const MobileCard: React.FC<{ item: DataCenterTableRows }> = ({ item }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <button
              onClick={() => onViewDetails(item.dc_id || item.id)}
              className="font-medium text-blue-600 hover:underline text-left text-sm break-words"
            >
              {item["data_center_facility_name"]}
            </button>
            <div className="text-xs text-gray-500 mt-1">{item.dc_id}</div>
          </div>
        </div>
        <BlurMask shouldBlur={isTrialUser}>
          <Badge
            variant={formatDataCenterStatus(item["data_center_status"] || "")}
            className="text-xs px-2 py-1 ml-2 shrink-0"
          >
            {item["data_center_status"]}
          </Badge>
        </BlurMask>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-gray-500">Operator:</span>
          <div className="font-medium text-gray-900 mt-1 break-words">
            {item["data_center_operator"][0].company}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Location:</span>
          <BlurMask shouldBlur={isTrialUser}>
            <div className="font-medium text-gray-900 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="break-words">
                {item.city[0].city}, {item.country[0]}
              </span>
            </div>
          </BlurMask>
        </div>
        <div>
          <span className="text-gray-500">IT Load:</span>
          <BlurMask shouldBlur={isTrialUser}>
            <div className="font-medium text-gray-900 mt-1">
              {getCurrentYearItLoadCapacity(item["it_load_capacity_by_year"])}{" "}
              MW
            </div>
          </BlurMask>
        </div>
        <div>
          <span className="text-gray-500">Commissioned:</span>
          <BlurMask shouldBlur={isTrialUser}>
            <div className="font-medium text-gray-900 mt-1">
              {item["year_of_commission"] || "N/A"}
            </div>
          </BlurMask>
        </div>
        <div>
          <span className="text-gray-500">Tier Certification:</span>
          <BlurMask shouldBlur={isTrialUser}>
            <div className="font-medium text-gray-900 mt-1">
              {item["data_center_tier_level"]}
            </div>
          </BlurMask>
        </div>
        <div>
          <span className="text-gray-500">Facility Type:</span>
          <BlurMask shouldBlur={isTrialUser}>
            <div className="font-medium text-gray-900 mt-1 break-words">
              {item["data_center_type"]}
            </div>
          </BlurMask>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(item.dc_id || item.id)}
          className="w-full flex items-center justify-center gap-2 text-xs"
        >
          <Eye className="w-3 h-3" />
          View Details
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 p-4 lg:p-8 *:h-[300px] flex items-center justify-center">
        <div className="flex justify-center items-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 relative">
      {/* Table Header */}
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
                <MobileCard
                  key={row.original.id || row.original.dc_id}
                  item={row.original}
                />
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
                      <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
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

      {/* Pagination */}
      <div className="px-3 lg:px-4 py-3 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-500 text-center sm:text-left">
            Page {currentPage} of{" "}
            {totalPages} • Showing{" "}
            {data.length} Data Centers from {totalDataCenters} total
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded border border-gray-300 px-2 py-1 text-xs"
            >
              {[20, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                  {/* <span className="hidden sm:inline"> per page</span> */}
                  {" per page"}
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
