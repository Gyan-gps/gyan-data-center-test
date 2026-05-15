import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  TGetConversationResponse,
  TGetConversationsResponse,
} from "../../types/api";
import toast from "react-hot-toast";
import type { TMessage } from "../../types";
import { apiClient } from "@/services";

/**
 * Custom Hook: useGetConversations
 *
 * Fetches all conversations for the authenticated user.
 *
 * Purpose:
 * - Load conversation history for sidebar
 * - Display recent chats with titles and timestamps
 * - Enable navigation between conversations
 *
 * Features:
 * - Automatic caching with React Query
 * - Optional enabled flag for conditional fetching
 * - Returns array of conversation objects
 *
 * Backend behavior:
 * - Returns conversations sorted by last activity
 * - Includes metadata (title, created_at, updated_at)
 * - Filters by authenticated user
 *
 * @param options - Query options including enabled flag
 * @returns Query object with conversations array, loading state, and error
 */
export const useGetConversations = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await apiClient.get<TGetConversationsResponse>(
        "/conversations"
      );
      // Extract conversations array from response
      return response?.data?.data?.conversations || [];
    },
    enabled: !!options?.enabled,
  });
};

/**
 * Custom Hook: useGetConversation
 *
 * Fetches a specific conversation with all its messages.
 *
 * Purpose:
 * - Load full conversation when user selects from sidebar
 * - Restore chat history when returning to conversation
 * - Display message thread in chronological order
 *
 * Features:
 * - Caches data for 1 second to prevent flicker
 * - Disabled when no conversationId provided
 * - Returns both messages and conversation metadata
 *
 * Backend behavior:
 * - Validates user owns the conversation
 * - Returns all messages in chronological order
 * - Includes full message content with all parts
 *
 * The short cache time (1 second) ensures users see
 * fresh data while preventing excessive refetches during
 * rapid navigation.
 *
 * @param conversationId - ID of conversation to fetch
 * @returns Query object with messages array and conversation metadata
 */
export const useGetConversation = (options: {
  conversationId: string;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["conversation", options.conversationId],
    queryFn: async () => {
      const response = await apiClient.get<TGetConversationResponse>(
        `/conversations/${options.conversationId}/messages`
      );
      // Return both messages and conversation metadata
      return {
        messages: response?.data?.data?.messages,
        conversation: response?.data?.data?.conversation,
      };
    },
    enabled:
      !!options?.enabled && !!options.conversationId ? options.enabled : false,
    staleTime: 1000, // Cache for 1 second to prevent rapid refetches
    refetchOnWindowFocus: false, // Don't refetch when user switches tabs
  });
};

/**
 * Custom Hook: useDeleteConversation
 *
 * Handles conversation deletion with optimistic UI updates.
 *
 * Purpose:
 * - Remove conversations from history
 * - Clean up user data
 * - Provide feedback on deletion status
 *
 * Features:
 * - Invalidates conversation list cache on success
 * - Shows success/error toasts
 * - Handles backend errors gracefully
 *
 * Backend behavior:
 * - Validates user owns the conversation
 * - Deletes conversation and all associated messages
 * - Returns 404 if conversation not found
 *
 * After successful deletion:
 * - Conversation disappears from sidebar
 * - User is redirected to new chat if viewing deleted conversation
 * - All messages are permanently removed
 *
 * @returns Mutation object with mutate function and status flags
 */
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiClient.delete(`/conversations/${conversationId}`);
    },
    onSuccess: () => {
      // Refresh conversations list after deletion
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation deleted");
    },
    onError: (error: Error) => {
      // Show error message from backend or fallback
      toast.error(error.message || "Failed to delete conversation");
    },
  });
};

/**
 * Custom Hook: useUpdateConversation
 *
 * Updates conversation metadata (currently only title/rename).
 *
 * Purpose:
 * - Allow users to rename conversations
 * - Organize chat history with meaningful titles
 * - Update conversation metadata
 *
 * Features:
 * - Invalidates conversation cache on success
 * - Shows success/error toasts
 * - Supports partial updates (PATCH)
 *
 * Backend behavior:
 * - Validates user owns the conversation
 * - Updates only provided fields
 * - Returns updated conversation object
 *
 * Future enhancements could include:
 * - Updating conversation settings
 * - Adding tags or categories
 * - Changing conversation visibility
 *
 * @returns Mutation object with mutate function for updating conversations
 */
export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      title,
    }: {
      conversationId: string;
      title: string;
    }) => {
      const response = await apiClient.patch(
        `/conversations/${conversationId}`,
        { title }
      );
      return response.data;
    },
    onSuccess: () => {
      // Refresh conversations list to show new title
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation renamed");
    },
    onError: (error: Error) => {
      // Show error message from backend or fallback
      toast.error(error.message || "Failed to rename conversation");
    },
  });
};

type FeedbackPayload = {
  conversationId: string;
  payload: {
    messageId: string;
    feedback: "like" | "dislike";
    message_index?: number;
  };
};

export const useRecordResponseFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, payload }: FeedbackPayload) => {
      await apiClient.patch(
        `/conversations/feedback/${conversationId}`,
        payload
      );
      return { conversationId, ...payload };
    },

    onMutate: async ({ conversationId, payload }) => {
      const { messageId, feedback } = payload;

      // Dynamically find the full matching query key
      const queries = queryClient.getQueriesData({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "conversation" &&
          query.queryKey[1] === conversationId,
      });

      const [matchingKey, previousData] = queries[0] || [];

      if (!matchingKey) return;

      // Cancel any outgoing refetches for this key
      await queryClient.cancelQueries({ queryKey: matchingKey });

      // Optimistically update the cache
      queryClient.setQueryData(
        matchingKey,
        (oldData: Record<string, TMessage[]> | null) => {
          if (!oldData) return oldData;

          const updatedMessages = oldData.messages.map((msg: TMessage) =>
            msg._id === messageId ? { ...msg, feedback } : msg
          );

          return {
            ...oldData,
            messages: updatedMessages,
          };
        }
      );

      return { previousData, matchingKey };
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousData && context?.matchingKey) {
        queryClient.setQueryData(context.matchingKey, context.previousData);
      }

      toast.error(
        error?.message || "Unable to record your feedback. Please try again."
      );
    },

    onSuccess: () => {
      // toast.success('Thank you for your feedback.')
    },
  });
};
