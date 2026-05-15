import { TMessage } from '@/types/models'

const ANONYMOUS_CONVERSATIONS_KEY = 'anonymous_conversations'
const MAX_ANONYMOUS_CONVERSATIONS = 10

// Check if we're on the client side
const isClient = typeof window !== 'undefined'

export type TAnonymousConversation = {
  id: string
  title: string
  messages: TMessage[]
  createdAt: Date
  updatedAt: Date
}

// Get all anonymous conversations from localStorage
export const getAnonymousConversations = (): TAnonymousConversation[] => {
  if (!isClient) return []

  const stored = localStorage.getItem(ANONYMOUS_CONVERSATIONS_KEY)
  if (!stored) return []

  try {
    const conversations = JSON.parse(stored)
    // Convert date strings back to Date objects
    return conversations.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
        updatedAt: new Date(msg.updatedAt)
      }))
    }))
  } catch {
    return []
  }
}

// Save a conversation to localStorage
export const saveAnonymousConversation = (
  conversationId: string,
  messages: TMessage[]
): void => {
  if (!isClient || messages.length === 0) return

  const conversations = getAnonymousConversations()
  const existingIndex = conversations.findIndex((c) => c.id === conversationId)

  // Generate title from first message
  const firstUserMessage = messages.find((m) => m.role === 'user')
  const title =
    firstUserMessage?.message_parts[0]?.content?.slice(0, 50) + '...' ||
    'New Chat'

  const conversation: TAnonymousConversation = {
    id: conversationId,
    title,
    messages,
    createdAt:
      existingIndex >= 0 ? conversations[existingIndex].createdAt : new Date(),
    updatedAt: new Date()
  }

  if (existingIndex >= 0) {
    // Update existing conversation
    conversations[existingIndex] = conversation
  } else {
    // Add new conversation at the beginning
    conversations.unshift(conversation)

    // Keep only the most recent conversations
    if (conversations.length > MAX_ANONYMOUS_CONVERSATIONS) {
      conversations.splice(MAX_ANONYMOUS_CONVERSATIONS)
    }
  }

  localStorage.setItem(
    ANONYMOUS_CONVERSATIONS_KEY,
    JSON.stringify(conversations)
  )
}

// Get a specific conversation
export const getAnonymousConversation = (
  conversationId: string
): TAnonymousConversation | null => {
  if (!isClient) return null

  const conversations = getAnonymousConversations()
  return conversations.find((c) => c.id === conversationId) || null
}

// Convert to TConversation format for compatibility with existing components
export const anonymousConversationsToFormat = (
  conversations: TAnonymousConversation[]
): any[] => {
  return conversations.map((conv) => ({
    _id: conv.id,
    id: conv.id,
    conversation_id: conv.id,
    title: conv.title,
    user_id: 'anonymous',
    conversation_source: 'anonymous' as any,
    is_active: true,
    message_count: conv.messages.length,
    last_message_at: conv.updatedAt,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt
  }))
}

// Clear all anonymous conversations
export const clearAnonymousConversations = (): void => {
  if (!isClient) return
  localStorage.removeItem(ANONYMOUS_CONVERSATIONS_KEY)
}
