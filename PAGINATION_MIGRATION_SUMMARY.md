# Company Table Pagination Migration - Summary

## Changes Made

### 1. **API Response Type Updates** (`datacenter.types.ts`)

#### ApiCompanyResponse Interface

**Old (Page-based)**:

```typescript
export interface ApiCompanyResponse<T = unknown> {
  companies: T[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}
```

**New (Offset-based)**:

```typescript
export interface ApiCompanyResponse<T = unknown> {
  companies: T[];
  limit: number;
  nextOffset: number | null; // null when no more data
  hasMore: boolean;
  total: number; // Count of items in current response
}
```

#### CompanyFilters Interface

**Old**:

```typescript
export interface CompanyFilters {
  page?: number; // Page number (1, 2, 3...)
  limit?: number;
  // ... other filters
}
```

**New**:

```typescript
export interface CompanyFilters {
  offset?: number; // Record offset (0, 20, 40...)
  limit?: number;
  // ... other filters
}
```

### 2. **CompanyDataTable Component** (`CompanyDataTable.tsx`)

#### Props Interface

**Old**:

```typescript
interface CompanyDataTableProps {
  data: CompanyRow[];
  loading?: boolean;
  onViewDetails: (id: string) => void;
  pagination: { pageIndex: number; pageSize: number };
  totalRows: number;
  totalPages: number;
  onPaginationChange: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
}
```

**New**:

```typescript
interface CompanyDataTableProps {
  data: CompanyRow[];
  loading?: boolean;
  onViewDetails: (id: string) => void;
  hasMore: boolean; // Can fetch more data
  currentPage: number; // Page number (1, 2, 3...)
  pageSize: number; // Items per page
  totalInCurrentPage: number; // Items in current page
  onNextPage: () => void; // Navigate forward
  onPreviousPage: () => void; // Navigate backward
  onPageSizeChange: (pageSize: number) => void;
  canGoPrevious: boolean; // Can go back
}
```

#### Table Configuration Changes

**Old**:

```typescript
const table = useReactTable({
  data,
  columns,
  pageCount: totalPages,
  state: { pagination },
  onPaginationChange: handlePaginationChange,
  manualPagination: true,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
```

**New**:

```typescript
const table = useReactTable({
  data,
  columns,
  pageCount: -1, // Unknown total pages (offset pagination)
  state: { pagination: { pageIndex: 0, pageSize } },
  manualPagination: true,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
```

#### Pagination Controls Changes

**Old**:

```typescript
// Page size dropdown
<select
  value={pagination.pageSize}
  onChange={(e) => onPaginationChange({
    pageIndex: 0,
    pageSize: Number(e.target.value)
  })}
>
  {[20, 50, 100].map((size) => (
    <option key={size} value={size}>{size}</option>
  ))}
</select>

// Previous button
<Button
  onClick={() => onPaginationChange({
    pageIndex: pagination.pageIndex - 1,
    pageSize: pagination.pageSize
  })}
  disabled={pagination.pageIndex === 0}
>
  Previous
</Button>

// Next button
<Button
  onClick={() => onPaginationChange({
    pageIndex: pagination.pageIndex + 1,
    pageSize: pagination.pageSize
  })}
  disabled={pagination.pageIndex >= totalPages - 1}
>
  Next
</Button>

// Page info
<div>Page {pagination.pageIndex + 1} of {totalPages}</div>
```

**New**:

```typescript
// Page size dropdown
<select
  value={pageSize}
  onChange={(e) => onPageSizeChange(Number(e.target.value))}
>
  {[20, 50, 100].map((size) => (
    <option key={size} value={size}>{size}</option>
  ))}
</select>

// Previous button
<Button
  onClick={onPreviousPage}
  disabled={!canGoPrevious}
>
  Previous
</Button>

// Next button
<Button
  onClick={onNextPage}
  disabled={!hasMore}
>
  Next
</Button>

// Page info
<div>Page {currentPage} • {totalInCurrentPage} items
  {hasMore && '(more available)'}
</div>
```

### 3. **CompanyDashboard Component** (`CompanyDashboard.tsx`)

#### State Management Changes

**Old**:

```typescript
const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 20,
});
```

**New**:

```typescript
// Offset-based pagination state
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(20);
const [currentOffset, setCurrentOffset] = useState(0);
const [pageCache, setPageCache] = useState<Map<number, PageCache>>(new Map());

interface PageCache {
  data: APICompany[];
  offset: number;
  nextOffset: number | null;
}
```

#### API Filter Conversion Changes

**Old**:

```typescript
const convertFiltersToAPI = (filterState: CompanyFilterState, page: number) => {
  return {
    page,
    limit: pagination.pageSize,
    // ... other filters
  };
};
```

**New**:

```typescript
const convertFiltersToAPI = (
  filterState: CompanyFilterState,
  offset: number,
  limit: number
) => {
  return {
    offset,
    limit,
    // ... other filters
  };
};
```

#### React Query Configuration Changes

**Old**:

```typescript
const queryKey = [
  "companies",
  appliedFilters,
  pagination.pageIndex,
  pagination.pageSize,
  searchValue,
];

useQuery({
  queryKey,
  queryFn: async () => {
    const apiFilters = convertFiltersToAPI(
      appliedFilters,
      pagination.pageIndex + 1 // Convert 0-based to 1-based
    );
    return await getCompanies(apiFilters);
  },
  // ... options
});
```

**New**:

```typescript
const queryKey = [
  "companies",
  appliedFilters,
  currentOffset, // Use offset directly
  pageSize,
  searchValue,
];

useQuery<CompanyListResponse, Error>({
  queryKey,
  queryFn: async () => {
    const apiFilters = convertFiltersToAPI(
      appliedFilters,
      currentOffset, // Pass current offset
      pageSize
    );
    return await getCompanies(apiFilters);
  },
  placeholderData: (previousData) => previousData, // Smooth transitions
  // ... options
});
```

#### Response Data Extraction Changes

**Old**:

```typescript
const companies = companiesData?.companies || [];
const totalRows = companiesData?.total || 0;
const totalPages = companiesData?.totalPages || 0;
```

**New**:

```typescript
const companies = useMemo(
  () => companiesData?.companies || [],
  [companiesData?.companies]
);
const hasMore = companiesData?.hasMore || false;
const totalInCurrentPage = companiesData?.total || 0;
```

#### Client-Side Caching Implementation

**New (Added)**:

```typescript
// Cache current page data when data arrives
useEffect(() => {
  if (companiesData && companies.length > 0) {
    setPageCache((prev) => {
      const newCache = new Map(prev);
      newCache.set(currentPage, {
        data: companies,
        offset: currentOffset,
        nextOffset: companiesData.nextOffset ?? null,
      });
      return newCache;
    });
  }
}, [companiesData, currentPage, currentOffset, companies]);
```

#### Pagination Handler Changes

**Old**:

```typescript
const handlePaginationChange = (newPagination: {
  pageIndex: number;
  pageSize: number;
}) => {
  setPagination(newPagination);
};
```

**New**:

```typescript
// Navigate to next page
const handleNextPage = useCallback(() => {
  if (
    companiesData?.nextOffset !== null &&
    companiesData?.nextOffset !== undefined
  ) {
    setCurrentOffset(companiesData.nextOffset);
    setCurrentPage((prev) => prev + 1);
  }
}, [companiesData?.nextOffset]);

// Navigate to previous page (using cache)
const handlePreviousPage = useCallback(() => {
  if (currentPage > 1) {
    const previousPageData = pageCache.get(currentPage - 1);
    if (previousPageData) {
      setCurrentOffset(previousPageData.offset);
      setCurrentPage((prev) => prev - 1);
    }
  }
}, [currentPage, pageCache]);

// Change page size (resets to page 1)
const handlePageSizeChange = useCallback((newSize: number) => {
  setPageSize(newSize);
  setCurrentPage(1);
  setCurrentOffset(0);
  setPageCache(new Map());
}, []);

// Can go to previous page
const canGoPrevious = currentPage > 1;
```

#### Filter Handler Changes

**Old**:

```typescript
const handleApplyFilters = () => {
  setAppliedFilters(filters);
  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  if (isMobile) setIsFilterOpen(false);
};
```

**New**:

```typescript
const handleApplyFilters = () => {
  setAppliedFilters(filters);
  setCurrentPage(1);
  setCurrentOffset(0);
  setPageCache(new Map());
  if (isMobile) setIsFilterOpen(false);
};
```

#### Table Component Usage Changes

**Old**:

```typescript
<CompanyDataTable
  data={companies}
  loading={loading}
  onViewDetails={handleViewDetails}
  pagination={pagination}
  totalRows={totalRows}
  totalPages={totalPages}
  onPaginationChange={handlePaginationChange}
/>
```

**New**:

```typescript
<CompanyDataTable
  data={companies}
  loading={loading}
  hasMore={hasMore}
  currentPage={currentPage}
  pageSize={pageSize}
  totalInCurrentPage={totalInCurrentPage}
  onNextPage={handleNextPage}
  onPreviousPage={handlePreviousPage}
  onPageSizeChange={handlePageSizeChange}
  canGoPrevious={canGoPrevious}
  onViewDetails={handleViewDetails}
/>
```

## Key Behavioral Changes

### Pagination Flow

**Old (Page-based)**:

1. User clicks page 3
2. Frontend sends `page=3, limit=20` to API
3. Backend returns items 41-60 + total count
4. Frontend knows total pages = totalCount / limit
5. Can jump to any page directly

**New (Offset-based)**:

1. User clicks Next
2. Frontend sends `offset=20, limit=20` to API
3. Backend returns items 21-40 + nextOffset (40)
4. Frontend caches page data locally
5. User clicks Previous → uses cached data (no API call)
6. User clicks Next again → sends `offset=40` to API

### Advantages of Offset-Based Pagination

1. **Scalability**: No need to count total rows (expensive for large datasets)
2. **Performance**: Backend only needs to check if more data exists
3. **Consistency**: Better handling of concurrent data mutations
4. **Simplicity**: Backend doesn't track total pages

### Disadvantages

1. **No Page Jumping**: Can only go Next/Previous sequentially
2. **No Total Count**: Can't show "Page 3 of 150"
3. **Client Cache Required**: Need to cache previous pages for backward navigation
4. **Memory Usage**: Cache grows with navigation (implement limits if needed)

## Testing Checklist

- [✅] First page loads correctly
- [✅] Next button navigates forward with API call
- [✅] Previous button navigates backward using cached data
- [✅] Page size changes reset to page 1 and clear cache
- [✅] Filter changes reset pagination and clear cache
- [✅] Loading states display correctly during transitions
- [✅] No TypeScript compilation errors
- [✅] Pagination controls disable appropriately (first/last page)

## Files Modified

1. `/src/network/datacenter/datacenter.types.ts`

   - Updated `ApiCompanyResponse` interface
   - Changed `CompanyFilters` from page to offset

2. `/src/components/companies/CompanyDataTable.tsx`

   - Updated props interface
   - Simplified table configuration
   - Rewrote pagination controls

3. `/src/components/companies/CompanyDashboard.tsx`
   - Added offset-based state management
   - Implemented client-side caching
   - Created new pagination handlers
   - Updated React Query configuration
   - Updated table component usage

## Documentation Created

1. `PAGINATION_IMPLEMENTATION_GUIDE.md` - Complete implementation guide with examples
2. `PAGINATION_MIGRATION_SUMMARY.md` (this file) - Summary of all changes made

---

**Migration Completed**: January 2025
**Version**: Offset-based Pagination v2.0
