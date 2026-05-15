/**
 * Extended Company Types for UI Components
 * Extends the base Company interface with additional fields that may be present
 */

import type { TCompanyFilterState } from "@/hooks/useSessionFilters";
import type { Company as BaseCompany } from "@/network";

// Extended Company interface with optional additional fields
export interface ExtendedCompany extends BaseCompany {
  type?: "operator" | "tenant" | "provider";
  website?: string;
  headquarters?: string;
  yearFounded?: number;
  revenue?: string;
  description?: string;
  createdTime?: string;
  country?: string[];
}

// Company filter state for the UI - matches the backend CompanyFilters interface
export type CompanyFilterState = TCompanyFilterState;

// Filter options available in the UI - matches the API response
export interface CompanyFilterOptions {
  companies: string[];
  companyTypes: string[];
  hqCountries: string[];
  hqRegions: string[];
  hqCities: string[];
}

// Company Details API Response Types
export interface CompanyDetailsResponse {
  success: boolean;
  data: CompanyDetailsData;
}

export interface CompanyDetailsData {
  companyInfo: CompanyInfo;
  assets: CompanyAsset[];
  contacts: CompanyContact[];
  TotalItLoad: TotalItLoad;
  reports: CompanyReport[];
  news: CompanyNews[];
}

export interface CompanyInfo {
  id: string;
  company: string;
  website?: string;
  generic_email?: string;
  dc_ids: string[];
  HQ_Country?: string;
  HQ_Region?: string;
  HQ_City?: string;
  created_by: UserInfo;
  created_time: string;
  modified_by: UserInfo;
  last_modified_date: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
}

export interface CompanyAsset {
  _id: string;
  id: string;
  
  // Basic Information (snake_case from API)
  dc_id: string;
  data_center_facility_name: string;
  data_center_status: string;
  data_center_type: string;
  data_center_tier_level: string;
  year_of_commission: number;
  
  // Capacity and Technical Details
  current_it_load_capacity: number;
  expected_it_load_capacity_mw: number;
  net_rentable_capacity_sq_ft: number;
  pue_rating: number;
  project_investment_value_usd: number;
  
  // Location Details
  city: string;
  country: string[];
  region: string[];
  
  // IT Load Capacity by Year (array format)
  it_load_capacity_by_year: Array<{
    year: number;
    capacity_mw: number;
  }>;
}

export interface CompanyContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  company: string[];
  linkedDataCenters: string[];
  linkedin: string;
  city: string[];
  country: string[];
  region: string[];
  notes: string;
  Contact_Person: string;
  Contact_Person_Email: string;
  Contact_Person_Designation: string;
  Created_By: UserInfo;
  Created_Date: string;
  Contact_Person_Phone: string;
  Contact_Person_City: string[];
  Contact_Person_LinkedIn_ID: string;
  Country_Name: string[];
  Modified_By: UserInfo;
  Last_Modified_Date: string;
}

export interface TotalItLoad {
  IT_Load_2016: number;
  IT_Load_2017: number;
  IT_Load_2018: number;
  IT_Load_2019: number;
  IT_Load_2020: number;
  IT_Load_2021: number;
  IT_Load_2022: number;
  IT_Load_2023: number;
  IT_Load_2024: number;
  IT_Load_2025: number;
  IT_Load_2026: number;
  IT_Load_2027: number;
  IT_Load_2028: number;
  IT_Load_2029: number;
  IT_Load_2030: number;
}

export interface CompanyReport {
  _id: string;
  id: number;
  title: string;
  published_year: string;
  slug: string;
  countries_covered: string;
  regions_covered: string;
  major_players: Array<{
    heading: string;
    type: string;
    value: Array<{
      url: string;
      alt_text: string;
    }>;
  }>;
}

export interface CompanyNews {
  _id: string;
  annotations: {
    titles: string[];
    raw: null;
  };
  author: string | null;
  body: string;
  categories: string[];
  entities: string[];
  fetchedAt: string;
  lang: string;
  lastAnnotatedAt: string;
  publishedDate: string;
  source: {
    uri: string;
    title: string;
    dataType: string;
  }
  raw: {
    uri: string;
    lang: string;
    isDuplicate: boolean;
    date: string;
    time: string;
    dateTime: string;
    dateTimePub: string;
    dataType: string;
    sim: number;
    url: string;
    title: string;
    body: string;
    source: {
      uri: string;
      dataType: string;
      title: string;
      description: string;
      location: {
        type: string;
        label: {
          eng: string;
        };
      };
      locationValidated: boolean;
      ranking: {
        importanceRank: number;
        alexaGlobalRank: number;
        alexaCountryRank: number;
      };
    };
    authors: string[];
    image: string;
    eventUri: string | null;
    shares: Record<string, unknown>;
    sentiment: number;
    wgt: number;
    relevance: number;
  };
  sourceTitle: string;
  sourceUri: string;
  tags: string[];
  title: string;
  url: string;
  matchScore: number;
  matchedText: string;
}
