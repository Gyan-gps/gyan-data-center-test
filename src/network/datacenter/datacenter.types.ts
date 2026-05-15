/**
 * Data Center API Types
 * Contains all types related to data center API calls
 * Based on the API documentation
 */
import {
  type TFilterState,
  type TReportFilterState,
} from "@/hooks/useSessionFilters";

// News Article (from API)
export interface NewsArticle {
  sentiment: number;
  _id: string;
  uri: string;
  lang: string;
  image?: string;
  isDuplicate: boolean;
  title: string;
  body: string;
  url: string;
  source: {
    location: string;
    name: string;
    uri: string;
    dataType: string;
    title: string;
  };
  eventUri: string;
  publishedDate: string;
  __v: number;
}

// Base API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ApiResponseDataCenterDetails<T = unknown> {
  asset: T;
  news?: NewsArticle[]; // News articles related to the data center
}

export interface ApiResponseForDataCenter<T = unknown> {
  assets: T[];
  hasMore: boolean;
  nextOffset: string | null; // Cursor-based pagination with string offset
  // Page-based pagination properties (if supported by endpoint)
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ItLoadPaginatedResponse<T> {
  itLoadData: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// interface DataCenterOperator{
//   _id : string,
//   id: string,
//   company : string,

// }
//quaterly IT Load Capacity
export interface YearlyITLoadCapacity {
  year: number;
  capacity_mw: number | null;
  q1_mw?: number | null;
  q2_mw?: number | null;
  q3_mw?: number | null;
  q4_mw?: number | null;
}
// Data Center Asset (from API documentation)
export interface DataCenterTableRows {
  year_of_commission: number;
  data_center_facility_name: string;
  data_center_type: string;
  current_it_load_capacity: number | null;
  data_center_operator: Array<{
    id: string;
    company: string;
  }>;
  data_center_tier_level: string;
  city: Array<{
    city: string;
  }>;
  country: string[];
  data_center_status: string;
  id: string;
  dc_id: string;
  region: string[];
  net_rentable_capacity_sq_ft: number;
  it_load_capacity_by_year: YearlyITLoadCapacity[];
  "IT_Load_Capacity_(MW)_2016": number;
  "IT_Load_Capacity_(MW)_2017": number;
  "IT_Load_Capacity_(MW)_2018": number;
  "IT_Load_Capacity_(MW)_2019": number;
  "IT_Load_Capacity_(MW)_2020": number;
  "IT_Load_Capacity_(MW)_2021": number;
  "IT_Load_Capacity_(MW)_2022": number;
  "IT_Load_Capacity_(MW)_2023": number;
  "IT_Load_Capacity_(MW)_2024": number;
  "IT_Load_Capacity_(MW)_2025": number;
  "IT_Load_Capacity_(MW)_2026": number;
  "IT_Load_Capacity_(MW)_2027": number;
  "IT_Load_Capacity_(MW)_2028": number;
  "IT_Load_Capacity_(MW)_2029": number;
  "IT_Load_Capacity_(MW)_2030": number;
  expected_it_load_capacity_mw: number | null;
  // "Data Center Operator ID": string;
}
export interface DataCenterMap {
  id: string;
  dc_id: string;

  data_center_facility_name: string;
  data_center_operator: string | Array<{ company: string }>;
  city: string | Array<{ city: string }>;
  country: string | Array<string>;
  data_center_status: string;
  current_it_load_capacity: number;
  data_center_tier_level: string;
  data_center_type: string;
  year_of_commission: number;
}

export interface DataCenterAsset {
  id: string;
  dc_id: string;

  it_load_capacity_by_year: { year: number; capacity_mw: number }[];

  // Basic Data Center Information (snake_case from API)
  data_center_facility_name: string;
  data_center_status: string;
  data_center_type: string;
  data_center_tier_level: string;
  data_center_size: string;
  year_of_commission: number;

  // Capacity and Technical Details
  current_it_load_capacity: number;
  expected_it_load_capacity_mw: number;
  net_rentable_capacity_sq_ft: number;
  number_of_racks: number;
  dc_rack_density_kw: number;
  pue_rating: number;
  project_investment_value_usd: number;

  // Power and Redundancy
  redundancy_levels_power: string;
  redundancy_levels_cooling: string;
  power_backup_type: string;

  // Certifications and Address
  cybersecurity_certification: string;
  dc_operator_facility_address: string;

  // Parent Company
  parent_comp: (string | null)[];
  dc_operator_website?: string;
  dc_operator_email_id?: string;

  // Operator Details
  operator_details: string[];
  data_center_operator: Array<{
    id: string;
    company: string;
  }>;

  // Location Details
  city: Array<{
    id: string;
    city: string;
  }>;
  country: string[];
  region: string[];
  latitude: number;
  longitude: number;

  // Timestamps
  created_time?: string;
  modified_time?: string;

  // News articles (merged from API response)
  news?: NewsArticle[];
}

// IT Load Data (from API documentation)
export interface ITLoadData {
  id: string;
  "Operator / Owner": string;
  "Data Center": string;
  City: string;

  "Total / Planned IT Load (MW)": number;
  "IT Load 2016 (MW)": number;
  "IT Load 2017 (MW)": number;
  "IT Load 2018 (MW)": number;
  "IT Load 2019 (MW)": number;
  "IT Load 2020 (MW)": number;
  "IT Load 2021 (MW)": number;
  "IT Load 2022 (MW)": number;
  "IT Load 2023 (MW)": number;
  "IT Load 2024 (MW)": number;
  "IT Load 2025 (MW)": number;
  "IT Load 2026 (MW)": number;
  "IT Load 2027 (MW)": number;
  "IT Load 2028 (MW)": number;
  "IT Load 2029 (MW)": number;
  "IT Load 2030 (MW)": number;
  createdTime?: string;
}

// Company Data (from API documentation)
export interface Company {
  assetCount: string;
  contactCount: number;
  dcIds: string[];
  id: string;
  isActive: boolean;
  name: string;
  countryCount: number;
}

// Filter types (from API documentation)
export interface DataCenterFilters {
  // offset?: number; // Cursor-based pagination offset (string)
  pageNumber?: number;
  limit?: number;
  search?: string;
  dataCenter?: string; // Search field that maps to backend schema
  location?: string;
  operator?: string;
  certification?: string;
  region?: string;
  country?: string;
  city?: string;
  assetType?: string;
  status?: string;
  minITLoad?: number;
  maxITLoad?: number;
  yearBuilt?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  // New structured filters
  statuses?: string[]; // 1st Filter: Data_Center_Status - Multi Select
  operators?: string[]; // 3rd Filter: Data_Center_Operator - Searchable (multiselect)
  dcTypes?: string[]; // 4th Filter: Data_Center_Type - Dropdown, multiselect
  tierLevels?: string[]; // 5th Filter: DC_Tier_Level - Multiselect, dropdown
  minYear?: number; // 2nd Filter: Operation/Commissioning_Year - Range Slider (min)
  maxYear?: number; // 2nd Filter: Operation/Commissioning_Year - Range Slider (max)
  minITLoadMW?: number; // 6th Filter: Total/Planned_IT_Load_MW - Min-Max (min)
  maxITLoadMW?: number; // 6th Filter: Total/Planned_IT_Load_MW - Min-Max (max)
  regions?: string[]; // Region filter
  countries?: string[]; // Country filter
  cities?: string[]; // City filter
}

// Frontend filter state interface
export type FilterState = TFilterState;

export interface CompanyFilters {
  limit?: number;
  searchKeyword?: string;
  companies?: string[];
  companyTypes?: string[];
  hqCountries?: string[];
  hqRegions?: string[];
  hqCities?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ITLoadFilters {
  page?: number;
  limit?: number;
  regions?: string | string[];
  countries?: string | string[];
  cities?: string | string[];
  operator?: string;
  year?: number;
  forecast?: boolean;
  minYear?: number;
  maxYear?: number;
  sortBy?:
  | "operator"
  | "dataCenter"
  | "region"
  | "dataCenterMain"
  | "totalITLoad";
  sortOrder?: "asc" | "desc";
  // Additional filters for consistency with DataCenterFilters
  tierLevel?: string;
  facilityType?: string;
  statuses?: string[];
  minITLoadMW?: number;
  maxITLoadMW?: number;
  dcTypes?: string[];
}

// Filter Options Types
export interface FilterOptions {
  statuses: string[]; // Data_Center_Status - 1st Filter, Multi Select
  operators: string[]; // Data_Center_Operator - 3rd Filter, searchable
  dcTypes: string[]; // Data_Center_Type - 4th Filter, dropdown, multiselect
  tierLevels: string[]; // DC_Tier_Level - 5th Filter, Multiselect, dropdown
  yearRange: {
    min: number;
    max: number;
  }; // Operation/Commissioning_Year - Range Slider
  itLoadRange: {
    min: number;
    max: number;
  }; // Total/Planned_IT_Load_MW - 6th Filter, Min - Max
  cities: string[]; // City dropdown
  countries: string[]; // Country dropdown
  regions: string[]; // Region dropdown
}

export interface ApiCompanyResponse<T = unknown> {
  companies: T[];
  limit: number;
  nextOffset: string | null; // Cursor-based pagination offset (string)
  hasMore: boolean;
  total: number; // Count in current response
  totalPages: number;
}

// Company Filter Options
export interface CompanyFilterOptions {
  companies: string[];
  companyTypes: string[];
  hqCountries: string[];
  hqRegions: string[];
  hqCities: string[];
}

export interface CompanyFilterOptionsResponse {
  success: boolean;
  data: CompanyFilterOptions;
}

export interface FilterOptionsResponse extends FilterOptions {
  success: boolean;
}

// Response types
export type DataCenterListResponse = ApiResponseForDataCenter<DataCenterAsset>;
export type DataCenterResponse = ApiResponseDataCenterDetails<DataCenterAsset>;
export type ITLoadResponse = ItLoadPaginatedResponse<ITLoadData>;

// IT Load Summary Response (for time series graphs)
export interface ITLoadSummaryData {
  yearlyData: Array<{ year: number; totalLoad: number }>;
  totalRecords: number;
  totalCapacity: number;
}

export interface ITLoadSummaryResponse {
  success: boolean;
  data: ITLoadSummaryData;
}
export type CompanyListResponse = ApiCompanyResponse<Company>;

// Reports Types
export interface ReportMajorPlayer {
  heading: string;
  type: string;
  value: Array<{
    url: string;
    alt_text: string;
  }>;
}
export interface MarketAnalysisImage {
  url: string;
  alt_text: string;
  reseller_url: string;
  note?: string;
}

export interface MarketAnalysisTable {
  heading: string;
  data: (string | number)[][];
  note?: string;
  source?: string;
}

export interface MarketAnalysisContentItem {
  id: number;
  sub_heading: string;
  description: string;
  table?: MarketAnalysisTable;
  image?: MarketAnalysisImage;
  chart_modal?: Record<string, any>;
  cta?: string;
}

export interface MarketAnalysis {
  heading: string;
  description?: string;
  auto_generated_text?: string;
  content?: MarketAnalysisContentItem[];
  unique_key?: string;
  left_nav_heading?: string;
  order?: number;

  [key: string]: any; // allow new keys dynamically from backend
}
export interface MarketLandscapeImage {
  url: string;
  alt_text: string;
  reseller_url?: string;
  note?: string;
  market_concentration_value?: number; // only appears here
}

export interface MarketLandscapeTable {
  heading: string;
  data: (string | number)[][];
  note?: string;
  source?: string;
}

export interface MarketLandscapeContentItem {
  id: number;
  sub_heading: string;
  description: string;
  table?: MarketLandscapeTable;
  image?: MarketLandscapeImage;
  chart_modal?: Record<string, any>;
  cta?: string;
  list?: any[];
}

export interface MarketLandscape {
  heading: string;
  unique_key?: string;
  left_nav_heading?: string;
  order?: number;


  image?: MarketLandscapeImage;

  content?: MarketLandscapeContentItem[];

  isEmptySection?: boolean;

  [key: string]: any; // future-safe for backend changes
}
export interface MarketLeaderItem {
  title: string;
  image_url?: string;
  alt_text?: string;
  redirect_url?: string;
  [key: string]: any;
}

export interface MarketLeadersList {
  type: string; // e.g., "COMPANIES"
  value: MarketLeaderItem[];
}

export interface MarketLeaders {
  heading: string;
  left_nav_heading?: string;
  order?: number;
  unique_key?: string;
  list: MarketLeadersList;
  [key: string]: any;
}
export interface MarketNews {
  heading: string;
  description?: string; // HTML string
  left_nav_heading?: string;
  order?: number;
  unique_key?: string;

  [key: string]: any; // allows future backend additions
}
export interface MarketSizeImage {
  url: string;
  alt_text?: string;
  reseller_url?: string;
  note?: string;
}

export interface MarketSizeFinalDataItem {
  label: string;
  value: string | number;
}

export interface MarketSizeKeyFactor {
  heading: string;
  type: "text" | "images" | string;
  value: string | number | MarketSizeImage[] | null;
  year1?: string | number;
  year2?: string | number;
  year?: string | number;
  volume?: string | number;
  market_type?: string;
}

export interface MarketSizeData {
  heading: string;
  image?: MarketSizeImage[];
  finalData?: MarketSizeFinalDataItem[];
  key_factors?: MarketSizeKeyFactor[];
  left_nav_heading?: string;
  unique_key?: string;
  order?: number;

  [key: string]: any;
}
export interface MarketTrendImage {
  url: string;
  alt_text?: string;
  reseller_url?: string;
  note?: string;
}

export interface MarketTrendTable {
  heading: string;
  data: (string | number)[][];
  note?: string;
  source?: string;
}

export interface MarketTrendChartModal {
  graph_type?: string;
  modal_heading?: string;
  source?: string;
  metric?: string;
  labels?: boolean;
  [key: string]: any;
}

export interface MarketTrendContentItem {
  id: number;
  sub_heading: string;
  description?: string; // HTML
  table?: MarketTrendTable;
  image?: MarketTrendImage;
  cta?: string;
  chart_modal?: MarketTrendChartModal;
  [key: string]: any;
}

export interface MarketTrends {
  heading: string;
  content?: MarketTrendContentItem[];
  left_nav_heading?: string;
  unique_key?: string;
  isEmptySection?: boolean;
  order?: number;

  [key: string]: any;
}
export interface SnippetSectionItem {
  order: number;
  heading: string;
  unique_key?: string;
  left_nav_heading?: string;
  isEmptySection?: boolean;

  // Possible fields inherited from different section types
  image?: MarketSizeImage[] | MarketTrendImage[] | MarketLandscapeImage[];
  finalData?: MarketSizeFinalDataItem[];
  key_factors?: MarketSizeKeyFactor[];

  description?: string;
  auto_generated_text?: string;
  content?: MarketTrendContentItem[] | MarketAnalysisContentItem[];

  [key: string]: any; // allow dynamic keys (e.g., scope section)
}
export type NewDescription = SnippetSectionItem[];

export interface ReportExtendedData {
  leftNavData: [
    {
      title: string;
      link: string;
      children?: [
        {
          title: string;
          link: string;
        }
      ];
    }
  ];
  TOCData: {
    heading: string;
    tableData: Array<{
      text: string;
      parent: string | null;
      tags: string[];
      list: any[];
      location: string;
    }>;
    content?: {
      table: any | null;
      data: any | null;
      new_toc_disclaimer: (boolean | string | null)[];
    };
  };
  left_navigation_tabs: Record<string, number>;
  market_analysis?: MarketAnalysis;
  market_landscape?: MarketLandscape;
  market_leaders?: MarketLeaders;
  market_news?: MarketNews;
  market_size?: MarketSizeData;
  market_trends?: MarketTrends;

  new_description?: NewDescription;
}

export interface Report {
  _id: string;
  id: number;
  title: string;
  published_year: string;
  countries_covered: string;
  regions_covered: string;
  major_players: ReportMajorPlayer[];
  sample_info: {
    sample_url?: string;
  };
  hub_id?: number;
  slug: string;
  subscriptionStatus?: string; // Added for user's subscription status
  custom ?: {
    report_pdfs?: Array<{
      url: string;
      alt_text: string;
      fileName?: string;
      file_name?: string;
      type?: string; // e.g., "pdf"
      
    }>;
    report_excel?: Array<{
      url: string;
      alt_text: string;
      fileName?: string;
      file_name?: string;
      type?: string; // e.g., "excel"
    }>;
  };
  ppt_url?: Array<{
    url: string;
    alt_text: string;
    fileName?: string;
    file_name?: string;
    type?: string; // e.g., "ppt"
  }>;
  report_expiry?:string;
  subscribed?:string;
  subscription_on?: string;
  uploadId?: string;
}

export type ReportFilters = TReportFilterState;

export interface ReportsFilterOptions {
  regions: string[];
  countries: string[];
  publishedYears: number[];
}

export interface ReportsResponse {
  success: boolean;
  data: {
    reports: Report[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReportDownloadResponse {
  download_url: string;
  success: boolean;
  data: {
    report_id: string;
    hub_id: number;
    download_url: string;
    expires_in: string;
  };
}

// Analytics Types
export interface AnalyticsFilters {
  yearRange?: {
    start?: number;
    end?: number;
  };
  regions?: string[];
  cities?: string[];
  countries?: string[];
  operators?: string[];
  status?: string[];
  tiers?: string[];
  dcTypes?: string[];
}

export interface AnalyticsSummary {
  totalDataCenters: number;
  totalCapacity: number;
  countriesCovered: number;
  operationalRate: number;
}

export interface DistributionItem {
  status?: string;
  totalITLoad?: number;
  region?: string;
  tier?: string;
  operator?: string;
  count: number;
  percentage?: number;
  marketShare?: number;
  assetCount?: number;
  [key: string]: unknown;
}

export interface TimelineItem {
  year: number;
  count: number;
  [key: string]: unknown;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  statusDistribution: DistributionItem[];
  regionalDistribution: DistributionItem[];
  tierDistribution: DistributionItem[];
  commissioningTimeline: TimelineItem[];
  topOperators: DistributionItem[];
}

export interface AnalyticsFilterOptions {
  regions: string[];
  operators: string[];
  status: string[];
  tiers: string[];
  yearRange: {
    min: number;
    max: number;
  };
}

export interface CompanyAssetsContacts {
  assets: DataCenterAsset[];
  contacts: Array<{
    id: string;
    country: string[];
    region: string[];
    Contact_Person: string;
    Contact_Person_Email: string;
    Contact_Person_Designation: string;
    Contact_Person_Phone: string;
    Contact_Person_LinkedIn_ID: string;
  }>;
}

export type AnalyticsResponse = AnalyticsData;
export type AnalyticsFilterOptionsResponse = AnalyticsFilterOptions;

export type Geography = {
  city: string;
  country: string;
  region: string;
};

// ============ Analytics V2 Types ============

export interface AnalyticsV2Summary {
  itLoadBaseYear: number;
  itLoad2031: number;
  cagrHistorical: number;
  cagrForecast: number;
  countriesCovered: number;
  dcFacilitiesBaseYear: number;
  dcFacilities2031: number;
  baseYear: number;
  statusDistribution: Array<{ status: string; itLoad: number; percentage: number }>;
  quarterlyGrowthQ3Q4: { percentage: number; isPositive: boolean; absoluteValue: number };
  quarterlyGrowthQ2Q3: { percentage: number; isPositive: boolean; absoluteValue: number };
}

export interface AnalyticsV2Charts {
  statusPie: Array<{ status: string; itLoad: number; percentage: number }>;
  regionalDistribution: Array<Record<string, number | string>>;
  tierDistribution: Array<Record<string, number | string>>;
  sizeDistribution: Array<Record<string, number | string>>;
  regionalLines: string[];
  tierLines: string[];
  sizeLines: string[];
}

export interface AnalyticsV2TopOperator {
  operator: string;
  totalITLoad: number;
  marketShare: number;
  assetCount: number;
}
