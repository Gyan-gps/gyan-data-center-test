import type { NewsStreamItem } from "@/network/signals/signals.types";
import { create } from "zustand";

interface NewsItem {
  [key: string]: NewsStreamItem;
}

interface AdminNewsStore {
  // Filters
  currentPage: number;
  pageLimit: number;
  searchQuery: string;
  debouncedSearch: string;

  startDate: string;
  endDate: string;
  appliedStartDate: string;
  appliedEndDate: string;

  activeTab: 'news' | 'analytics';

  // Data
  news: NewsItem[];
  total: number;

  // State
  isLoading: boolean;
  isFetching: boolean;

  setState: (partial: Partial<AdminNewsStore>) => void;
  reset: () => void;
}

export const useAdminNewsStore = create<AdminNewsStore>((set) => ({
  // ---------- Filters ----------
  currentPage: 1,
  pageLimit: 50,
  searchQuery: '',
  debouncedSearch: '',
  startDate: '',
  endDate: '',
  appliedStartDate: '',
  appliedEndDate: '',
  activeTab: 'news',

  // ---------- Data ----------
  news: [],
  total: 0,

  // ---------- Status ----------
  isLoading: false,      
  isFetching: false,


  setState: (partial) => set(partial),

  reset: () =>
    set({
      currentPage: 1,
      pageLimit: 50,
      searchQuery: '',
      debouncedSearch: '',
      startDate: '',
      endDate: '',
      appliedStartDate: '',
      appliedEndDate: '',
      activeTab: 'news',
      news: [],
      total: 0,
      isLoading: false,
      isFetching: false,
    }),
}));
