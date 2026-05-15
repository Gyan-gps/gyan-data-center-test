import { apiClient, publicApiClient } from "@/services";
import type {
  CapacityOverview,
  CityWiseCapacities,
  CompetitionOverview,
  LocationFilters,
  RankingOverview,
  LocationIntelligenceSummary,
  LocationIntelligenceSummaryRequest,
  LocationKpiResponse,
  SupplyOverview,
  DataCenterListResponse,
  DataCenterListRequest
} from "./location-intelligence.types";

export const getLocationKpis = async (
  filters?: LocationFilters,
): Promise<LocationKpiResponse> => {
  const response = await apiClient.post<LocationKpiResponse>(
    "/location-intelligence/kpis",
    filters,
    { timeout: 60000 },
  );

  return response.data;
};

export const getLocationIntelligenceSummary = async (
  payload: LocationIntelligenceSummaryRequest,
): Promise<LocationIntelligenceSummary> => {
  const response = await publicApiClient.post<LocationIntelligenceSummary>(
    "/location-intelligence/summary",
    payload,
    {
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const getLocationIntelligenceRanking = async (
  payload: LocationIntelligenceSummaryRequest,
): Promise<RankingOverview> => {
  const response = await publicApiClient.post<RankingOverview>(
    "/location-intelligence/ranking",
    payload,
    {
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const getLocationIntelligenceCapacity = async (
  payload: LocationIntelligenceSummaryRequest,
): Promise<CapacityOverview> => {
  const response = await publicApiClient.post<CapacityOverview>(
    "/location-intelligence/capacity",
    payload,
    {
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const getLocationIntelligenceCityWise = async (
  payload: LocationIntelligenceSummaryRequest,
): Promise<CityWiseCapacities> => {
  const response = await publicApiClient.post<CityWiseCapacities>(
    "/location-intelligence/city-wise",
    payload,
    {
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const getLocationIntelligenceCompetition = async (
  payload: LocationIntelligenceSummaryRequest,
): Promise<CompetitionOverview> => {
  const response = await publicApiClient.post<CompetitionOverview>(
    "/location-intelligence/competition",
    payload,
    {
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const getLocationIntelligenceSupply = async (
  payload: LocationIntelligenceSummaryRequest,
): Promise<SupplyOverview> => {
  const response = await publicApiClient.post<SupplyOverview>(
    "/location-intelligence/supply",
    payload,
    {
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const getLocationIntelligenceDataCenters = async (
  payload: DataCenterListRequest,
): Promise<DataCenterListResponse> => {
  const response = await publicApiClient.post<DataCenterListResponse>(
    "/location-intelligence/dc-list",
    payload,
    {
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};
