import { apiClient, publicApiClient } from "@/services";
import type {
  OperatorFilters,
  OperatorIntelligenceKpiRequest,
  GetKpiCardsResponse,
  YearlyTimelineResponse,
  CompanyCountryDetailsResponse,
  CompanyStatusDistributionResponse,
  CompanyDataCenterItem,
  CompanyDataCentersResponse,
  OperatorSearchFilters,
  CompanySearchResponse,
  MarketShareOptionsResponse,
  operatorMarketShareQuery,
  MarketShareResponse
} from "./operator-intelligence.types";


export const getOperatorIntelligenceKpi = async (
  payload: OperatorIntelligenceKpiRequest,
): Promise<GetKpiCardsResponse> => {
  const response = await publicApiClient.post<GetKpiCardsResponse>(
    "/operator-intelligence/kpicards",
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

export const getYearlyTimeline = async (
  payload: OperatorIntelligenceKpiRequest,
): Promise<YearlyTimelineResponse> => {
  const response = await publicApiClient.post<YearlyTimelineResponse>(
    "/operator-intelligence/yearly-timeline",
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

export const getCompanyCountryDetails = async (
  payload: OperatorIntelligenceKpiRequest,
): Promise<CompanyCountryDetailsResponse> => {
  const response = await publicApiClient.post<CompanyCountryDetailsResponse>(
    "/operator-intelligence/company-country-details",
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

export const getCompanyStatusDistribution = async (
  payload: OperatorFilters,
): Promise<CompanyStatusDistributionResponse> => {
  const response = await publicApiClient.post<CompanyStatusDistributionResponse>(
    "/operator-intelligence/company-status-distribution",
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

export const getCompanyDataCenters = async (
  payload: OperatorFilters,
): Promise<CompanyDataCentersResponse> => {
  const response = await publicApiClient.post<CompanyDataCentersResponse>(
    "/operator-intelligence/company-data-centers",
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

export const getCompanySearchResults =
  async (
    payload: OperatorSearchFilters
  ): Promise<CompanySearchResponse> => {
    const response =
      await publicApiClient.post<CompanySearchResponse>(
        "/operator-intelligence/company-search",
        payload,
        {
          timeout: 60000,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };


  export const getMarketShareOptions =
  async (
    payload: OperatorFilters
  ): Promise<MarketShareOptionsResponse> => {
    const response =
      await publicApiClient.post<MarketShareOptionsResponse>(
        "/operator-intelligence/market-share-options",
        payload,
        {
          timeout: 60000,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };

    export const getMarketShare =
  async (
    payload: operatorMarketShareQuery
  ): Promise<MarketShareResponse> => {
    const response =
      await publicApiClient.post<MarketShareResponse>(
        "/operator-intelligence/market-share",
        payload,
        {
          timeout: 60000,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };

  export const getHeroSection = async (
  payload: OperatorIntelligenceKpiRequest
) => {
  const response =
    await publicApiClient.post(
      "/operator-intelligence/hero-section",
      payload
    );

  return response.data;
};

export const getTopCompanies =
  async () => {

    const response =
      await publicApiClient.get(
        "/operator-intelligence/top-companies"
      );

    return response.data;
  };


  
