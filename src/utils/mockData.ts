export interface Signal {
  id: string;
  confidence: number;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  type: 'Opportunity' | 'Risk';
  tags: string[];
}

export interface NewsItem {
  id: string;
  type: 'Opportunity' | 'Risk';
  date: string;
  source: string;
  title: string;
  description: string;
  selected?: boolean;
}

export interface TrendMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
}

export interface WatchlistItem {
  id: string;
  name: string;
}

export const signals: Signal[] = [
  {
    id: '1',
    confidence: 78,
    category: 'PROJECTS',
    title: 'Multiple campus announcements in APAC',
    description: 'Tier-2 metros see fresh sites and phase expansions.',
    type: 'Opportunity',
    tags: ['APAC', 'Pipeline'],
  },
  {
    id: '2',
    confidence: 72,
    category: 'CORPORATE / CAPITAL',
    subcategory: '...T ONLY',
    title: 'Debt raises fuel operator growth',
    description: 'Operators secure facilities to accelerate build schedules.',
    type: 'Opportunity',
    tags: ['Debt', 'Capex'],
  },
  {
    id: '3',
    confidence: 69,
    category: 'ENVIRONMENTAL & COMMUNITY',
    title: 'Permitting scrutiny extends timelines',
    description: 'Local councils add environmental conditions in EU hubs.',
    type: 'Risk',
    tags: ['Permits', 'ESG'],
  },
];

export const trendMetrics: TrendMetric[] = [
  {
    label: 'ARTICLES INDEXED',
    value: 132,
  },
  {
    label: 'MOST MENTIONED OPERATOR',
    value: 'Equinix',
  },
  {
    label: 'HOTTEST THEME',
    value: 'Expansion & Pipeline',
  },
  {
    label: 'REGION MOMENTUM',
    value: 'APAC',
    trend: 'up',
  },
];

export const newsItems: NewsItem[] = [
  {
    id: '1',
    type: 'Opportunity',
    date: '2025-10-22',
    source: 'Metro Daily',
    title: 'Operator X announces 60MW campus in Jakarta fringe',
    description: 'Site acquisition completed; phase-1 shell to break ground in Q1 with staged IT load.',
    selected: false,
  },
  {
    id: '2',
    type: 'Opportunity',
    date: '2025-10-21',
    source: 'Tech Finance Today',
    title: 'Global provider secures $500M credit facility',
    description: 'New debt package to fund expansion across Southeast Asian markets with delivery targets in 2026.',
    selected: false,
  },
  {
    id: '3',
    type: 'Risk',
    date: '2025-10-20',
    source: 'EU Regulatory Watch',
    title: 'Frankfurt council delays approval for 30MW site',
    description: 'Additional environmental impact assessment required, pushing timeline by 6-9 months.',
    selected: false,
  },
  {
    id: '4',
    type: 'Opportunity',
    date: '2025-10-19',
    source: 'APAC Infrastructure',
    title: 'Singapore operator announces expansion to Malaysia',
    description: 'Phase 1 development to begin in Johor with 25MW capacity targeted for Q3 2026.',
    selected: false,
  },
];

export const watchlistItems: WatchlistItem[] = [
  { id: '1', name: 'Equinix' },
  { id: '2', name: 'Digital Realty' },
  { id: '3', name: 'APAC' },
  { id: '4', name: 'Regulatory, ESG & Community' },
];

export const themes = [
  'All',
  'Projects',
  'Corporate / Capital (...T Only)',
  'Environmental & Community',
  'Operations & Incidents',
];

export const quickFilters = [
  'Projects',
  'Corporate / Capital',
  'Environmental & Community',
  'Operations & Incidents',
  'APAC',
];
