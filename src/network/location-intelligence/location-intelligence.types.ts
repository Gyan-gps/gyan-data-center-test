export interface LocationFilters {
  regions?: string[];
  countries?: string[];
  cities?: string[];
  base_year?: number;
  base_quarter?: number;
}

export interface LocationIntelligenceSummaryRequest {
  region?: string;
  country?: string;
  cities?: string[];
  base_year?: number;
  base_quarter?: number;
}

export type SummaryConfidence = "Low" | "Medium" | "High";

export type SummaryPipeline = "Weak" | "Medium" | "Strong";

export type SummaryCardIcon = "available" | "absorbed" | "forecast" | "power";

export interface SummaryCard {
  label: string;
  value: number;
  unit: string;
  changeLabel: string;
  changeValue: number;
  changeUnit: string;
  icon: SummaryCardIcon;
  sparkline: number[];
  showQoQ?: boolean;
}

export interface LocationIntelligenceSummary {
  title: string;
  subtitle: string;
  flag: string;
  updatedQuarter: string;
  confidence: SummaryConfidence;
  pipeline: SummaryPipeline;
  scope: "country" | "region" | "cities";
  scopeValue: string;
  cards: {
    available: SummaryCard;
    absorbed: SummaryCard;
    forecast: SummaryCard;
    powerConsumption: SummaryCard;
  };
}

export interface RankingItem {
  name: string;
  value: number;
}

export interface RankingChart {
  title: string;
  subtitle: string;
  items: RankingItem[];
}

export interface RankingOverview {
  scope: "country" | "region" | "cities";
  scopeValue: string;
  topLocations: RankingChart;
  topCompetition: RankingChart;
  topHyperscale: RankingChart;
  topOpportunities: RankingChart;
}

export interface CapacityYearPoint {
  year: number;
  capacity: number;
  absorption: number;
}

export interface NRCYearPoint {
  year: number;
  nrc: number;
}

export interface CapacityOverview {
  scope: "country" | "region" | "cities";
  scopeValue: string;
  capacityVsAbsorption: {
    title: string;
    subtitle: string;
    data: CapacityYearPoint[];
  };
  yoyNRC: {
    title: string;
    subtitle: string;
    data: NRCYearPoint[];
  };
}

export interface CityCapacityRow {
  rank: number;
  name: string;
  itLoadMW: number;
  nrcSqFt: number;
  sites: number;
  growthPct: number;
}

export interface MixSegment {
  label: string;
  value: number;
}

export interface CityWiseCapacities {
  scope: "country" | "region" | "cities";
  scopeValue: string;
  mainTitle: string;
  table: {
    title: string;
    subtitle: string;
    rows: CityCapacityRow[];
  };
  statusMix: {
    title: string;
    subtitle: string;
    segments: MixSegment[];
  };
  typeMix: {
    title: string;
    subtitle: string;
    segments: MixSegment[];
  };
}

export interface OperatorRow {
  rank: number;
  name: string;
  itLoadMW: number;
  marketSharePct: number;
  facilities: number;
  cities: number;
  tier: string;
  status: "Active" | "Pipeline";
}

export interface CompetitionOverview {
  scope: "country" | "region" | "cities";
  scopeValue: string;
  table: {
    title: string;
    subtitle: string;
    rows: OperatorRow[];
  };
  marketShareDonut: {
    title: string;
    subtitle: string;
    segments: MixSegment[];
  };
  forecastDonut: {
    title: string;
    subtitle: string;
    segments: MixSegment[];
  };
}

export interface KpiItem {
  label: string;
  value: number;
  unit: string;
  badge: string;
  spark: string;
}

export interface LocationKpiResponse {
  kpis: KpiItem[];
}

export interface SupplyYearPoint {
  year: number;
  hyperscale?: number;
  large?: number;
  medium?: number;
  small?: number;
  tier1?: number;
  tier2?: number;
  tier3?: number;
  tier4?: number;
}

export interface SupplyOverview {
  scope: "country" | "region" | "cities";
  scopeValue: string;

  supplyBySize: {
    title: string;
    subtitle: string;
    data: SupplyYearPoint[];
  };

  supplyByTier: {
    title: string;
    subtitle: string;
    data: SupplyYearPoint[];
  };
}
export interface DataCenterListItem {
  id: string;
  dc_id : string;
  name: string;
  city: string;
  country: string;
  operator: string[];
  status: string;
  tier: string;
  size: string;
  itLoadMW: number;
  pue: number;
  expectITLoadMW?: number;
}

export interface DataCenterListResponse {
  scope: "country" | "region" | "cities";
  scopeValue: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: DataCenterListItem[];
}
export interface DataCenterListRequest {
  region?: string;
  country?: string;
  cities?: string[];
  page?: number;

  status?: "Announced" | "Cancelled" | "Commissioned" | "Under Construction";
  scale?: "Hyperscale" | "Large" | "Medium" | "Small";
  size?: "Hyperscale" | "Large" | "Medium" | "Small";
}