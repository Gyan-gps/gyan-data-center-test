import { Sparkle } from "lucide-react";

import type { TMessage } from "../../../types/models";

import { MessageItem } from "./MessageItem";
import { StreamingMessage } from "./StreamingMessage";
// import { useAuth } from "@/hooks";
// import { useParams } from "react-router";

/**
 * Message List Props
 *
 * - messages: Array of conversation messages to display
 * - isStreaming: Whether AI is currently generating a response
 * - onSendMessage: Optional callback for starter question clicks
 */
type TMessageListProps = {
  messages: TMessage[];
  isStreaming: boolean;
  onSendMessage?: (message: string) => void;
};

/**
 * Message List Component
 *
 * Renders the conversation history and manages message display.
 *
 * Key features:
 * - Shows welcome screen with starter questions for new chats
 * - Renders all messages in chronological order
 * - Displays streaming indicator during AI response
 * - Handles both user and assistant messages
 *
 * The component adapts its display based on conversation state:
 * - Empty state: Welcome message with suggested questions
 * - Active chat: Message history with proper spacing
 * - Streaming: Shows live AI response indicator
 */
export const MessageList = ({
  messages,
  isStreaming,
  onSendMessage,
}: TMessageListProps) => {
  // const { user } = useAuth();

  /**
   * Starter questions for new conversations
   *
   * These suggestions help users understand capabilities
   * and provide quick conversation starters.
   * Clicking a question sends it as a message.
   */
  const starterQuestions = [
    {
      title: "Capacity & Growth",
      questions: [
        "What's the projected IT load growth for Northern Virginia data centers?",
        "Show data center expansion by hotspot: Frankfurt vs Singapore.",
        "Compare Tier 3 vs Tier 4 data centers by capacity and certifications.",
      ],
    },
    {
      title: "Operators & Competition",
      questions: [
        "Who are the leading data center operators in the Mumbai hotspot?",
        "Which colocation operators dominate capacity in the Frankfurt hotspot?",
        "Which data center operators have the largest capacity footprint in APAC?",
      ],
    },
    {
      title: "Power & Efficiency",
      questions: [
        "What's the forecasted IT load growth for Tier 3 and Tier 4 data centers?",
        "How do PUE values vary across US, EU, and APAC markets?",
        "What's the average Power Usage Effectiveness (PUE) in Asia-Pacific data centers?",
      ],
    },
    {
      title: "Projects & Expansion",
      questions: [
        "Which data center projects are under construction in Singapore?",
        "Show project pipeline growth for colocation operators across Europe.",
        "What hotspots offer the best expansion potential for new builds?",
      ],
    },
  ];

  /**
   * Empty State Display
   *
   * Shown when no messages exist and not streaming.
   * Provides:
   * - Welcome message
   * - Clickable starter questions
   * - Centered layout for visual appeal
   */
  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex h-max flex-col items-center justify-end lg:justify-center lg:p-8 lg:pb-0">
        <div className="text-center md:mb-2">
          <h2 className="mb-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-3xl font-semibold text-transparent md:h-[55px] md:text-4xl lg:text-5xl">
            Welcome to DCX AI
          </h2>
          <p className="mb-6 text-sm text-muted-foreground md:text-base">
            Answers powered by research. Delivered by AI.
          </p>
        </div>
        {/* 
            Starter Question Grid
            
            Only shown if onSendMessage callback is provided.
            Each question is a clickable button that:
            - Sends the question as a user message
            - Triggers the same flow as manual typing
            - Provides visual feedback on hover
          */}
        {onSendMessage && (
          <div className="mx-auto hidden w-full xl:block">
            {/* ─── Heading with fading lines ─── */}
            <div className="mb-6 flex items-center">
              <div className="h-px flex-1 bg-linear-to-l from-gray-300 to-transparent" />
              <h2 className="mx-4 whitespace-nowrap text-xl font-medium text-gray-500">
                Ask anything about data center projects, operators, hotspots,
                capacity, power, and benchmarking.{" "}
              </h2>
              <div className="h-px flex-1 bg-linear-to-r from-gray-300 to-transparent" />
            </div>

            {/* ─── Starter Questions Grid ─── */}
            <div className="grid grid-cols-4 gap-2">
              {starterQuestions.map((section, idx) => (
                <div
                  key={idx}
                  className="w-full max-w-[320px] rounded-lg border border-gray-200 bg-white"
                >
                  {/* Section header */}
                  <div className="flex w-full items-center justify-center rounded-t-lg border-b border-gray-200 bg-gray-100 px-4 py-2">
                    <h3 className="text-center text-base font-medium text-[#2b2b2b]">
                      {section.title}
                    </h3>
                  </div>

                  {/* Questions list */}
                  <ul className="divide-y divide-gray-200">
                    {section.questions.map((q, qIdx) => (
                      <li key={qIdx} className="h-24">
                        <button
                          className="group flex size-full justify-between bg-white px-4 py-3 text-left text-sm text-[#575757] transition-colors hover:bg-gray-100"
                          onClick={() => onSendMessage(q)}
                        >
                          <Sparkle className="mr-2 mt-1 size-3 flex-none text-[#999]" />
                          <div className="flex flex-col items-start justify-start gap-2">
                            <span>{q}</span>
                            <span className="text-xs italic text-primary opacity-0 transition-opacity group-hover:opacity-100">
                              Click to ask DCX AI &gt;&gt;
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /**
   * Active Conversation Display
   *
   * Shows message history with proper spacing.
   * Features:
   * - Chronological message order
   * - Consistent spacing between messages
   * - Streaming indicator at the bottom when active
   *
   * Each message is rendered with MessageItem component
   * which handles role-specific styling and content formatting.
   */
  return (
    <div className={`space-y-4 py-4 md:py-6`}>
      {/* Render all existing messages */}
      {messages.map((message, index) => {
        if (index === messages.length - 1 && !isStreaming) {
          return (
            <div
              key={index}
              className={`${"max-chat:min-h-[60dvh-60px] min-h-[calc(80dvh-150px)] md:min-h-[calc(76dvh-160px)] xl:min-h-[calc(80dvh-100px)]"}`}
            >
              <MessageItem key={index} index={index} message={message} />
            </div>
          );
        } else {
          return (
            <MessageItem
              key={index}
              index={index}
              isBlur={false}
              message={message}
            />
          );
        }
      })}
      {/* Show streaming indicator when AI is responding */}
      {isStreaming && (
        <div
          className={`${"max-chat:min-h-[60dvh-60px] min-h-[calc(80dvh-150px)] md:min-h-[calc(76dvh-160px)] xl:min-h-[calc(80dvh-100px)]"}`}
        >
          <StreamingMessage />
        </div>
      )}
    </div>
  );
};
