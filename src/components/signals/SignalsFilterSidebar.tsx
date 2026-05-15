import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Input, Select, Loading } from "@/components/ui";
import { X, Calendar, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNewsFilterCategories } from "@/network/news/news.api";
import { updateNewsFavorite } from "@/network/signals/signals.api";
import type { NewsFilterCategory } from "@/network/news/news.types";
import type { TSignalsFilterState } from "@/hooks/useSessionFilters";
import type { WatchlistItem as WatchListItem } from "@/network/signals/signals.types";
import { Root, List, Trigger, Content } from "@radix-ui/react-tabs";

interface SignalsFilterSidebarProps {
  filters: TSignalsFilterState;
  filterOptions: {
    regions: { value: string; label: string }[];
    impacts: { value: string; label: string }[];
  } | null;
  onFiltersChange: (filters: TSignalsFilterState) => void;
  onApplyFilters: (filters: TSignalsFilterState) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
  onClose?: () => void;
  myWatchList?: WatchListItem[];
  loading: boolean;
  // desktop-only: render only the watchlist panel (used in SidBarHOC)
  watchlistOnly?: boolean;
}

export const SignalsFilterSidebar: React.FC<SignalsFilterSidebarProps> = ({
  filters,
  filterOptions,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isMobile = false,
  onClose,
  myWatchList = [],
  loading,
  watchlistOnly = false,
}) => {
  // Base filters
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");
  const [selectedRegion, setSelectedRegion] = useState<string>(filters.region || "");
  const [selectedImpact, setSelectedImpact] = useState<string>(filters.impact || "");
  const [taxonomyOpen, setTaxonomyOpen] = useState(false);
const taxonomyRef = useRef<HTMLDivElement>(null);
  // New filters
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Watchlist state
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const removeFromWatchList = useMutation({
    mutationFn: (newsId: string) =>
      updateNewsFavorite({ newsId, action: "remove" }),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["signals-dashboard"] });
      setRemovingId(null);
    },
  });

  const {
    data: filterData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["newsFilterCategories"],
    queryFn: getNewsFilterCategories,
    staleTime: 60 * 60 * 1000,
  });

  const findCategoryPaths = useCallback(
    (categories: NewsFilterCategory[], targetNames: string[], parentPath = ""): string[] => {
      const paths: string[] = [];
      categories.forEach((cat) => {
        const currentPath = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
        if (targetNames.includes(cat.name)) paths.push(currentPath);
        if (cat.children?.length)
          paths.push(...findCategoryPaths(cat.children, targetNames, currentPath));
      });
      return paths;
    },
    []
  );

  useEffect(() => {
    if (filterData?.categories?.categories) {
      const targetNames = [
        ...(filters.categories || []),
        ...(filters.subCategories || []),
      ];
      setSelectedCategories(
        findCategoryPaths(filterData.categories.categories, targetNames)
      );
    }
  }, [filterData, filters.categories, filters.subCategories, findCategoryPaths]);

  useEffect(() => {
    setSearchQuery(filters.searchQuery || "");
    setSelectedRegion(filters.region || "");
    setSelectedImpact(filters.impact || "");
    setStartDate(filters.startDate || "");
    setEndDate(filters.endDate || "");
  }, [filters]);
 useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (taxonomyRef.current && !taxonomyRef.current.contains(e.target as Node)) {
      setTaxonomyOpen(false);
    }
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, []);
  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const today = new Date().toISOString().split("T")[0];
    if (value > today) return toast.error("Date cannot be in the future");
    if (field === "startDate" && endDate && value > endDate)
      return toast.error("Start date cannot be later than End date");
    if (field === "endDate" && startDate && value < startDate)
      return toast.error("End date cannot be earlier than Start date");

    const updated = { ...filters, [field]: value || undefined };
    onFiltersChange(updated);
    if (field === "startDate") setStartDate(value);
    else setEndDate(value);
  };

  const toggleCategory = (path: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) newSet.delete(path);
      else newSet.add(path);
      return newSet;
    });
  };

  const handleCategorySelect = (path: string) => {
    setSelectedCategories((prev) => {
      const newCats = prev.includes(path)
        ? prev.filter((c) => c !== path)
        : [...prev, path];

      const level1: string[] = [];
      const sub: string[] = [];

      newCats.forEach((c) => {
        const parts = c.split(" > ");
        if (parts.length === 1) level1.push(c);
        else sub.push(parts[parts.length - 1]);
      });

      onFiltersChange({
        ...filters,
        categories: level1.length ? level1 : undefined,
        subCategories: sub.length ? sub : undefined,
      });

      return newCats;
    });
  };

  const renderCategoryTree = (categories: NewsFilterCategory[], parentPath = "") =>
    categories.map((cat) => {
      const current = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
      const expanded = expandedCategories.has(current);
      const selected = selectedCategories.includes(current);
      const hasChildren = cat.children && cat.children.length > 0;

      return (
        <div key={current} className="mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              {hasChildren && (
                <button onClick={() => toggleCategory(current)} className="p-1 hover:bg-gray-100 rounded">
                  {expanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => handleCategorySelect(current)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
            </label>
          </div>

          {hasChildren && expanded && (
            <div className="ml-6 mt-2 space-y-2">
              {cat.children!.map((subCat) => {
                const subPath = `${current} > ${subCat.name}`;
                const subSelected = selectedCategories.includes(subPath);

                return (
                  <div key={subPath}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subSelected}
                        onChange={() => handleCategorySelect(subPath)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{subCat.name}</span>
                    </label>

                    {subCat.tags && subCat.tags.length > 0 && (
                      <div className="ml-6 mt-1 flex flex-wrap gap-1">
                        {subCat.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                            title={subCat.tags?.join(", ")}
                          >
                            {tag}
                          </span>
                        ))}
                        {subCat.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{subCat.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });

  // ── Desktop watchlist-only panel (rendered inside SidBarHOC) ──────────────
  if (watchlistOnly) {
    return (
      <div className="w-80 h-screen bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Watchlist</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <Loading size="md" text="Loading Watchlist..." />
          ) : myWatchList.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Your watchlist is empty.</div>
            </div>
          ) : (
            myWatchList.map((item) => (
              <div
                key={item._id}
                className="relative group p-3 border border-border rounded-md bg-muted/20 hover:bg-muted transition-colors cursor-pointer"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground hover:text-primary hover:underline truncate break-all block max-w-full pr-6"
                  title={item.title}
                >
                  {item.title}
                </a>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setRemovingId(item._id);
                    removeFromWatchList.mutate(item._id);
                  }}
                  className={`absolute right-2 top-2 text-muted-foreground transition-opacity hover:text-destructive
                    ${removingId === item._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  title="Remove"
                  disabled={removingId === item._id}
                >
                  {removingId === item._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "✕"
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ── Desktop: horizontal filter topbar row ─────────────────────────────────
if (!isMobile) {
  return (
    <div className="w-full flex items-center gap-2 min-w-0">

      {/* Search */}
      <div className="flex-1 min-w-0 max-w-[180px]">
        <Input
          placeholder="Search keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Region */}
      <div className="flex-1 min-w-0 max-w-[150px]">
        <Select
          options={filterOptions?.regions || []}
          value={selectedRegion}
          onChange={(val) => setSelectedRegion(val as string)}
          placeholder="Region..."
        />
      </div>

      {/* Impact */}
      <div className="flex-1 min-w-0 max-w-[140px]">
        <Select
          options={filterOptions?.impacts || []}
          value={selectedImpact}
          onChange={(val) => setSelectedImpact(val as string)}
          placeholder="Impact..."
        />
      </div>

      {/* Start Date */}
      <div className="relative flex-1 min-w-0 max-w-[150px]">
        <Input
          type="date"
          value={startDate}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => handleDateChange("startDate", e.target.value)}
          className="pl-9 w-full"
        />
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      <span className="text-gray-400 text-sm shrink-0">–</span>

      {/* End Date */}
      <div className="relative flex-1 min-w-0 max-w-[150px]">
        <Input
          type="date"
          value={endDate}
          max={new Date().toISOString().split("T")[0]}
          min={startDate || undefined}
          onChange={(e) => handleDateChange("endDate", e.target.value)}
          className="pl-9 w-full"
        />
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Taxonomy */}
      <div className="relative shrink-0" ref={taxonomyRef}>
        <Button
          variant="outline"
          onClick={() => setTaxonomyOpen((p) => !p)}
          className="h-9 text-sm border-gray-300 hover:border-gray-400 whitespace-nowrap"
        >
          Taxonomy
          {selectedCategories.length > 0 && (
            <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
              {selectedCategories.length}
            </span>
          )}
          <ChevronDown className="ml-1.5 w-3.5 h-3.5 opacity-60" />
        </Button>

        {taxonomyOpen && (
          <div className="absolute top-full mt-1 left-0 z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-3 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700">Taxonomy</span>
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="p-3 max-h-64 overflow-y-auto">
              {isLoading ? (
                <Loading size="sm" text="Loading..." />
              ) : error ? (
                <p className="text-xs text-red-500">Error loading categories</p>
              ) : (
                renderCategoryTree(filterData?.categories?.categories ?? [])
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 ml-auto shrink-0">
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="h-9 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 whitespace-nowrap"
        >
          Reset
        </Button>
        <Button
          onClick={() =>
            onApplyFilters({
              searchQuery,
              region: selectedRegion,
              impact: selectedImpact,
              startDate,
              endDate,
              categories: selectedCategories.filter((c) => !c.includes(" > ")),
              subCategories: selectedCategories
                .filter((c) => c.includes(" > "))
                .map((c) => c.split(" > ").pop() || ""),
              page: 1,
              count: 20,
            })
          }
          className="h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm whitespace-nowrap"
        >
          Apply Filters
        </Button>
      </div>

    </div>
  );
}
  // ── Mobile/Tablet: original sidebar (100% unchanged) ──────────────────────
  return (
    <div className={`${isMobile ? "w-80 h-full" : "w-80 h-screen"} bg-white border-r border-gray-200 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 shrink-0 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Sidebar</h2>
        {isMobile && onClose && (
          <Button variant="ghost" size="sm" className="p-2" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Root defaultValue="filter" className="flex-1 flex flex-col">
        <List className="flex border-b border-gray-200 bg-gray-50 shrink-0">
          <Trigger
            value="filter"
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 transition-colors"
          >
            Filter
          </Trigger>
          <Trigger
            value="watchlist"
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 transition-colors"
          >
            Watchlist
          </Trigger>
        </List>

        {/* Watchlist Tab */}
        <Content
          value="watchlist"
          className="flex-1 flex flex-col data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-right-1"
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ overflowX: "visible" }}>
            <div className="space-y-3">
              {loading ? <Loading size="md" text="Loading Watchlist..." /> : null}
              {!loading && myWatchList.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Your watchlist is empty.</div>
                </div>
              ) : null}
              {myWatchList?.map((item) => (
                <div
                  key={item._id}
                  className="relative group p-3 border border-border rounded-md bg-muted/20 hover:bg-muted transition-colors cursor-pointer"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-foreground hover:text-primary hover:underline truncate break-all block max-w-full pr-6"
                    title={item.title}
                  >
                    {item.title}
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setRemovingId(item._id);
                      removeFromWatchList.mutate(item._id);
                    }}
                    className={`absolute right-2 top-2 text-muted-foreground transition-opacity hover:text-destructive
                      ${removingId === item._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    title="Remove"
                    disabled={removingId === item._id}
                  >
                    {removingId === item._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "✕"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Content>

        {/* Filter Tab */}
        <Content
          value="filter"
          className="flex-1 flex flex-col data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-left-1"
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4 sm:space-y-6" style={{ overflowX: "visible" }}>
            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Search</h3>
              <Input
                placeholder="Enter keyword to search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Region + Impact */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Region & Impact</h3>
              <div className="flex gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <Select
                    options={filterOptions?.regions || []}
                    value={selectedRegion}
                    onChange={(val) => setSelectedRegion(val as string)}
                    placeholder="Select Region"
                    className="w-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Select
                    options={filterOptions?.impacts || []}
                    value={selectedImpact}
                    onChange={(val) => setSelectedImpact(val as string)}
                    placeholder="Select Impact"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Publication Date Range</h3>
              <div className="flex items-end gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={startDate}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => handleDateChange("startDate", e.target.value)}
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="text-gray-600 font-semibold mb-2">-</div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={endDate}
                      max={new Date().toISOString().split("T")[0]}
                      min={startDate || undefined}
                      onChange={(e) => handleDateChange("endDate", e.target.value)}
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Taxonomy */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Taxonomy{" "}
                {selectedCategories.length > 0 && (
                  <span className="text-xs text-gray-500">({selectedCategories.length} selected)</span>
                )}
              </h3>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loading size="md" text="Loading Taxonomy..." />
                </div>
              ) : error ? (
                <p className="text-sm text-red-500">Error loading categories</p>
              ) : filterData?.categories?.categories?.length ? (
                <div className="border border-gray-200 rounded-md p-3 max-h-[400px] overflow-y-auto">
                  {renderCategoryTree(filterData.categories.categories)}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No categories available</p>
              )}
            </div>
          </div>

          {/* Sticky buttons */}
          <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-white shadow-lg shrink-0 z-10">
            <div className="flex gap-3 w-full h-14">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex-1 h-full text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                Reset
              </Button>
              <Button
                onClick={() =>
                  onApplyFilters({
                    searchQuery,
                    region: selectedRegion,
                    impact: selectedImpact,
                    startDate,
                    endDate,
                    categories: selectedCategories.filter((c) => !c.includes(" > ")),
                    subCategories: selectedCategories
                      .filter((c) => c.includes(" > "))
                      .map((c) => c.split(" > ").pop() || ""),
                    page: 1,
                    count: 20,
                  })
                }
                className="flex-1 h-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </Content>
      </Root>
    </div>
  );
};