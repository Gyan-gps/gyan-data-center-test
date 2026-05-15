// ─────────────────────────────────────────────────────────────────────
//  DataTable.jsx  —  Generic reusable table powered by TanStack Table v8
// ─────────────────────────────────────────────────────────────────────
//
//  Install:  npm install @tanstack/react-table
//
//  Props
//  ─────
//  title        string          — card heading
//  subtitle     string          — card sub-heading
//  meta         string          — right-side meta text  (e.g. "8 contacts")
//  notice       string          — grey notice bar below header divider
//  columns      ColumnDef[]     — see ColumnDef shape below
//  data         object[]        — raw row data
//  searchKeys   string[]        — keys searched by the search box
//  defaultSort  { key, dir }    — optional initial sort  (dir: "asc"|"desc")
//
//  ColumnDef shape
//  ───────────────
//  key          string                        — accessor key on row object
//  label        string                        — header label
//  sortable?    boolean                       — default true
//  minWidth?    string                        — Tailwind min-w-* class
//  render?      (value, row) => ReactNode     — custom cell renderer
// ─────────────────────────────────────────────────────────────────────

import React, { useState, useMemo, type ReactNode } from "react";

export interface ColumnDefType<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  minWidth?: string;
  render?: (value: any, row: T) => ReactNode;
}

export interface CommonDataTableProps<T = any> {
  title?: string;
  subtitle?: string;
  meta?: ReactNode;
  notice?: string;
  columns?: ColumnDefType<T>[];
  data?: T[];
  searchKeys?: string[];
  defaultSort?: { key: string; dir: "asc" | "desc" };
  showPagination?: boolean;
  globalFilter?: string;
  setGlobalFilter?: (val: string) => void;
  loading?:boolean
}
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

const PAGE_SIZES = [5, 10, 20, 50];

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" | string }) {
  if (sorted === "asc")
    return <ArrowUp className="w-3 h-3 text-indigo-500 shrink-0" />;
  if (sorted === "desc")
    return <ArrowDown className="w-3 h-3 text-indigo-500 shrink-0" />;
  return (
    <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
  );
}

export default function CommonDataTable<T = any>({
  title,
  subtitle,
  meta,
  notice,
  columns: colDefs = [],
  data = [],
  searchKeys = [],
  defaultSort,
  showPagination = true,
  globalFilter,
  setGlobalFilter,
  loading = false
}: CommonDataTableProps<T>) {
  const [sorting, setSorting] = useState<any>(
    defaultSort
      ? [{ id: defaultSort.key, desc: defaultSort.dir === "desc" }]
      : []
  );
  const [pagination, setPagination] = useState<any>({ pageIndex: 0, pageSize: 5 });

  // Convert our simple ColumnDef → TanStack ColumnDef
  const tanstackColumns = useMemo(
    () =>
      colDefs.map((col) => ({
        id: col.key,
        accessorKey: col.key,
        enableSorting: col.sortable !== false,
        // stash minWidth so we can use it in th className
        meta: { minWidth: col.minWidth || "" },
        header: ({ column }: any) =>
          col.sortable === false ? (
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
              {col.label}
            </span>
          ) : (
            <button
              onClick={column.getToggleSortingHandler()}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-indigo-600 transition-colors group whitespace-nowrap"
            >
              {col.label}
              <SortIcon sorted={column.getIsSorted()} />
            </button>
          ),
        cell: ({ getValue, row }: any) =>
          col.render
            ? col.render(getValue(), row.original)
            : String(getValue() ?? "—"),
      })),
    [colDefs]
  );

  // Custom global filter — respects searchKeys
  const globalFilterFn = useMemo(
    () => (row: any, _colId: string, filterValue: any) => {
      const q = String(filterValue).toLowerCase();
      const keys =
        searchKeys.length ? searchKeys : colDefs.map((c) => c.key);
      return keys.some((k) =>
        String(row.getValue(k) ?? "").toLowerCase().includes(q)
      );
    },
    [searchKeys, colDefs]
  );

  const table = useReactTable({
    data,
    columns: tanstackColumns as any,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: (val) => {
      setGlobalFilter && setGlobalFilter(val);
      setPagination((p: any) => ({ ...p, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: globalFilterFn as any,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const totalPages = table.getPageCount();

  return (
    <div className="overflow-hidden">

      {/* ── Notice bar ── */}
      {(notice) && (
        <div className="px-5 py-2 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
          {notice && <p className="text-xs text-slate-400 italic">{notice}</p>}
          {meta && <p className="text-xs text-slate-400 font-medium">{meta}</p>}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-100 bg-slate-50/40"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left ${(header.column.columnDef.meta as any)?.minWidth || ""
                      }`}
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
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={tanstackColumns.length}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  {globalFilter
                    ? `No results for "${globalFilter}"`
                    :  loading ? "Searching for Data"
                    : "No data available"}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                    }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap"
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

      {/* ── Pagination ── */}
      { showPagination && <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          Page {totalPages === 0 ? 0 : pageIndex + 1} of {totalPages} ·{" "}
          {totalFiltered} result{totalFiltered !== 1 ? "s" : ""}
          {globalFilter ? ` for "${globalFilter}"` : ""}
        </p>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
              table.setPageIndex(0);
            }}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} per page
              </option>
            ))}
          </select>

          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3 h-3" /> Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>}
    </div>
  );
}