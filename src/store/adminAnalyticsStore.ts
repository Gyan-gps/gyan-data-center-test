import { create } from "zustand";

export type ViewBy = "llm_category" | "region" | "impact";

const now = new Date();

interface AdminAnalyticsStore {
  // Date filter UI
  startDate: string;
  endDate: string;

  // Applied date filter
  appliedStartDate: string;
  appliedEndDate: string;

  // View mode
  viewBy: ViewBy;

  // Timeline
  selectedYear: number;
  selectedMonth: number;

  setState: (partial: Partial<AdminAnalyticsStore>) => void;
  clearDates: () => void;
}

export const useAdminAnalyticsStore = create<AdminAnalyticsStore>((set) => ({
  startDate: "",
  endDate: "",
  appliedStartDate: "",
  appliedEndDate: "",

  viewBy: "llm_category",

  selectedYear: now.getFullYear(),
  selectedMonth: now.getMonth() + 1,

  setState: (partial) => set(partial),

  clearDates: () =>
    set({
      startDate: "",
      endDate: "",
      appliedStartDate: "",
      appliedEndDate: "",
    }),
}));
