import { createContext, useContext } from "react";
import type { TSSEEvent } from "../../types";
import type {
  TAddBrowseReportCatalog,
  TAddSearchReportContent,
  TStreamState,
} from "../../providers/stream-provider";

/**
 * Stream Context Value Type
 *
 * Extends the stream state with methods to manipulate it.
 * These methods are used by components to:
 * - Update the current SSE event
 * - Append streaming text content
 * - Add graphs, images, and follow-up questions
 * - Reset the stream state between messages
 */
type TStreamContextValue = TStreamState & {
  setCurrentEvent: (event: TSSEEvent | null) => void;
  appendText: (text: string) => void;
  addGraph: (graph: string) => void;
  addImage: (image: string) => void;
  setFollowupQuestions: (questions: string[]) => void;
  addBrowseReportCatalog: (data: TAddBrowseReportCatalog) => void;
  addSearchReportContent: (data: TAddSearchReportContent) => void;
  addToolCallChunkData: (data: any) => void;
  reset: () => void;
  chatFinished: boolean;
};

/**
 * Stream Context
 *
 * Central context for managing SSE streaming state across the application.
 * This context is crucial for:
 * - Real-time message streaming
 * - Progressive content rendering
 * - Managing multi-modal responses (text, graphs, images)
 */
export const StreamContext = createContext<TStreamContextValue | null>(null);

/**
 * Custom Hook: useStreamStore
 *
 * Provides access to the stream context for components that need to:
 * - Display streaming content in real-time
 * - Handle SSE events
 * - Manage accumulated response data
 *
 * Common usage:
 * - StreamingMessage component for live updates
 * - ChatInterface for stream management
 * - MessageList for rendering accumulated content
 *
 * @throws Error if used outside StreamProvider
 * @returns Stream context with state and methods
 */
export const useStreamStore = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error("useStreamStore must be used within StreamProvider");
  }
  return context;
};
