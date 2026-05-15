/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import z from 'zod';

// validate if the filters from query params match the expected schema
const CompanyFiltersSchema = z.object({
  companies: z.array(z.string()),
  companyTypes: z.array(z.string()),
  hqCountries: z.array(z.string()),
  hqRegions: z.array(z.string()),
  hqCities: z.array(z.string()),
});

const FiltersSchema = z.object({
  statuses: z.array(z.string()),
  operators: z.array(z.string()),
  dcTypes: z.array(z.string()),
  tierLevels: z.array(z.string()),
  yearRange: z.tuple([z.number(), z.number()]),
  itLoadRange: z.tuple([z.number(), z.number()]),
  cities: z.array(z.string()),
  countries: z.array(z.string()),
  regions: z.array(z.string()),
});

const ReportFiltersSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(25),
  userEmail: z.string(),
  search: z.string().default(''),
  category: z.string().default('').optional(),
  regions: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  publishedYears: z.array(z.number()).optional(),
  myAccessedReports: z.boolean().default(false),
});

const NewsFilterSchema = z.object({
  searchQuery: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  count: z.number().min(1).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
  categories: z.array(z.string()).optional(),
  subCategories: z.array(z.string()).optional(),
  limit: z.number().optional().default(10),
  page: z.number().min(1).optional().default(1),
  region: z.string().optional(),
  impact: z.string().optional(),
})

const SignalsFilterSchema = z.object({
  searchQuery: z.string().optional(),
  region: z.string().optional(),
  impact: z.string().optional(),
  categories: z.array(z.string()).optional(),
  subCategories: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  count: z.number().min(1).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
})

export type TCompanyFilterState = z.infer<typeof CompanyFiltersSchema>;
export type TFilterState = z.infer<typeof FiltersSchema>;
export type TReportFilterState = z.infer<typeof ReportFiltersSchema>;
export type TNewsFilterState = z.infer<typeof NewsFilterSchema>;
export type TSignalsFilterState = z.infer<typeof SignalsFilterSchema>;

export const companyFilterInitialState: TCompanyFilterState = {
  companies: [],
  companyTypes: [],
  hqCountries: [],
  hqRegions: [],
  hqCities: [],
}

export const filterInitialState: TFilterState = {
  statuses: [],
  operators: [],
  dcTypes: [],
  tierLevels: [],
  yearRange: [2000, 2030],
  itLoadRange: [0, 1000],
  cities: [],
  countries: [],
  regions: [],
}

export const reportFilterInitialState: TReportFilterState = {
  page: 1,
  limit: 25,
  userEmail: '',
  search: '',
  category: '',
  regions: [],
  countries: [],
  publishedYears: [],
  myAccessedReports: false,
};

export const MyreportFilterInitialState: TReportFilterState = {
  page: 1,
  limit: 25,
  userEmail: '',
  search: '',
  category: '',
  regions: [],
  countries: [],
  publishedYears: [],
  myAccessedReports: true,
};


export const newFilterInitialState: TNewsFilterState = {
  searchQuery: '',
  startDate: '',
  endDate: '',
  limit: 10,
  page: 1,
  count: 10,
  sortBy: '',
  sortOrder: '',
  categories: [],
  subCategories: [],
  region: '',
  impact: '',
};

export const signalsFilterInitialState: TSignalsFilterState = {
  searchQuery: '',
  region: '',
  impact: '',
  categories: [],
  subCategories: [],
  startDate: '',
  endDate: '',
  page: 1,
  count: 20,
  sortBy: '',
  sortOrder: '',
};

const getParserForSection = (section: 'company' | 'explorer' | 'data-center' | 'analytics' | 'reports' | 'news' | 'signals') => {
  const parsers = {
    company: { parser: CompanyFiltersSchema, initialState: companyFilterInitialState },
    explorer: { parser: FiltersSchema, initialState: filterInitialState },
    'data-center': { parser: FiltersSchema, initialState: filterInitialState },
    analytics: { parser: FiltersSchema, initialState: filterInitialState },
    reports: { parser: ReportFiltersSchema, initialState: reportFilterInitialState },
    news: { parser: NewsFilterSchema, initialState: newFilterInitialState },
    signals: { parser: SignalsFilterSchema, initialState: signalsFilterInitialState },
  };
  return parsers[section];
}

export const useSessionFilters = <T>(section: 'company' | 'explorer' | 'data-center' | 'analytics' | 'reports' | 'news' | 'signals') => {

  const { parser, initialState } = getParserForSection(section);

  const [sessionFilters, setSessionFilters] = useState<T>(initialState as T);

  useEffect(() => {
    const filtersOnStorage = sessionStorage.getItem('filters-' + section);
    if (filtersOnStorage) {
      try {
        const parsedFilters = JSON.parse(filtersOnStorage);
        const validation = parser.safeParse(parsedFilters);
        if (validation.success) {
          setSessionFilters(validation.data as T);
        } else {
          console.error('Invalid filters from sessionStorage:', validation.error);
          setSessionFilters(initialState as T);
        }
      } catch (error) {
        console.error('Error parsing filters from sessionStorage:', error);
        setSessionFilters(initialState as T);
      }
    }
  }, [section, parser, initialState]);


  const setFiltersInSession = (newFilters: Record<string, any>) => {
    const filtersString = JSON.stringify(newFilters);
    sessionStorage.setItem('filters-' + section, filtersString);
    setSessionFilters(newFilters as T);
  };


  return { sessionFilters, setFiltersInSession };
}