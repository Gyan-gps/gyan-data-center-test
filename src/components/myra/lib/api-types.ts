// This file exports simplified types for API responses
// Since apiClient interceptor returns response.data, these types represent
// what we actually get from the apiClient calls

// Types are imported for potential future use
// import { TConversation, TMessage } from '@/types/models'

export type TApiResponse<T> = {
  message: string
  data: T
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Convenience type helpers
export type TApiDataResponse<T> = T extends { data: infer D } ? D : never
