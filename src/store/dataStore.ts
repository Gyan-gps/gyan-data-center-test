import { create } from 'zustand'
import type { DataCenter, Company, ITLoadData, DataCenterFilters } from '@/types'

interface DataStore {
  // Data Centers
  dataCenters: DataCenter[]
  companies: Company[]
  itLoadData: ITLoadData[]
  
  // Filters
  filters: DataCenterFilters
  
  // Loading states
  isLoadingDataCenters: boolean
  isLoadingCompanies: boolean
  isLoadingITLoad: boolean
  
  // Actions
  setDataCenters: (dataCenters: DataCenter[]) => void
  setCompanies: (companies: Company[]) => void
  setITLoadData: (data: ITLoadData[]) => void
  setFilters: (filters: Partial<DataCenterFilters>) => void
  
  // Getters
  getFilteredDataCenters: () => DataCenter[]
  getDataCenterById: (id: string) => DataCenter | undefined
}

export const useDataStore = create<DataStore>((set, get) => ({
  // Initial state
  dataCenters: [],
  companies: [],
  itLoadData: [],
  filters: {},
  isLoadingDataCenters: false,
  isLoadingCompanies: false,
  isLoadingITLoad: false,

  // Actions
  setDataCenters: (dataCenters) => set({ dataCenters }),
  setCompanies: (companies) => set({ companies }),
  setITLoadData: (data) => set({ itLoadData: data }),
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters } 
    })),

  // Getters
  getFilteredDataCenters: () => {
    const { dataCenters, filters } = get()
    return dataCenters.filter((dc) => {
      if (filters.searchTerm && !dc.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false
      }
      if (filters.country && dc.country !== filters.country) {
        return false
      }
      if (filters.region && dc.region !== filters.region) {
        return false
      }
      if (filters.operator && dc.operator !== filters.operator) {
        return false
      }
      if (filters.isActive !== undefined && dc.isActive !== filters.isActive) {
        return false
      }
      return true
    })
  },

  getDataCenterById: (id) => {
    const { dataCenters } = get()
    return dataCenters.find((dc) => dc.id === id)
  }
}))
