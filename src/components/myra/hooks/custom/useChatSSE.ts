/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef, useState } from "react";

import type { TSSEEvent } from "../../types/common";
import { debounceFn } from "../../lib/utils";
import { useAuth } from "@/hooks";
import toast from "react-hot-toast";
import { PUBLIC_API_BASE_URL } from "@/utils";
import { useStreamStore } from "./useStreamStore";
import { apiClient } from "@/services";
import { trackAiUsage } from "@/utils/ga";

/**
 * Custom Hook: useChatSSE
 *
 * Manages Server-Sent Events (SSE) connections for real-time chat streaming.
 *
 * Core responsibilities:
 * - Establishes SSE connection with backend
 * - Handles authentication (Firebase token vs fingerprint)
 * - Processes streaming events (text, graphs, images, etc.)
 * - Manages credit deduction for anonymous usersstream-ends
 * - Provides stream cancellation capability
 *
 * The hook abstracts the complexity of SSE handling and provides
 * a simple interface for components to send messages and receive
 * streaming responses.
 *
 * @returns {Object} Methods and state for chat streaming
 * - sendMessage: Function to send a message and start streaming
 * - stopStream: Function to abort the current stream
 * - isStreaming: Boolean indicating if currently streaming
 */
export const useChatSSE = () => {
  // Track streaming state - prevents concurrent streams
  const [isStreaming, setIsStreaming] = useState(false);

  // AbortController reference for cancelling active streams
  const abortControllerRef = useRef<AbortController | null>(null);

  // Access stream store for managing accumulated content
  const streamStore = useStreamStore();
  const { user, validateToken, token, shouldDeductCredit } = useAuth();

  const deductCreditForThisUser = shouldDeductCredit();

  const debouncedSetLoader = useRef(
    debounceFn(() => {
      streamStore.setCurrentEvent({ event: "loader", data: "Loading..." });
    }, 2000)
  ).current;

  /**
   * Send Message Function
   *
   * Sends a user message to the backend and handles the streaming response.
   *
   * Process flow:
   * 1. Validates no concurrent streams
   * 2. Checks authentication status
   * 3. Verifies credits (for anonymous users)
   * 4. Establishes SSE connection
   * 5. Processes streaming events
   * 6. Handles cleanup and error states
   *
   * @param message - The user's message text
   * @param conversationId - Optional ID for existing conversation
   * @throws Error with 'NO_CREDITS' for anonymous users without credits
   */
  const sendMessage = useCallback(
    async (message: string, conversationId: string) => {
      // Prevent multiple concurrent streams
      if (isStreaming) {
        toast.error("Already streaming a response");
        return;
      }

      if (!conversationId) {
        toast.error("Required field is missing");
        return;
      }
      setIsStreaming(true);
      streamStore.reset(); // Clear previous stream data

      // Create abort controller for cancelling the stream
      abortControllerRef.current = new AbortController();

      /**
       * Handle SSE Event
       *
       * Processes different types of streaming events from the backend.
       * Each event type updates the stream store appropriately.
       *
       * Event types:
       * - loader: Initial loading message
       * - text: Streaming text content (most common)
       * - graph: Data visualization payload
       * - image: Generated or retrieved images
       * - followup-questions: Suggested next queries
       * - chat-error: Error messages from backend
       * - chat-finish: Stream completion signal
       * - ping: Keep-alive signal
       *
       * @param event - The SSE event with type and data
       */
      const handleSSEEvent = (event: TSSEEvent) => {
        // Update current event in store for UI reactivity
        streamStore.setCurrentEvent(event);

        // shows the loading state if the content is taking more than 2s in between streaming
        if (
          event?.event &&
          ["text", "graph", "image", "followup-questions"].includes(event.event)
        ) {
          debouncedSetLoader();
        } else {
          debouncedSetLoader.cancel?.();
        }

        switch (event.event) {
          case "loader":
            // Initial loading state with optional message
            if (typeof event.data === "object" && "message" in event.data) {
              streamStore.setCurrentEvent({
                event: "loader",
                data: event.data.message,
              });
            }
            break;

          case "text": {
            // Most common event - streaming text chunks
            // Accumulates to form complete response
            const textContent =
              typeof event.data === "object" && "content" in event.data
                ? event.data.content
                : String(event.data);
            streamStore.appendText(textContent);
            break;
          }

          case "graph": {
            // Chart/graph data for visualization
            // Serialized as JSON string for storage
            const graphData =
              typeof event.data === "object" && "data" in event.data
                ? JSON.stringify(event.data.data)
                : String(event.data);
            streamStore.addGraph(graphData);
            break;
          }

          case "image": {
            // Image URLs or base64 data
            const imageUrl =
              typeof event.data === "object" && "url" in event.data
                ? event.data.url
                : String(event.data);
            streamStore.addImage(imageUrl);
            break;
          }

          case "followup-questions": {
            // Suggested questions for continuing conversation
            // Can be array or newline-separated string
            const questions =
              typeof event.data === "object" && "questions" in event.data
                ? event.data.questions
                : typeof event.data === "string"
                ? event.data.split("\n").filter((q) => q.trim())
                : [];
            streamStore.setFollowupQuestions(questions);
            break;
          }

          case "tool-call-chunk": {
            if (
              (typeof event.data === "object" &&
                event.data.tool_call_name &&
                ["search_report_content", "browse_report_catalog"].includes(
                  event.data.tool_call_name
                )) ||
              (typeof event.data === "string" &&
                event.data.includes("search_report_content")) ||
              event.data.includes("browse_report_catalog")
            ) {
              streamStore.addToolCallChunkData(JSON.stringify(event.data));
            }
            break;
          }

          case "chat-error":
            // Backend error - display to user
            toast.error("Error occured");
            streamStore.setCurrentEvent(null);
            break;

          case "chat-finish":
            // Stream completed successfully
            streamStore.setCurrentEvent(null);

            // call refresh user to update the latest credits
            setTimeout(validateToken, 5000);
            break;

          case "stream-ends":
            // call refresh user to update the latest credits
            setTimeout(validateToken, 5000);
            break;

          case "ping":
            // Keep-alive signal - no action needed
            // Prevents connection timeout
            break;

          case "deduct-credits":
          // Deduct credits in the frontend for UI only
          // setUserCredits(deductCredit(user?.myraRemainingCredits));
        }
      };

      try {
        /**
         * Authentication and Endpoint Selection
         *
         * Determines the appropriate endpoint and auth method:
         * - Authenticated users: Firebase token + /chat/stream
         * - Anonymous users: Fingerprint + /chat/anonymous-stream
         *
         * Anonymous users must have credits to proceed.
         */
        const authHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        const requestBody: {
          message: string;
          conversation_id: string;
        } = {
          message: message,
          conversation_id: conversationId,
        };

        /**
         * Establish SSE Connection
         *
         * Creates a POST request that returns a streaming response.
         * The AbortController signal allows cancellation.
         */
        trackAiUsage(
          user?.id,
          user?.email,
          user?.myraTotalCredits,
          (user?.myraTotalCredits || 0) - (user?.myraRemainingCredits || 0),
          user?.myraRemainingCredits
        );
        const response = await fetch(
          `${PUBLIC_API_BASE_URL}/chat/stream?abort_id=${conversationId}`,
          {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify(requestBody),
            signal: abortControllerRef.current.signal,
          }
        );

        // Handle non-OK responses
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to start stream");
        }

        // Set up stream reader and decoder
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        /**
         * Stream Processing Loop
         *
         * Reads chunks from the response stream and processes SSE events.
         *
         * SSE Format:
         * event: eventType\n
         * data: eventData\n\n
         *
         * The buffer handles partial chunks that may split events
         * across read operations.
         */
        let buffer = "";
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Append chunk to buffer
          buffer += decoder.decode(value, { stream: true });

          // Split buffer into full SSE messages (which end with \n\n)
          const eventChunks = buffer.split("\n\n");
          buffer = eventChunks.pop() || ""; // Keep partial chunk

          for (const chunk of eventChunks) {
            const lines = chunk.split("\n");
            let eventType = "";
            const dataLines: string[] = [];

            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith("data:")) {
                dataLines.push(line.slice(5)); // Don't trim() here — it may break formatting
              }
            }

            const fullData = dataLines.join("\n");
            let parsedData: any = fullData;

            try {
              parsedData = JSON.parse(fullData);
            } catch {
              console.warn("Failed to parse JSON:");
            }

            handleSSEEvent({
              event: eventType as TSSEEvent["event"],
              data: parsedData,
            });
          }
        }
      } catch (error: any) {
        /**
         * Error Handling
         *
         * Different error types require different handling:
         * - AbortError: User cancelled - silent
         * - NO_CREDITS: Re-throw for modal display
         * - Others: Show error toast
         */
        if (error.name === "AbortError") {
          // User intentionally cancelled - no error display
          console.log("Stream aborted");
        } else if (error.message === "NO_CREDITS") {
          // Re-throw to trigger credit purchase modal
          throw error;
        } else {
          // Unexpected error - notify user
          console.error("Stream error:", error);
          toast.error(error.message || "Failed to stream response");
        }
      } finally {
        /**
         * Cleanup
         *
         * Always reset state regardless of success/failure.
         * This ensures UI returns to correct state.
         */
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    // eslint-disable-next-line
    [isStreaming, streamStore]
  );

  /**
   * Stop Stream Function
   *
   * Cancels the active SSE stream.
   *
   * This is called when:
   * - User clicks stop button
   * - Component unmounts
   * - New conversation starts
   *
   * Aborting the fetch request closes the connection
   * and triggers cleanup in the sendMessage function.
   */
  const stopStream = useCallback(
    async (conversationId: string) => {
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const endpoint = `/chat/abort?abort_id=${conversationId}`;

      if (user) {
        // Authenticated user - use Firebase token
        authHeaders["Authorization"] = `Bearer ${token}`;
      }

      /**
       * Creates a POST request that aborts the streaming response.
       * The AbortController signal allows cancellation.
       */
      const response = await apiClient.post(
        `${endpoint}`,
        {},
        {
          signal: abortControllerRef.current?.signal,
        }
      );

      // Handle non-OK responses
      if (response instanceof Error) {
        throw new Error(response.message || "Failed to start stream");
      }

      if (abortControllerRef.current) {
        // Abort the fetch request
        abortControllerRef.current.abort();
        // Reset states
        setIsStreaming(false);
        streamStore.reset();
      }
    },

    // eslint-disable-next-line
    [streamStore]
  );

  /**
   * Hook Return Value
   *
   * Provides interface for chat streaming:
   * - sendMessage: Send message and handle stream
   * - stopStream: Cancel active stream
   * - isStreaming: Current streaming state
   */
  return { sendMessage, stopStream, isStreaming };
};
