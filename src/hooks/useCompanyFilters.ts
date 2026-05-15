import { useQuery } from "@tanstack/react-query";
import { getCompanyFilterOptions } from "@/network";

/**
 * Hook for fetching and caching company filter options
 */
export const useCompanyFilters = () => {
  return useQuery({
    queryKey: ["company-filter-options"],
    queryFn: async () => {
      const response = await getCompanyFilterOptions();

      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
