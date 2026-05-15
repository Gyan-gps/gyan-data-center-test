export interface ApiResponse<T = unknown> {
  data: T
  success: boolean
  message?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

export interface ApiError {
  message: string
  code?: string
  statusCode: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}
