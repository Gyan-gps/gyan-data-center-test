import { useEffect, useRef, useState } from "react";

import type { TMessage } from "../../../types/models";
import { cn } from "../../../lib/utils";

import { ConversationSidebar } from "./ConversationSidebar";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

/**
 * Chat Interface Props
 *
 * Defines the contract for the main chat component:
 * - conversationId: Current active conversation (null for new chat)
 * - messages: Array of messages in the conversation
 * - onSendMessage: Handler for when user submits a message
 * - isStreaming: Indicates if AI is currently generating a response
 * - onStopStream: Handler to interrupt streaming response
 */
type TChatInterfaceProps = {
  conversationId: string | null; // Current conversation ID
  messages: TMessage[]; // List of messages to display
  onSendMessage: (message: string) => void; // Callback when user sends message
  isStreaming: boolean; // Whether AI is currently streaming response
  onStopStream: (conversationId: string) => void; // Callback to stop streaming
  className?: string;
  isLoading: boolean; // Indicates if conversation is loading
  setMessages: React.Dispatch<React.SetStateAction<TMessage[]>>;
  setConvSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  convSidebarOpen: boolean;
};

/**
 * Chat Interface Component
 *
 * The main chat UI component that orchestrates the entire chat experience.
 *
 * Key responsibilities:
 * - Manages sidebar visibility state
 * - Handles auto-scrolling to latest messages
 * - Coordinates message display and input
 * - Shows streaming status and stop controls
 * - Provides navigation to new chats
 *
 * Layout structure:
 * - Collapsible sidebar (left): Conversation history
 * - Header (top): Controls and current chat info
 * - Message area (center): Scrollable message list
 * - Input area (bottom): Fixed position for message composition
 *
 * The component supports both authenticated and anonymous users,
 * adapting the sidebar content based on auth state.
 */
export const ChatInterface = ({
  conversationId,
  messages,
  onSendMessage,
  isStreaming,
  onStopStream,
  className,
  isLoading,
  setMessages,
  convSidebarOpen,
  setConvSidebarOpen,
}: TChatInterfaceProps) => {
  /**
   * Ref for auto-scrolling
   *
   * Points to an invisible element at the bottom of the message list.
   * Used to automatically scroll to the latest message when:
   * - New messages are added
   * - Streaming content updates
   * - Conversation loads
   */
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user is authenticated - not currently used but kept for future features
  // const { user } = useAuth()

  /**
   * Sidebar visibility state
   *
   * Controls whether the conversation sidebar is shown.
   * On mobile, sidebar overlays the chat area.
   * On desktop, sidebar pushes chat content.
   */
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    window && window.innerWidth > 1220
  );
  const [sidebarOpened, setSidebarOpened] = useState<
    string[] // 'active', 'inactive', 'hover'
  >(window && window.innerWidth > 1220 ? ["active"] : ["inactive"]);

  /**
   * Auto-scroll to bottom function
   *
   * Smoothly scrolls to the latest message.
   * Called whenever messages array changes to ensure
   * users always see the most recent content.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Auto-scroll effect
   *
   * Triggers scroll to bottom whenever messages change.
   * This includes:
   * - New user messages
   * - AI responses (both complete and streaming)
   * - Loading conversation history
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (window && window.innerWidth < 1300 && convSidebarOpen) {
      setIsSidebarOpen(true);
      setSidebarOpened(["active"]);
    } else if (window && window.innerWidth < 1300 && !convSidebarOpen) {
      setIsSidebarOpen(false);
      setSidebarOpened(["inactive"]);
    }
  }, [convSidebarOpen]);

  return (
    <div
      className={cn(
        "relative flex h-[92vh] xl:h-85vh max-[1300px]:pt-[58px] overflow-hidden",
        className
      )}
    >
      {/* 
        Conversation Sidebar
        
        Displays conversation history for quick navigation.
        Features:
        - Shows recent conversations with titles
        - Highlights current active conversation
        - Supports both authenticated and anonymous users
        - Responsive: Overlay on mobile, sidebar on desktop
      */}
      <ConversationSidebar
        currentConversationId={conversationId}
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setSidebarOpened={setSidebarOpened}
        sidebarOpened={sidebarOpened}
        onClose={() => {
          setIsSidebarOpen(false);
          setSidebarOpened(["closed"]);
          setConvSidebarOpen(false);
        }}
        messagesEmpty={messages?.length ? false : true}
        setMessages={setMessages}
        convSidebarOpen={convSidebarOpen}
      />

      {/* Main chat area */}
      <div className="flex h-full flex-1 flex-col">
        {/* 
          Scrollable Messages Area
          
          Main content area that displays the conversation.
          Features:
          - Scrollable container for long conversations
          - Max width constraint for readability
          - Bottom padding to ensure input doesn't overlap
          - Auto-scroll to latest message
        */}

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-2 text-lg text-muted-foreground">
                Loading conversation...
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`relative flex-1 bg-white ${
              messages?.length < 1
                ? "overflow-none grid place-items-center"
                : "overflow-auto"
            }`}
          >
            <div className="mx-auto max-w-6xl px-4 md:px-6">
              {/*
                Message List Component
                
                Renders all messages in the conversation.
                Handles:
                - User and AI message display
                - Streaming message updates
                - Follow-up question suggestions
                - Rich content (code, graphs, images)
              */}
              <MessageList
                isStreaming={isStreaming}
                messages={messages}
                onSendMessage={onSendMessage}
              />
              {/* 
                Auto-scroll anchor
                
                Invisible element that serves as scroll target.
                Positioned after all messages to ensure scrolling
                reaches the very bottom of the conversation.
              */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* 
          Fixed Input Area
          
          Sticky footer that contains message input and controls.
          Features:
          - Fixed positioning (always visible)
          - Backdrop blur for content visibility underneath
          - Responsive padding and sizing
          - Disabled state during streaming
          
          The semi-transparent background allows users to see
          messages behind while maintaining readability.
        */}
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Center-aligned content container */}
          <div className="flex justify-center">
            <div className="w-full max-w-[1100px]">
              {/* 
                  Message Input Component
                  
                  Text input for composing messages.
                  Features:
                  - Multi-line support with auto-resize
                  - Submit on Enter (Shift+Enter for new line)
                  - Disabled during streaming to prevent conflicts
                  - Dynamic placeholder based on state
                  
                  The input is the primary interaction point for users.
                */}
              <div className="p-4 px-2 md:p-6">
                <MessageInput
                  isDisabled={isStreaming}
                  isStreaming={isStreaming}
                  placeholder={
                    isStreaming
                      ? "Generating response..."
                      : "Commissioned capacity of DataCenter in Singapore"
                  }
                  onSend={onSendMessage}
                  onStopStream={() =>
                    conversationId && onStopStream(conversationId)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
