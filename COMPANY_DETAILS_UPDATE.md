# Company Details UI Update Summary

## Overview

Updated the Company Details component to match the new API response structure from the backend.

## New API Response Structure

```json
{
  "companyInfo": {
    "id": "reclIKV6Eyu1EhOGk",
    "Company": "Adentro Cloud Ltda.",
    "Parent_Company": "Adentro Cloud Ltda.",
    "HQ_Country": ["Brazil"],
    "HQ_City": ["Sao Paulo"],
    "HQ_Region": ["South America"],
    "Generic_Email": "info@adentrocloud.com",
    "Website": "https://adentrocloud.com",
    "Company_Type": "Private",
    "DC_IDs": ["DC-00533"],
    "Created_By": { "id": "...", "email": "...", "name": "..." },
    "Created_Time": "2025-10-08T12:40:46.000Z",
    "Modified_By": { "id": "...", "email": "...", "name": "..." },
    "Last_Modified_Date": "2025-10-09T09:29:06.000Z",
    "_originalDcIds": ["reca2qqBm7GNM5bR1"]
  },
  "assets": [
    {
      "id": "reca2qqBm7GNM5bR1",
      "dcId": "DC-00533",
      "Data Center Facility Name": "RS1",
      "PUE Rating": 1.55,
      "Data Center Status": "Commissioned",
      "Year of Commission": 2016,
      "Data Center Type": "Colocation",
      "Data Center Operator": "Adentro Cloud Ltda.",
      "Project Investment Value (USD)": 7534800,
      "Current IT Load Capacity": 1.17,
      "IT Load (Total/Planned, MW)": 1.17,
      "Net Rentable Capacity (Sq. Ft.)": 4197.96,
      "Number of Racks": 210,
      "Commissioned (Year)": 2016,
      "IT_Load_Capacity_(MW)_2016": 1.17,
      "IT_Load_Capacity_(MW)_2017": 1.17,
      // ... (2018-2030)
      "city": "Porto Alegre",
      "country": "Brazil",
      "region": "South America"
    }
  ],
  "news": []
}
```

## Changes Made

### 1. Updated TypeScript Types

#### CompanyInfo Interface

**Added Fields:**

- `Parent_Company?: string`
- `HQ_Country?: string[]`
- `HQ_City?: string[]`
- `HQ_Region?: string[]`
- `Generic_Email?: string`
- `Website?: string`
- `Company_Type?: string`

#### CompanyAsset Interface

**Completely restructured to match new API:**

- `"Data Center Facility Name"` - Facility name
- `"PUE Rating"` - Power Usage Effectiveness rating
- `"Data Center Status"` - Status (Commissioned, etc.)
- `"Year of Commission"` - Year facility was commissioned
- `"Project Investment Value (USD)"` - Investment in USD (not millions)
- `"Current IT Load Capacity"` - Current IT load
- `"Net Rentable Capacity (Sq. Ft.)"` - Capacity with spaces in field name
- `"IT_Load_Capacity_(MW)_YYYY"` - Yearly IT load capacity (2016-2030)

### 2. Updated Component Field Mappings

#### Company Overview Section

**Before:**

```typescript
companyDetails?.assets[0]?.["Parent Company"];
companyDetails?.assets[0]?.["Company Type"];
companyDetails?.assets[0]?.["Company Email"];
companyDetails?.assets[0]?.["Company Website"];
companyDetails?.assets[0]?.city;
companyDetails?.assets[0]?.country;
companyDetails?.assets[0]?.region;
```

**After:**

```typescript
companyDetails?.companyInfo?.Parent_Company;
companyDetails?.companyInfo?.Company_Type;
companyDetails?.companyInfo?.Generic_Email;
companyDetails?.companyInfo?.Website;
companyDetails?.companyInfo?.HQ_City;
companyDetails?.companyInfo?.HQ_Country;
companyDetails?.companyInfo?.HQ_Region;
```

#### Key Statistics Section

**Updated Calculations:**

- **Total IT Load Capacity**: Uses `asset["IT Load (Total/Planned, MW)"]`
- **Total Project Investment**: Uses `asset["Project Investment Value (USD)"]` (no longer multiplying by 1M)
- **Net Rentable Capacity**: Uses `asset["Net Rentable Capacity (Sq. Ft.)"]` (with spaces)
- **Average PUE**: Uses `asset["PUE Rating"]` from first asset

#### IT Load Timeline Chart

**Updated Data Source:**

```typescript
// Now extracts from asset's yearly IT Load Capacity fields
Object.entries(companyDetails.assets[0])
  .filter(([key]) => key.startsWith("IT_Load_Capacity_(MW)_"))
  .map(([key, value]) => ({
    year: key.replace("IT_Load_Capacity_(MW)_", ""),
    value: (value as number) || 0,
  }));
```

#### Projects Table

**Updated Field Names:**

- **Project Name**: `asset["Data Center Facility Name"]` or `asset.dcId`
- **Status**: `asset.status` or `asset["Data Center Status"]`
- **Investment**: `asset["Project Investment Value (USD)"]` (no multiplication)
- **Completion Year**: `asset["Commissioned (Year)"]` or `asset["Year of Commission"]`

### 3. Key Differences from Old Structure

| Old Field                      | New Field                            | Notes                                   |
| ------------------------------ | ------------------------------------ | --------------------------------------- |
| Assets array had company info  | `companyInfo` object separate        | Company details now in dedicated object |
| `"Company Email"`              | `Generic_Email`                      | Field name changed                      |
| `"Company Website"`            | `Website`                            | Field name simplified                   |
| `city`, `country`, `region`    | `HQ_City`, `HQ_Country`, `HQ_Region` | Arrays in companyInfo                   |
| `"Project Investment (USD M)"` | `"Project Investment Value (USD)"`   | No longer in millions                   |
| `TotalItLoad` object           | IT Load fields in assets             | Yearly data now in asset object         |
| Simple field names             | Fields with spaces/special chars     | More descriptive field names            |

## UI Display Updates

### Company Overview Card

- ✅ Parent Company - from `companyInfo.Parent_Company`
- ✅ Company Type - from `companyInfo.Company_Type`
- ✅ Email - from `companyInfo.Generic_Email` with mailto link
- ✅ Website - from `companyInfo.Website` with external link
- ✅ HQ City - from `companyInfo.HQ_City` array
- ✅ HQ Country - from `companyInfo.HQ_Country` array
- ✅ HQ Region - from `companyInfo.HQ_Region` array

### Key Statistics Card

- ✅ No. of Countries - Calculated from unique asset countries
- ✅ No. of Assets - Asset array length
- ✅ Total IT Load Capacity - From asset IT Load field
- ✅ Total Project Investment - Sum of investment values (not multiplied)
- ✅ Net Rentable Capacity - Sum with correct field name
- ✅ Average PUE - From PUE Rating field

### IT Load Timeline Chart

- ✅ Data from `IT_Load_Capacity_(MW)_YYYY` fields (2016-2030)
- ✅ Sorted chronologically
- ✅ Filters out zero values

### Projects Table

- ✅ Displays all assets with correct field mappings
- ✅ Clickable project names linking to datacenter detail pages
- ✅ Shows status, location, capacity, investment, and year

## Field Name Changes Reference

### Company-Level Fields

- `companyInfo.Generic_Email` (was in assets as "Company Email")
- `companyInfo.Website` (was in assets as "Company Website")
- `companyInfo.Company_Type` (was in assets as "Company Type")
- `companyInfo.Parent_Company` (was in assets as "Parent Company")
- `companyInfo.HQ_City[]` (was in assets as city)
- `companyInfo.HQ_Country[]` (was in assets as country)
- `companyInfo.HQ_Region[]` (was in assets as region)

### Asset-Level Fields

- `"Data Center Facility Name"` (new)
- `"PUE Rating"` (was "Power Usage Effectiveness")
- `"Data Center Status"` (was status)
- `"Year of Commission"` (alternative to "Commissioned (Year)")
- `"Project Investment Value (USD)"` (was "Project Investment (USD M)" \* 1M)
- `"Net Rentable Capacity (Sq. Ft.)"` (was "Net Rentable Capacity (SqFt)")
- `"IT_Load_Capacity_(MW)_YYYY"` (new yearly breakdown)

## Files Modified

1. ✅ `/src/components/companies/types.ts` - Updated interfaces
2. ✅ `/src/components/companies/CompanyDetails.tsx` - Updated field mappings

## Testing Checklist

- [x] Company Overview displays correctly
- [x] HQ information shows array values properly
- [x] Email and website links work
- [x] Key statistics calculate correctly
- [x] IT Load chart displays yearly data
- [x] Projects table shows all assets
- [x] Investment values display without extra zeros
- [x] No TypeScript compilation errors
- [x] Handles missing/optional fields gracefully with "-"

## Result

✅ Company Details page now correctly displays all data from the new API response structure!
