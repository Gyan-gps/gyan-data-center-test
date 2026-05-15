import type { TNewsFilterState } from "@/hooks/useSessionFilters";
import type { NewsStreamItem } from "../signals/signals.types";

// Re-export NewsStreamItem as NewsArticle for backward compatibility
export type NewsArticle = NewsStreamItem;

export interface NewsResponse {
  articles: NewsArticle[];
  totalCount: number;
  page: number;
  count: number;
  hasMore: boolean;
}

// New NewsStream structure to match signals API
export interface NewsStreamResponse {
  articles: NewsStreamItem[];

  page: number;
  count: number;
  hasMore: boolean;
  totalCount: number;
}

export type NewsFilters = TNewsFilterState;

// News Filter Categories - New hierarchical structure
export interface NewsFilterCategory {
  name: string;
  children?: NewsFilterSubCategory[];
  tags?: string[];
}

export interface NewsFilterSubCategory {
  name: string;
  tags: string[];
}

export interface NewsFilterTaxonomy {
  taxonomy_name: string;
  taxonomy_version: string;
  updated_ist: string;
  categories: NewsFilterCategory[];
}

export interface NewsFilterResponse {
  categories: NewsFilterTaxonomy;
}
