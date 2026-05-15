import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ArrowUpDown, Search } from "lucide-react";
import { Button, Loading } from "@/components/ui";
import { getITLoadData } from "@/network";
import type { ITLoadData, FilterState, ITLoadFilters } from "@/network";

interface ITLoadTableProps {
  filters: FilterState;
  searchValue: string;
}

// Query function for fetching IT load data
const fetchITLoadData = async ({
  filters,
  searchValue,
  pageIndex,
  pageSize,
}: {
  filters: FilterState;
  searchValue: string;
  pageIndex: number;
  pageSize: number;
}) => {
  // Convert FilterState to ITLoadFilters format
  const itLoadFilters: ITLoadFilters = {
    page: pageIndex + 1,
    limit: pageSize,
    sortBy: "operator",
    sortOrder: "desc",
  };

  // Add filters from FilterState
  if (filters.regions && filters.regions.length > 0) {
    itLoadFilters.regions = filters.regions; // Pass array of regions
  }

  if (filters.countries && filters.countries.length > 0) {
    itLoadFilters.countries = filters.countries; // Pass array of countries
  }

  if (filters.cities && filters.cities.length > 0) {
    itLoadFilters.cities = filters.cities; // Pass array of cities
  }

  if (filters.operators && filters.operators.length > 0) {
    itLoadFilters.operator = filters.operators[0]; // ITLoad API takes single operator
  }

  // Add Certifications/Tiers (tierLevels) filter
  if (filters.tierLevels && filters.tierLevels.length > 0) {
    itLoadFilters.tierLevel = filters.tierLevels[0]; // ITLoad API takes single tier level
  }

  // Add Facility Type (dcTypes) filter
  if (filters.dcTypes && filters.dcTypes.length > 0) {
    itLoadFilters.facilityType = filters.dcTypes[0]; // ITLoad API takes single facility type
  }

  // Add Asset/Project Status (statuses) filter
  if (filters.statuses && filters.statuses.length > 0) {
    itLoadFilters.statuses = filters.statuses; // ITLoad API takes single status
  }

  // Add search value
  if (searchValue && searchValue.trim()) {
    itLoadFilters.operator = searchValue.trim(); // Use search as operator filter
  }

  // Add year range if different from default
  if (filters.yearRange && filters.yearRange.length === 2) {
    const [minYear, maxYear] = filters.yearRange;
    if (minYear !== 2000) itLoadFilters.minYear = minYear;
    if (maxYear !== 2030) itLoadFilters.maxYear = maxYear;
  }

  const response = await getITLoadData(itLoadFilters);

  return {
    itLoadData: response.itLoadData || [],
    total: response.total || 0,
    totalPages: response.totalPages || 1,
  };
};

export const ITLoadTable: React.FC<ITLoadTableProps> = ({
  filters,
  searchValue,
}) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [tableSearchValue, setTableSearchValue] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Mobile state management
  const [isMobile, setIsMobile] = useState(false);

  // Use React Query for data fetching and caching
  const {
    data: queryData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: [
      "itLoadData",
      filters,
      searchValue,
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: () =>
      fetchITLoadData({
        filters,
        searchValue,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Extract data from query response
  const itLoadData = queryData?.itLoadData || [];
  const totalRecords = queryData?.total || 0;
  const totalPages = queryData?.totalPages || 1;

  // Convert error to string for display
  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "Failed to load IT load data"
    : null;

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Use md breakpoint for table vs card view
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const columns = useMemo<ColumnDef<ITLoadData>[]>(
    () => [
      // {
      //   id: "checkbox",
      //   header: ({ table }) => (
      //     <input
      //       type="checkbox"
      //       checked={table.getIsAllRowsSelected()}
      //       onChange={table.getToggleAllRowsSelectedHandler()}
      //       className="rounded border-gray-300 w-3 h-3"
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <input
      //       type="checkbox"
      //       checked={row.getIsSelected()}
      //       onChange={row.getToggleSelectedHandler()}
      //       className="rounded border-gray-300 w-3 h-3"
      //     />
      //   ),
      //   size: 40,
      // },
      {
        accessorKey: "Data Center",
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
        cell: ({ getValue, row }) => {
          const value = String(getValue());
          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 text-xs font-bold">
                  {value.charAt(0)}
                </span>
              </div>
              <div>
                <div
                  className="font-medium text-blue-600 text-sm text-left max-w-[100px] truncate"
                  title={value} // Tooltip on hover
                >
                  {value}
                </div>
                <div className="text-xs text-gray-500">{row.original.id}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "Operator / Owner",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Operator / Owner
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = String(getValue());
          return (
            <div
              className="text-gray-900 text-sm max-w-[100px] truncate"
              title={value}
            >
              {value}
            </div>
          );
        },
      },
      {
        accessorKey: "Country",
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
            <div
              className="text-gray-900 text-sm max-w-[100px] truncate"
              title={value}
            >
              {value}
            </div>
          );
        },
      },
      {
        accessorKey: "Total / Planned IT Load (MW)",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 p-0 font-medium text-xs"
          >
            Total IT Load (MW)
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = String(getValue() || "N/A");
          return (
            <div
              className="text-gray-900 font-medium text-sm max-w-[100px] truncate"
              title={value}
            >
              {value}
            </div>
          );
        },
      },
    ],
    []
  );

  // Years 2016 to 2030 dynamically as columns
  const yearColumns = useMemo(() => {
    const years: ColumnDef<ITLoadData>[] = [];
    for (let year = 2016; year <= 2030; year++) {
      years.push({
        accessorKey: `IT Load ${year} (MW)`,
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
        cell: ({ getValue }: { getValue: () => unknown }) => {
          const value = getValue();
          if (value) {
            return (
              <div
                className="text-gray-900 text-sm font-medium max-w-[100px] truncate"
                title={value as string}
              >
                {value as string}
              </div>
            );
          }
          return <div className="text-gray-400 text-sm">-</div>;
        },
        size: 60,
      });
    }
    return years;
  }, []);

  const allColumns = useMemo(
    () => [...columns, ...yearColumns],
    [columns, yearColumns]
  );

  const table = useReactTable({
    data: itLoadData,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // We're using manual pagination, so we don't want the library to paginate the data
    // as we're already receiving paginated data from the API
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
      globalFilter: tableSearchValue,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount: totalPages,
    enableRowSelection: true,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase();
      const value = String(row.getValue(columnId)).toLowerCase();
      return value.includes(searchValue);
    },
    onGlobalFilterChange: setTableSearchValue,
  });

  // Mobile Card Component
  const MobileCard: React.FC<{ item: ITLoadData }> = ({ item }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-blue-600 text-sm font-bold">
              {item["Data Center"].charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900 text-sm">
              {item["Data Center"]}
            </div>
            <div className="text-xs text-gray-500">{item.id}</div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-gray-500">Operator:</span>
          <div className="font-medium text-gray-900 break-words">
            {item["Operator / Owner"]}
          </div>
        </div>
        <div>
          <span className="text-gray-500">City:</span>
          <div className="font-medium text-gray-900">{item.City}</div>
        </div>
        <div>
          <span className="text-gray-500">Total IT Load:</span>
          <div className="font-medium text-gray-900">
            {item["Total / Planned IT Load (MW)"] || "N/A"} MW
          </div>
        </div>
        <div>
          <span className="text-gray-500">Latest Year:</span>
          <div className="font-medium text-gray-900">
            {item["IT Load 2024 (MW)"] || "N/A"} MW
          </div>
        </div>
      </div>
    </div>
  );

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center z-50">
  //       <Loading />
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center py-6 text-red-600">
          Error: {errorMessage}
        </div>
      </div>
    );
  }

  if (!itLoadData.length && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center py-6 text-gray-500">
          No IT load data available for the selected filters
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Table Header */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="text-base font-medium text-gray-900">IT Load Data</h3>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search in table..."
              value={tableSearchValue}
              onChange={(e) => setTableSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Showing {itLoadData.length} of {totalRecords} results
        </div>
      </div>

      {/* Conditional Rendering: Mobile Cards vs Desktop Table */}
      {isMobile ? (
        /* Mobile Card View */
        <div className="p-4 space-y-4">
          {table.getRowModel().rows.length === 0 && tableSearchValue ? (
            <div className="text-center py-8 text-gray-500">
              No results found for "{tableSearchValue}"
            </div>
          ) : table.getRowModel().rows.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              No IT load data available for the selected filters
            </div>
          ) : table.getRowModel().rows.length > 0 ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <MobileCard key={row.original.id} item={row.original} />
              ))
          ) : null}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto max-h-[600px] min-h-[500px]">
          <table className="w-full relative">
            <thead className="sticky top-0 bg-white z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
            {loading ? (
              <tbody>
                <tr className="min-h-[200px] h-full">
                  <td colSpan={allColumns.length} className="py-8">
                    <div className="flex items-center justify-center">
                      <Loading />
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-200">
                {table.getRowModel().rows.length === 0 && tableSearchValue ? (
                  <tr>
                    <td
                      colSpan={allColumns.length}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      No results found for "{tableSearchValue}"
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={allColumns.length}
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      No IT load data available for the selected filters
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
            )}
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="px-3 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Page {pagination.pageIndex + 1} of {totalPages || 1} ({totalRecords}{" "}
            total)
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pagination.pageSize}
              onChange={(e) => {
                // When changing page size, reset to first page
                const newPageSize = Number(e.target.value);
                setPagination({
                  pageIndex: 0,
                  pageSize: newPageSize,
                });
              }}
              className="rounded border border-gray-300 px-2 py-1 text-xs"
            >
              {[20, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} per page
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (pagination.pageIndex > 0) {
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: prev.pageIndex - 1,
                  }));
                }
              }}
              disabled={pagination.pageIndex === 0}
              className="px-2 py-1 text-xs"
            >
              <ChevronLeft className="w-3 h-3" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (pagination.pageIndex < totalPages - 1) {
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: prev.pageIndex + 1,
                  }));
                }
              }}
              disabled={pagination.pageIndex >= totalPages - 1}
              className="px-2 py-1 text-xs"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
