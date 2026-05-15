# News API Update Summary

## Overview

Updated the News Dashboard and related components to match the backend API structure.

## Backend API Specification

```typescript
public getNews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      searchQuery,
      startDate,
      endDate,
      page = 1,
      count = 20,
      sortBy = "publishedDate",
      sortOrder = "desc",
      includeBody = false,
    } = req.body;
    // ...
  }
);
```

## Changes Made

### 1. Updated Types (`news.types.ts`)

**Before:**

```typescript
export interface NewsFilters {
  search?: string;
  dateRange?: NewsDateRange;
  keywordLocation?: string;
  page?: number;
  count?: number;
  includeBody?: boolean;
}
```

**After:**

```typescript
export interface NewsFilters {
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  count?: number;
  sortBy?: string;
  sortOrder?: string;
  includeBody?: boolean;
}
```

**Removed:**

- `NewsDateRange` interface (no longer needed)
- `keywordLocation` property (not supported by backend)

### 2. Updated API Function (`news.api.ts`)

**Key Changes:**

- Changed `search` → `searchQuery`
- Changed `dateRange.from` → `startDate`
- Changed `dateRange.to` → `endDate`
- Removed `keywordLocation` parameter
- Added `sortBy` and `sortOrder` parameters
- Changed default `count` from 10 to 20

### 3. Updated NewsDashboard Component

**Changes:**

- Updated filter counting logic to use `searchQuery`, `startDate`, `endDate`
- Updated default filters to include `sortBy` and `sortOrder`
- Changed default `count` from 10 to 20

### 4. Updated NewsFilterSidebar Component

**Major Changes:**

- Replaced `search` state with `searchQuery`
- Replaced `dateRange` object with separate `startDate` and `endDate` states
- Removed "Search In" radio buttons section (keywordLocation)
- Updated date validation to use new field names
- Updated labels: "From Date" → "Start Date", "To Date" → "End Date"

**Removed Features:**

- Keyword location filter (Title/Body/Both) - not supported by backend

## Filter Capabilities

### ✅ Available Filters

1. **Search Query** - Text search across news articles
2. **Start Date** - Filter articles from this date onwards
3. **End Date** - Filter articles up to this date

### ❌ Removed Filters

1. **Keyword Location** - Previously allowed searching in title only, body only, or both

## Date Validation

- Dates cannot be in the future
- Start date must be before or equal to End date
- Toast notifications for validation errors

## Default Values

- `page`: 1
- `count`: 20 (changed from 10)
- `sortBy`: "publishedDate"
- `sortOrder`: "desc"
- `includeBody`: false
- `searchQuery`: "" (empty string)

## API Request Body Example

```typescript
{
  "searchQuery": "data center",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "page": 1,
  "count": 20,
  "sortBy": "publishedDate",
  "sortOrder": "desc",
  "includeBody": false
}
```

## Files Modified

1. `/src/network/news/news.types.ts` - Updated interfaces
2. `/src/network/news/news.api.ts` - Updated API function
3. `/src/components/news/NewsDashboard.tsx` - Updated component logic
4. `/src/components/news/NewsFilterSidebar.tsx` - Updated filter UI and logic

## Testing Checklist

- [ ] Search query filtering works
- [ ] Start date filtering works
- [ ] End date filtering works
- [ ] Date validation works correctly
- [ ] Pagination works with new API
- [ ] Clear filters resets all values
- [ ] Mobile filter sidebar works
- [ ] No console errors or TypeScript errors
