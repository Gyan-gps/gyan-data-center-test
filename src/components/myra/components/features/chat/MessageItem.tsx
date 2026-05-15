import { useCallback, useRef, useState } from "react";

import {
  Bot,
  Copy as CopyIcon,
  Volume2 as SpeakerIcon,
  // ThumbsDown,
  // ThumbsUp,
  VolumeX,
} from "lucide-react";

import type { TMessagePartType } from "../../../types/common";
import type { TMessage } from "../../../types/models";
import { cn } from "../../../lib/utils";
import { useRecordResponseFeedback } from "../../../hooks/api/useConversations";

import BrowseReportCatalog from "../../../components/browse-report-catalog";
import { GraphContainer } from "../../../components/graph-container";
import { Markdown } from "../../../components/markdown";
import SearchInternet from "../../../components/search-internet";
import SearchReportContent from "../../../components/search-report-content";
import { Button } from "../../../components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks";

type TMessageItemProps = {
  message: TMessage;
  className?: string;
  isBlur?: boolean;
  index: number;
};

/**
 * Message Item Component
 *
 * Renders individual messages in the chat conversation.
 *
 * Key features:
 * - Role-based styling (user vs assistant)
 * - Multi-part message support (text, graphs, images, follow-ups)
 * - Avatar display with user initials or AI icon
 * - Responsive layout with proper alignment
 *
 * Message parts are rendered based on their type:
 * - text: Markdown formatted content
 * - graph: Interactive data visualizations
 * - image: AI-generated or uploaded images
 * - followup_question: Suggested next questions
 */
export const MessageItem = ({
  message,
  className,
  isBlur,
  index,
}: TMessageItemProps) => {
  const isUser = message.role === "user";
  const { user } = useAuth();
  const { mutate: recordFeedback } = useRecordResponseFeedback();

  const [feedback, setFeedback] = useState(message?.feedback || null);
  const [showFeedbackUI, setShowFeedbackUI] = useState(
    message?.feedback ? false : true
  );

  const feedbackContainerRef = useRef(null);

  const messageText = message.message_parts
    .map((part: any) => {
      if (part.type === "text" || part.type === "graph") {
        return part.content;
      } else if (part.type === "followup-questions") {
        let temp = "";
        const follow_up_questions = JSON.parse(part.content);
        if (!follow_up_questions) {
          return "";
        }
        follow_up_questions.forEach((text: string) => {
          temp += text + "\n";
        });

        return temp;
      } else {
        return "";
      }
    })
    .join("\n")
    .trim();

  const [isReadAloudActive, setIsReadAloudActive] = useState<boolean>(false);

  /**
   * Get Avatar Letter
   *
   * Determines what to display in the avatar circle:
   * - For AI: Always shows 'AI'
   * - For users: First letter of name or email
   * - Fallback: 'U' for anonymous users
   */
  const getAvatarLetter = () => {
    if (!isUser) return "AI";
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  /**
   * Render Message Part
   *
   * Dynamically renders content based on message part type.
   * This allows messages to contain mixed content types
   * in a single response.
   *
   * @param part - Message part with type and content
   * @param index - Array index for React key
   */
  const renderMessagePart = (
    part: { type: TMessagePartType; content: string },
    index: number
  ) => {
    switch (part.type) {
      /**
       * Text Content
       *
       * Most common message type.
       * Rendered with Markdown support for:
       * - Code blocks with syntax highlighting
       * - Lists and formatting
       * - Links and emphasis
       */
      case "text":
        return <Markdown key={index} text={part.content} />;

      /**
       * Graph/Chart Content
       *
       * Renders interactive data visualizations.
       * Content is expected to be JSON with:
       * - data: Chart data points
       * - title: Chart title
       * - type: 'bar' or 'line'
       *
       * Falls back to text display if parsing fails.
       */
      case "graph": {
        try {
          const graphData = JSON.parse(part.content);

          if (graphData.data) {
            return (
              <GraphContainer
                key={index}
                data={graphData.data}
                title={graphData.title}
                type={graphData.type || "bar"}
              />
            );
          }
          return null;
        } catch {
          // Fallback if JSON parsing fails
          return (
            <div key={index} className="my-3 rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                📊 Graph: {part.content}
              </p>
            </div>
          );
        }
      }

      /**
       * Image Content
       *
       * Displays images in the chat.
       * Supports:
       * - URLs (external images)
       * - Base64 encoded data
       * - AI-generated images
       *
       * Images are responsive with max width constraint.
       */
      case "image":
        // Content can be URL or base64 data
        return (
          <div key={index} className="my-3">
            <img
              alt="AI generated image"
              className="w-full max-w-md rounded-lg"
              height={300}
              src={part.content}
              width={400}
            />
          </div>
        );

      /**
       * Follow-up Questions
       *
       * Suggested questions to continue the conversation.
       * Helps users discover related topics or dive deeper.
       *
       * Content format:
       * - JSON array of strings (preferred)
       * - Newline-separated strings (fallback)
       *
       * These are not clickable in MessageItem but can be
       * copied or used as inspiration for next query.
       */
      case "followup_question": {
        // Parse the JSON string to get the questions array
        let questions: string[] = [];
        try {
          questions = JSON.parse(part.content);
        } catch {
          // Fallback to splitting by newline if not valid JSON
          questions = part.content.split("\n").filter((q) => q.trim());
        }

        return (
          <div key={index} className="my-3 space-y-2">
            <p className="text-sm font-medium text-primary">
              You might also ask:
            </p>
            <ul className="space-y-1">
              {questions.map((question, qIndex) => (
                <li
                  key={qIndex}
                  className="pl-4 text-sm text-muted-foreground before:mr-2 before:font-bold before:text-primary before:content-['•']"
                >
                  {question}
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case "tool-call-chunk": {
        const data = JSON.parse(part.content);
        if (!data) return null;

        if (data.tool_call_name === "search_report_content") {
          const componentData: any = {
            queries: [],
            semantic_search_results: [],
          };

          componentData["queries"] =
            data?.tool_call_result?.data?.queries || [];

          componentData["semantic_search_results"] =
            data?.tool_call_result?.data?.semantic_search_results || [];

          return <SearchReportContent key={index} data={componentData} />;
        } else if (data.tool_call_name === "browse_report_catalog") {
          const componentData: any = {
            catalog_search_results: [],
          };

          componentData["catalog_search_results"] =
            data?.tool_call_result?.data?.catalog_search_results || [];

          return (
            <BrowseReportCatalog
              key={index}
              catalog_search_results={componentData.catalog_search_results}
            />
          );
        }

        break;
      }

      case "search_internet_with_summary": {
        const internetSearchData = JSON.parse(part.content);
        return (
          <SearchInternet
            key={index}
            data={internetSearchData.data}
            heading={internetSearchData.heading}
            time_taken={internetSearchData.time_taken}
          />
        );
      }

      default:
        return null;
    }
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(messageText)
      .then(() => {
        // console.log('Copied to clipboard')
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
    toast.success("Message copied successfully");
  }, [messageText]);

  const handleSpeak = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const messageText = message.message_parts
        .map((part: any) => {
          if (part.type === "text") {
            return part.content;
          } else if (part.type === "followup-questions") {
            let temp = "";
            const follow_up_questions = JSON.parse(part.content);
            if (!follow_up_questions) {
              return "";
            }
            follow_up_questions.forEach((text: string) => {
              temp += text + "\n";
            });

            return temp;
          } else {
            return "";
          }
        })
        .join("\n")
        .trim();

      if (!messageText) {
        toast.error("Nothing to speak");
        return;
      }

      // Cancel current speech if active
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(messageText);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onerror = (_event) => {
        setIsReadAloudActive(false);
        return;
      };

      setIsReadAloudActive(true);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Speech not supported in this browser");
    }
  }, [message.message_parts]);

  const stopReadAloud = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsReadAloudActive(false);
    }
  };

  const handleResponseFeedback = (userFeedback: "like" | "dislike") => {
    if (feedback) return;

    setFeedback(userFeedback);

    const payload = {
      messageId: message._id,
      feedback: userFeedback,
      message_index: index,
    };

    recordFeedback({
      conversationId: message.conv_id,
      payload,
    });

    setTimeout(() => {
      setShowFeedbackUI(false);
    }, 3000);
  };

  /**
   * Message Layout
   *
   * Renders message with avatar and content bubble.
   * Layout features:
   * - User messages: Right-aligned with reverse flex
   * - AI messages: Left-aligned with normal flex
   * - Responsive sizing and spacing
   * - Max width constraint for readability
   */
  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {/* 
        Avatar Circle
        
        Visual indicator of message sender:
        - User: Colored background with initial
        - AI: Muted background with bot icon
        
        Size is responsive (smaller on mobile)
      */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium md:h-10 md:w-10 md:text-base",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? (
          <span>{getAvatarLetter()}</span>
        ) : (
          <Bot className="size-4 md:size-5" />
        )}
      </div>

      {/* 
        Message Content Bubble
        
        Contains all message parts with appropriate styling:
        - User: Light primary background
        - AI: Muted background
        - Constrained width for readability
        - Responsive padding
        
        Multiple message parts are stacked vertically
        within the same bubble.
      */}
      <div
        className={cn(
          "relative max-w-[85%] text-primary-dark rounded-lg px-3 py-2 md:max-w-[80%] md:px-4 md:py-3",
          isUser ? "bg-primary/10" : `${showFeedbackUI ? "mb-16" : "mb-10"}`,
          isBlur ? "z-10 select-none blur-xs" : ""
        )}
      >
        {message.message_parts.map((part, index) =>
          renderMessagePart(part, index)
        )}
        {/* Icon row */}
        {!isUser ? (
          <div
            className={`absolute ${
              showFeedbackUI ? "-bottom-16" : "-bottom-11"
            } left-0 flex w-full items-center justify-between p-2 text-muted-foreground md:-bottom-11`}
          >
            <div className="flex items-center gap-2 ">
              <button
                className="hover:enabled:text-primary disabled:!cursor-default"
                title="Copy"
                onClick={handleCopy}
                disabled={isBlur}
              >
                <CopyIcon className="size-4" />
              </button>
              <button
                className="hover:enabled:text-primary disabled:!cursor-default"
                title={isReadAloudActive ? "Stop reading" : "Read aloud"}
                onClick={() =>
                  isReadAloudActive ? stopReadAloud() : handleSpeak()
                }
                disabled={isBlur}
              >
                {isReadAloudActive ? (
                  <VolumeX className="size-[18px]" />
                ) : (
                  <SpeakerIcon className="size-[18px]" />
                )}
              </button>
            </div>

            {showFeedbackUI && (
              <div
                ref={feedbackContainerRef}
                className="flex w-fit flex-col items-center justify-center gap-2 self-end px-3 md:flex-row md:gap-6"
              >
                {!feedback ? (
                  <>
                    <p className="text-sm text-primary">
                      Was this response helpful?
                    </p>
                    <div className="flex items-center justify-center">
                      <Button
                        className="h-fit w-16 rounded-none rounded-l-full p-1 pl-4 text-primary transition-colors duration-200 hover:border-primary"
                        size="sm"
                        title="Good Response"
                        variant="outline"
                        onClick={() => handleResponseFeedback("like")}
                        disabled={isBlur}
                      >
                        Yes
                      </Button>

                      <Button
                        className="h-fit w-16 rounded-none rounded-r-full p-1 pr-4 text-primary transition-colors duration-200 hover:border-primary"
                        size="sm"
                        title="Bad Response"
                        variant="outline"
                        onClick={() => handleResponseFeedback("dislike")}
                        disabled={isBlur}
                      >
                        No
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="flex-1 px-1 text-sm text-primary md:px-4">
                    Thank you for your feedback!
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
