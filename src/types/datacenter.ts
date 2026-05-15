export interface DataCenter {
  id: string
  name: string
  operator: string
  country: string
  region: string
  city: string
  latitude: number
  longitude: number
  isActive: boolean
  totalITLoad: number
  establishedYear: number
  lastUpdated: string
  website?: string
  description?: string
}

export interface ITLoadData {
  assetId: string
  year: number
  month: number
  itLoadMW: number
  capacity: number
  utilization: number
}

export interface Company {
  id: string
  name: string
  type: 'operator' | 'tenant' | 'provider'
  totalAssets: number
  totalCapacity: number
  regions: string[]
  website?: string
  description?: string
}

export interface DataCenterFilters {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  city?: string;
  company?: string;
  status?: 'active' | 'inactive';
}

export interface ITLoadFilters {
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  datacenter?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
}
