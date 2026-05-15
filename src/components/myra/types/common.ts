/* eslint-disable @typescript-eslint/no-explicit-any */
/* Enums */
export const conversation_source_enum = ['free', 'paid'] as const
export type TConversationSource = (typeof conversation_source_enum)[number]

export const role_enum = ['user', 'agent'] as const
export type TRole = (typeof role_enum)[number]

export const query_type_enum = ['free', 'paid'] as const
export type TQueryType = (typeof query_type_enum)[number]

export const msg_part_type_enum = [
  'text',
  'graph',
  'image',
  'followup_question',
  'search_internet_with_summary',
  'browse_report_catalog',
  'search-report-content',
  'tool-call-chunk'
] as const

export type TMessagePartType = (typeof msg_part_type_enum)[number]

export type TMessagePart = {
  type: TMessagePartType
  content: string
}

/* SSE Event Types */
export type TSSEEventType =
  | 'loader'
  | 'text'
  | 'graph'
  | 'image'
  | 'followup-questions'
  | 'chat-finish'
  | 'chat-error'
  | 'ping'
  | 'deduct-credits'
  | 'stream-ends'
  | 'tool-call-chunk'

export type TSSEEvent = {
  event: TSSEEventType
  data: any
}

/* API Response Types */
export type TApiSuccess<T = unknown> = {
  message: string
  data?: T
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type TApiError = {
  message: string
  status_code: number
  errors?: Record<string, string[]>
}

export type TApiResponse<T = unknown> = TApiSuccess<T> | TApiError
