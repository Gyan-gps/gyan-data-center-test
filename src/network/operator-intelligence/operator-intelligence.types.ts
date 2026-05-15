export interface OperatorFilters {
 companyName?: string;
 companyId: string;
 page?: number;
 limit?: number;
 search?: string;
}
export interface OperatorSearchFilters {
  companyName: string;
}

export interface OperatorIntelligenceKpiRequest {
 companyName: string;
 companyId: string;
}

export interface CompanySearchItem {
  id: string;

  companyName: string;
}

export interface CompanySearchResponse {
  data: CompanySearchItem[];
}
export interface KpiCardMetric {
  label: string;
  value: number;
  unit: string;
  changeLabel: string;
  changeValue: number;
  changeUnit: string;
}

export interface GetKpiCardsResponse {
  companyId: string | null;
  companyName: string | null;
  updatedQuarter: string;

  cards: {
    currentITLoad: KpiCardMetric;

    forecast2033: KpiCardMetric;

    countriesPresence: KpiCardMetric;

    dataCenters: KpiCardMetric;

    averagePUE: KpiCardMetric;
    averageRackDensity :KpiCardMetric;
  };
}

export interface TimelineDataPoint {
  period: string;
  capacity: number;
}

export interface YearlyTimelineResponse {
  companyId: string | null;
  companyName: string | null;

  timeline: {
    title: string;
    subtitle: string;
    data: TimelineDataPoint[];
  };
}

export interface CompanyCountryTableRow {
  region: string;
  country: string;

  dcCount: number;

  currentITLoad: number;

  futureITLoad: number;

  marketShare: number;

  avgPUE: number;

  avgRackDensity: number;

  pipelineStatus: "Low" | "Moderate" | "Strong";
}

export interface CompanyCountryDetailsResponse {
  companyId: string | null;

  companyName: string | null;

  table: {
    title: string;

    subtitle: string;

    data: CompanyCountryTableRow[];
  };
}

export interface StatusDistributionItem {
  name: string;
  value: number;
}

export interface CompanyStatusDistributionResponse {
  companyId: string | null;

  companyName: string | null;

  donutChart: {
    title: string;

    subtitle: string;

    totalITLoad: number;

    unit: string;

    data: StatusDistributionItem[];
  };
}

export interface YearlyCapacityItem {
  year: number;

  capacity_mw?: number;

  q1_mw?: number;

  q2_mw?: number;

  q3_mw?: number;

  q4_mw?: number;
}

export interface CompanyDataCenterItem {
  // BASIC INFO
  id: string | null;
  data_center_facility_name: string | null;
  data_center_status: string | null;

  data_center_type: string | null;

  data_center_tier_level: string | null;

  country: string | null;

  region: string | null;

    // CAPACITY
  current_it_load_capacity: number | null;
  expected_it_load_capacity_mw: number | null;
    // PUE / RACKS
  pue_rating: number | string | null;

  dc_rack_density_kw: number | string | null;
    year_of_commission: number | null;
}

export interface CompanyDataCentersResponse {
  companyId: string | null;

  companyName: string | null;

  pagination: {
    total: number;

    page: number;

    limit: number;

    totalPages: number;

    hasNextPage: boolean;

    hasPreviousPage: boolean;
  };

  data: CompanyDataCenterItem[];
}

export interface MarketShareOptionsResponse {
  regions: string[];

  globals: string[];
}

export interface operatorMarketShareQuery {
  companyId: string;

  type?: "region" | "global";

  value?: string;
}


export interface MarketShareSegment {
  name: string;

  value: number;
}

export interface SingleMarketShareChart {
  title: string;

  subtitle: string;

  data: MarketShareSegment[];
}

export interface MarketShareResponse {
  currentMarketShare: SingleMarketShareChart;

  forecast2033MarketShare: SingleMarketShareChart;
}

export interface HeroSectionResponse {
  success: boolean;

  data: {
    company_logo: string;
    company_name: string;
    one_liner: string;
    brief: string;
    email: string;
    website: string;
    tags: string[];
  };
}