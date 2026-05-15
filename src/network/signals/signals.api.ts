/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/services";
import type {
  GetNewsRequest,
  GetNewsResponse,
  NewsSignalDashboardResponse,
  UpdateFavoriteRequest,
  UpdateFavoriteResponse,
} from "./signals.types";
import type { TSignalsFilterState } from "@/hooks/useSessionFilters";

// Fetch News Articles
export const fetchNewsArticles = async (
  filters?: GetNewsRequest
): Promise<GetNewsResponse> => {
  const requestBody: TSignalsFilterState = {
    page: filters?.page || 1,
    count: filters?.count || 20,
    searchQuery: filters?.searchQuery || undefined,
    region: filters?.region || undefined,
    impact: filters?.impact || undefined,
    categories: filters?.categories || undefined,
    subCategories: filters?.subCategories || undefined,
    startDate: filters?.startDate || undefined,
    endDate: filters?.endDate || undefined,
    sortBy: filters?.sortBy || undefined,
    sortOrder: filters?.sortOrder || undefined,
  };

  const response = await apiClient.post(`/news`, requestBody);
  return response.data;
};

// Fetch Dashboard
export const fetchNewsSignalDashboard =
  async (): Promise<NewsSignalDashboardResponse> => {
    const response = await apiClient.get(
      `/news/news-signal-dashboard`
    );
    return response.data;
  };

// Update Favorite Action
export const updateNewsFavorite = async (
  payload: UpdateFavoriteRequest
): Promise<UpdateFavoriteResponse> => {
  const response = await apiClient.put<UpdateFavoriteResponse>(
    `/news/news-favorite`,
    payload
  );
  return response.data;
};
