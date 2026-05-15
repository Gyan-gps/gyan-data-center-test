# Offset-Based Pagination Implementation Guide

## Overview

The `CompanyDataTable` component has been updated to use **offset-based pagination** instead of page-based pagination. This matches the new backend API structure that returns `nextOffset` and `hasMore` instead of total page counts.

## API Response Structure

```typescript
{
  data: Company[],
  nextOffset: number | null,  // null when no more data
  hasMore: boolean,
  total: number  // Count of items in current response
}
```

## Component Interface

```typescript
interface CompanyDataTableProps {
  data: Company[];
  isLoading: boolean;
  hasMore: boolean; // From API response
  currentPage: number; // Track page number (1, 2, 3...)
  pageSize: number; // Current page size (20, 50, 100)
  totalInCurrentPage: number; // Items in current page
  onNextPage: () => void; // Navigate to next page
  onPreviousPage: () => void; // Navigate to previous page
  onPageSizeChange: (size: number) => void; // Change page size
  canGoPrevious: boolean; // Can navigate backwards
  onRowClick?: (company: Company) => void;
}
```

## Parent Component Implementation Example

```tsx
import { useState, useCallback } from "react";
import { CompanyDataTable } from "@/components/companies/CompanyDataTable";
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/network/companies/companies.api";
import type { Company } from "@/types/datacenter";

interface PageCache {
  data: Company[];
  offset: number;
  nextOffset: number | null;
}

export function CompaniesDashboard() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [currentOffset, setCurrentOffset] = useState(0);

  // Cache previous pages for backward navigation
  const [pageCache, setPageCache] = useState<Map<number, PageCache>>(new Map());

  // Filters (if any)
  const [filters, setFilters] = useState({});

  // Fetch data using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["companies", currentOffset, pageSize, filters],
    queryFn: () =>
      getCompanies({
        offset: currentOffset,
        limit: pageSize,
        ...filters,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Cache current page data
  useEffect(() => {
    if (data) {
      setPageCache((prev) => {
        const newCache = new Map(prev);
        newCache.set(currentPage, {
          data: data.data,
          offset: currentOffset,
          nextOffset: data.nextOffset,
        });
        return newCache;
      });
    }
  }, [data, currentPage, currentOffset]);

  // Navigate to next page
  const handleNextPage = useCallback(() => {
    if (data?.nextOffset !== null && data?.nextOffset !== undefined) {
      setCurrentOffset(data.nextOffset);
      setCurrentPage((prev) => prev + 1);
    }
  }, [data?.nextOffset]);

  // Navigate to previous page
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
    setPageCache(new Map()); // Clear cache when page size changes
  }, []);

  // Check if can go to previous page
  const canGoPrevious = currentPage > 1;

  return (
    <div>
      {/* Your filters, search, etc. */}

      <CompanyDataTable
        data={data?.data || []}
        isLoading={isLoading}
        hasMore={data?.hasMore || false}
        currentPage={currentPage}
        pageSize={pageSize}
        totalInCurrentPage={data?.total || 0}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        onPageSizeChange={handlePageSizeChange}
        canGoPrevious={canGoPrevious}
        onRowClick={(company) => {
          // Navigate to company details
          navigate(`/companies/${company.id}`);
        }}
      />
    </div>
  );
}
```

## Key Implementation Points

### 1. **Client-Side Caching**

Since the API doesn't support backward navigation (no previous offset), you must cache previous pages:

```typescript
const [pageCache, setPageCache] = useState<Map<number, PageCache>>(new Map());
```

### 2. **Offset Management**

Track the current offset and update it from the API response:

```typescript
const [currentOffset, setCurrentOffset] = useState(0);

// On next page
setCurrentOffset(data.nextOffset);
```

### 3. **Page Size Changes**

Reset to page 1 and clear cache when page size changes:

```typescript
const handlePageSizeChange = (newSize: number) => {
  setPageSize(newSize);
  setCurrentPage(1);
  setCurrentOffset(0);
  setPageCache(new Map());
};
```

### 4. **Filter Changes**

Reset pagination when filters change:

```typescript
useEffect(() => {
  setCurrentPage(1);
  setCurrentOffset(0);
  setPageCache(new Map());
}, [filters]);
```

### 5. **React Query Integration**

Use `keepPreviousData` to prevent UI flicker during page transitions:

```typescript
useQuery({
  queryKey: ["companies", currentOffset, pageSize, filters],
  queryFn: () =>
    getCompanies({ offset: currentOffset, limit: pageSize, ...filters }),
  keepPreviousData: true, // Important!
  staleTime: 5 * 60 * 1000,
});
```

## Error Handling

```typescript
if (error) {
  return <div>Error loading companies: {error.message}</div>;
}

if (!data && !isLoading) {
  return <div>No companies found</div>;
}
```

## Testing Checklist

- [ ] First page loads correctly
- [ ] Next button navigates forward
- [ ] Previous button navigates backward using cached data
- [ ] Page size changes reset to page 1
- [ ] Filter changes reset pagination
- [ ] Loading states display correctly
- [ ] No console errors
- [ ] Cache doesn't grow infinitely (consider cache size limits)

## Performance Considerations

### Cache Size Management

If users navigate through many pages, the cache can grow large. Consider implementing a cache size limit:

```typescript
const MAX_CACHED_PAGES = 10;

const cachePageData = (page: number, data: PageCache) => {
  setPageCache((prev) => {
    const newCache = new Map(prev);

    // Remove oldest pages if cache is too large
    if (newCache.size >= MAX_CACHED_PAGES) {
      const oldestKey = Math.min(...Array.from(newCache.keys()));
      newCache.delete(oldestKey);
    }

    newCache.set(page, data);
    return newCache;
  });
};
```

## Migration from Page-Based Pagination

### Old Interface (Remove)

```typescript
// ❌ OLD - Remove these
pagination: { pageIndex: number; pageSize: number };
totalPages: number;
totalRows: number;
onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
```

### New Interface (Use)

```typescript
// ✅ NEW - Use these
hasMore: boolean;
currentPage: number;
pageSize: number;
totalInCurrentPage: number;
onNextPage: () => void;
onPreviousPage: () => void;
onPageSizeChange: (size: number) => void;
canGoPrevious: boolean;
```

## Benefits of Offset-Based Pagination

1. **Scalability**: Works with large datasets without counting total rows
2. **Performance**: No expensive COUNT(\*) queries on backend
3. **Simplicity**: Backend only needs to track if more data exists
4. **Consistency**: Handles data mutations better (insertions/deletions)

## Limitations

1. **No jump to specific page**: Can only go forward/backward sequentially
2. **No total count**: Can't show "Page 3 of 150"
3. **Client-side cache**: Requires managing cache in parent component
4. **Memory usage**: Cache grows with navigation (implement limits)

---

**Last Updated**: January 2025
**Component Version**: CompanyDataTable v2.0 (offset-based)
