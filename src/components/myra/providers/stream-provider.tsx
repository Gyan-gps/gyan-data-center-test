import { useState } from "react";
import type { ReactNode } from "react";

import type { TSSEEvent } from "../types";
import { StreamContext } from "../hooks/custom/useStreamStore";

export type TAddBrowseReportCatalog = {
  catalog_search_results: {
    title: string;
    url: string;
  }[];
};

export type TAddSearchReportContent = {
  queries: string[];
  semantic_search_results: any[];
};

/**
 * Stream State Type Definition
 *
 * This type defines the structure of the streaming state that tracks:
 * - Current SSE event being processed
 * - Accumulated content from the stream (text, graphs, images)
 * - Suggested follow-up questions from the AI
 *
 * The state is designed to handle incremental updates as data
 * streams in from the server via Server-Sent Events (SSE).
 */
export type TStreamState = {
  currentEvent: TSSEEvent | null; // Current SSE event being processed
  // accumulatedContent: {
  //   text: string // Accumulated text content from stream
  //   graphs: string[] // Array of graph/chart data
  //   images: string[] // Array of image URLs
  //   followupQuestions: string[] // Suggested follow-up questions
  // }
  finalData: any[];
};

/**
 * Stream Provider Component
 *
 * This provider manages the global state for SSE streaming.
 * It's responsible for:
 * - Maintaining the current stream state
 * - Providing methods to update streaming content
 * - Accumulating partial responses as they arrive
 * - Resetting state between conversations
 *
 * The provider enables real-time UI updates as data streams from the server,
 * creating a smooth user experience for AI responses.
 */
export const StreamProvider = ({ children }: { children: ReactNode }) => {
  /**
   * Initialize empty stream state
   *
   * Default state represents no active stream with empty accumulated content.
   * This state is restored when:
   * - User starts a new conversation
   * - Stream is manually reset
   * - Error occurs requiring state cleanup
   */
  const [state, setState] = useState<TStreamState>({
    currentEvent: null,
    // accumulatedContent: {
    //   text: '',
    //   graphs: [],
    //   images: [],
    //   followupQuestions: []
    // },
    finalData: [],
  });

  // to show the loading on ping only if the chat finish is not yet triggered
  const [chatFinished, setChatFinished] = useState(false);

  // const [prevEventName, setPrevEventName] = useState<string | null>(null)

  /**
   * Set Current SSE Event
   *
   * Updates the current event being processed from the SSE stream.
   * This is called when:
   * - New SSE event arrives from server
   * - Stream starts (event type: 'start')
   * - Stream ends (event type: 'done')
   * - Error occurs (event type: 'error')
   *
   * @param event - The SSE event object or null to clear
   */
  const setCurrentEvent = (event: TSSEEvent | null) => {
    if (event?.event === "chat-finish") {
      setChatFinished(true);
    }
    setState((prev) => ({ ...prev, currentEvent: event }));
  };

  /**
   * Append Text Content
   *
   * Incrementally adds text to the accumulated content as it streams.
   * This creates the "typing" effect for AI responses.
   *
   * Called when:
   * - Content chunks arrive via SSE
   * - Each chunk is appended to create complete response
   *
   * @param text - Text chunk to append
   */
  const appendText = (text: string) => {
    setState((prev) => {
      const lastIndex = prev.finalData.length - 1;
      const lastItem = prev.finalData[lastIndex];

      // If last item is not text, avoid mutation
      if (!lastItem || lastItem.type !== "text") {
        return {
          ...prev,
          finalData: [
            ...prev.finalData,
            {
              type: "text",
              content: text,
            },
          ],
        };
      }

      const updatedItem = {
        ...lastItem,
        content: lastItem.content + text,
      };

      const updatedFinalData = [
        ...prev.finalData.slice(0, lastIndex),
        updatedItem,
      ];

      return {
        ...prev,
        finalData: updatedFinalData,
      };
    });
  };

  /**
   * Add Graph Data
   *
   * Adds graph/chart data to the accumulated content.
   * Graphs are rendered as separate components below text.
   *
   * @param graph - Serialized graph data (JSON string)
   */
  const addGraph = (graph: string) => {
    setState((prev) => ({
      ...prev,
      finalData: [
        ...prev.finalData,
        {
          type: "graph",
          content: graph,
        },
      ],
    }));
  };

  /**
   * Add Image URL
   *
   * Adds image URL to the accumulated content.
   * Images are displayed inline with the response.
   *
   * @param image - Image URL or base64 data
   */
  const addImage = (image: string) => {
    setState((prev) => ({
      ...prev,
      finalData: [
        ...prev.finalData,
        {
          type: "image",
          content: image,
        },
      ],
    }));
  };

  /**
   * Set Follow-up Questions
   *
   * Updates the suggested follow-up questions from AI.
   * These are displayed as clickable options after response.
   *
   * Unlike other content, this replaces rather than appends.
   *
   * @param questions - Array of suggested questions
   */
  const setFollowupQuestions = (questions: string[]) => {
    setState((prev) => ({
      ...prev,
      finalData: [
        ...prev.finalData,
        {
          type: "followup_question",
          content: JSON.stringify(questions),
        },
      ],
    }));
  };

  const addBrowseReportCatalog = (data: TAddBrowseReportCatalog) => {
    setState((prev) => ({
      ...prev,
      finalData: [
        ...prev.finalData,
        {
          type: "browse_report_catalog",
          content: JSON.stringify({
            ...data,
            heading: "Browse Report Catalog",
          }),
        },
      ],
    }));
  };

  const addSearchReportContent = (data: TAddSearchReportContent) => {
    setState((prev) => ({
      ...prev,
      finalData: [
        ...prev.finalData,
        {
          type: "search_report_content",
          content: JSON.stringify({ ...data }),
        },
      ],
    }));
  };

  const addToolCallChunkData = (data: any) => {
    setState((prev) => ({
      ...prev,
      finalData: [
        ...prev.finalData,
        {
          type: "tool-call-chunk",
          content: data,
        },
      ],
    }));
  };

  /**
   * Reset Stream State
   *
   * Clears all accumulated content and current event.
   * This is called when:
   * - Starting a new message
   * - Switching conversations
   * - Cleaning up after errors
   *
   * Essential for preventing content from previous streams
   * appearing in new messages.
   */
  const reset = () => {
    setState({
      currentEvent: null,
      // accumulatedContent: {
      //   text: '',
      //   graphs: [],
      //   images: [],
      //   followupQuestions: []
      // },
      finalData: [],
    });
    setChatFinished(false);
  };

  return (
    <StreamContext.Provider
      value={{
        ...state,
        setCurrentEvent,
        appendText,
        addGraph,
        addImage,
        setFollowupQuestions,
        addBrowseReportCatalog,
        addSearchReportContent,
        addToolCallChunkData,
        reset,
        chatFinished,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
};
