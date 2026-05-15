/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/services";
import type {
  NewsResponse,
  NewsFilters,
  NewsFilterResponse,
  NewsStreamResponse,
} from "./news.types";

export const getDataCenterNews = async (
  filters?: NewsFilters
): Promise<NewsResponse> => {
  // Create request body matching backend API
  const requestBody: any = {
    page: filters?.page || 1,
    count: filters?.count || 20,
    sortBy: filters?.sortBy || "publishedDate",
    sortOrder: filters?.sortOrder || "desc",
  };

  // Add optional filters
  if (filters?.searchQuery && filters.searchQuery.trim() !== "") {
    requestBody.searchQuery = filters.searchQuery.trim();
  }

  if (filters?.startDate) {
    requestBody.startDate = filters.startDate;
  }

  if (filters?.endDate) {
    requestBody.endDate = filters.endDate;
  }

  if (filters?.categories && filters.categories.length > 0) {
    requestBody.categories = filters.categories;
  }

  if (filters?.subCategories && filters.subCategories.length > 0) {
    requestBody.subCategories = filters.subCategories;
  }

  const response = await apiClient.post<NewsResponse>(`/news`, requestBody);
  return response.data;
};

// New function to get news stream in the new format
export const getNewsStream = async (
  filters?: NewsFilters
): Promise<NewsStreamResponse> => {
  const requestBody: any = {
    page: filters?.page || 1,
    count: filters?.count || 20,
    sortBy: filters?.sortBy || "publishedDate",
    sortOrder: filters?.sortOrder || "desc",
  };

  // Add optional filters
  if (filters?.searchQuery && filters.searchQuery.trim() !== "") {
    requestBody.searchQuery = filters.searchQuery.trim();
  }

  if (filters?.startDate) {
    requestBody.startDate = filters.startDate;
  }

  if (filters?.endDate) {
    requestBody.endDate = filters.endDate;
  }

  if (filters?.categories && filters.categories.length > 0) {
    requestBody.categories = filters.categories;
  }

  if (filters?.subCategories && filters.subCategories.length > 0) {
    requestBody.subCategories = filters.subCategories;
  }

  const response = await apiClient.post<NewsStreamResponse>(
    `/news`,
    requestBody
  );
  return response.data;
};

export const getNewsFilterCategories =
  async (): Promise<NewsFilterResponse> => {
    const response = await apiClient.get<NewsFilterResponse>(`/news/filters`);
    return response.data;
  };
