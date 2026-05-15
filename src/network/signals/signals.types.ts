// Request type for fetching articles
export interface GetNewsRequest {
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  count?: number;
  sortBy?: "publishedDate" | "title" | "createdAt";
  sortOrder?: "asc" | "desc";
  categories?: string[];
  subCategories?: string[];
  region?: string;
  impact?: string;
}

// News Article
export interface NewsArticle {
  uri: string;
  url: string;
  title: string;
  body: string;
  publishedDate: string;
  sentiment: number;
  categories: string[];
  subcategories: string[];
  isDuplicate: boolean;
  source: {
    name: string;
    description: string;
    url: string;
  };
  image: string;
}

// News Response
export interface GetNewsResponse {
  articles: NewsArticle[];
  totalCount: number;
  page: number;
  count: number;
  hasMore: boolean;
}

// Dashboard Types
export interface SignalTag {
  label: string;
  type: "success" | "danger" | "info" | "warning";
}

export interface WeeklySignal {
  id: number;
  confidence: number;
  category: string[];
  title: string;
  description: string;
  url: string;
  tags: SignalTag[];
}

export interface TrendDashboard {
  articlesIndexed: number;
  mostMentionedOperator: {
    companyId: string;
    companyName: string;
    mentionCount: number;
  } | null;
  hottestTheme: string;
  regionMomentum: {
    region: string;
    trend: "up" | "down" | "stable";
  };
}

export interface NewsStreamItem {
  _id: string;
  uri: string;
  title: string;
  body: string;
  url: string;
  image?: string;
  publishedDate: string;
  categories: string[];
  subcategories: string[];
  source: {
    uri: string;
    dataType: string;
    title: string;
    name?: string;
  };
  LLM_headline: string;
  summary: string;
  LLM_category: string[];
  LLM_cat_children: string[];
  primary_region: string;
  secondary_regions: string[];
  isDuplicate: boolean;
  impact: string;
  regions: string[];
  companies: Array<{ company: string; id: string }>;
  assets: Array<{ data_center_facility_name: string; dc_id: string }>;
}

// Watchlist Item
export interface WatchlistItem {
  _id: string;
  title: string;
  url: string;
  image?: string;
  publishedDate: Date;
  source: {
    uri: string;
    dataType: string;
    title: string;
  };
  categories: string[];
  body: string;
  favouritedAt: Date;
}

// Dashboard response
export interface NewsSignalDashboardResponse {
  filters: {
    regions: { value: string; label: string }[];
    impacts: { value: string; label: string }[];
    themes: { value: string; label: string }[];
  };
  weeklySignals: WeeklySignal[];
  trendDashboard: TrendDashboard;
  newsStream: {
    news: NewsStreamItem[];

    page: number;
    count: number;
    hasMore: boolean;
    totalCount: number;
  };
  myWatchlist: WatchlistItem[];
}

export interface UpdateFavoriteRequest {
  newsId: string;
  action: "add" | "remove";
}

export interface UpdateFavoriteResponse {
  success: boolean;
  data: {
    success: boolean;
    message: string;
  };
}
