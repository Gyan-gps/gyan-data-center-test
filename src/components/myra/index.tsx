import { useNavigate, useParams } from "react-router";
import { useChatSSE } from "./hooks/custom/useChatSSE";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { TMessage } from "./types";
import { useGetConversation } from "./hooks/api/useConversations";
import toast from "react-hot-toast";
import {
  generateObjectId,
  generateUUID,
  sendEventToDataLayer,
} from "./lib/utils";
import { ChatInterface } from "./components/features/chat/ChatInterface";
import { useAuth } from "@/hooks";
import { useStreamStore } from "./hooks/custom/useStreamStore";
import creditImg from "@/assets/images/credit-img.svg";
import { Button } from "../ui";
import { Menu, X } from "lucide-react";
import { trackAiUsage } from "@/utils/ga";

export default function ChatConversationPage() {
  // Get conversation ID from URL params
  const params = useParams();
  let conversationId = params.conversation_id as string;

  // Authentication and routing
  const {
    user,
    message: stateMessage,
    setMessage: setStateMessage,
    credits,
    shouldDeductCredit,
  } = useAuth();

  // should users credit be deducted? Trail users should have credits deducted only
  const deductCreditForThisUser = shouldDeductCredit();

  // SSE streaming hooks
  const { sendMessage, isStreaming, stopStream } = useChatSSE();
  const streamStore = useStreamStore();
  const query = useQueryClient();
  const navigate = useNavigate();

  // Local state for messages - simple approach as requested
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [convSidebarOpen, setConvSidebarOpen] = useState(false);

  const {
    error: authenticatedConversationError,
    data: authenticatedConversation,
    isLoading: authLoading,
  } = useGetConversation({
    enabled: !!user && !stateMessage?.[conversationId] && !!conversationId,
    conversationId: conversationId,
  });

  // Select appropriate data based on auth state
  const conversation = authenticatedConversation;
  const isLoading = authLoading;

  // Load existing messages when conversation data arrives
  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation?.messages]);

  // Handle errors by redirecting to new chat
  useEffect(() => {
    if (
      user &&
      authenticatedConversationError &&
      !stateMessage?.[conversationId] &&
      conversationId
      //  &&
      // messages.length > 2
    ) {
      toast.error("Failed to load conversation");
      setMessages([]);
      navigate("/dcx-ai");
    }
    // eslint-disable-next-line
  }, [authenticatedConversationError, user]);

  // Create assistant message when streaming completes
  useEffect(() => {
    if (!isStreaming && streamStore.finalData?.length > 0) {
      // Build assistant message from accumulated stream content
      const objectId = generateObjectId();
      const assistantMessage: TMessage = {
        _id: objectId,
        id: objectId,
        conv_id: conversationId,
        user_id: "assistant",
        role: "agent",
        query_type: "paid",
        message_parts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        blur_message: false,
        // user?.myraRemainingCredits === 0 && user?.myraTotalCredits <= 2,
      };

      assistantMessage.message_parts = streamStore.finalData;

      // Add message to local state and reset stream
      setMessages((prev) => [...prev, assistantMessage]);
      streamStore.reset();
    }
    // eslint-disable-next-line
  }, [isStreaming, streamStore, conversationId]);

  // Handle sending a new message
  const handleSendMessage = async (message: string) => {
    sendEventToDataLayer("questions-asked");

    // Check credits
    if (user && deductCreditForThisUser && user.myraRemainingCredits <= 0) {
      toast.error("You have no DCX AI credits remaining");
      return;
    }

    if (!conversationId) {
      conversationId = generateUUID();
      if (!conversationId) return;
      setStateMessage(conversationId, message);
      navigate(`/dcx-ai/${conversationId}`);
    }

    // Create user message and add to UI immediately (optimistic update)
    const objectId = generateObjectId();
    const userMessage: TMessage = {
      _id: objectId,
      id: objectId,
      conv_id: conversationId,
      user_id: user?.id || "anonymous",
      role: "user",
      query_type: "paid",
      message_parts: [{ type: "text", content: message }],
      createdAt: new Date(),
      updatedAt: new Date(),
      blur_message: false,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Send to backend and start SSE stream
      await sendMessage(message, conversationId);

      // Track AI usage after successful message send
      if (user) {
        trackAiUsage(
          user.id.toString(),
          user.email,
          user.myraTotalCredits || 0,
          1, // credits used for this query
          Math.max(user.myraRemainingCredits - 1, 0)
        );
      }

      if (messages.length < 2) {
        await query.invalidateQueries({
          queryKey: ["conversations"],
        });
      }
    } catch (error: unknown) {
      console.log("Failed to send message:", error);
      if (
        error instanceof Error &&
        error.message === "NO_CREDITS" &&
        deductCreditForThisUser
      ) {
        // Show login modal for anonymous users with no credits
        if (messages.length > 2) {
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        } else {
          setMessages([]);
        }
      } else {
        console.log("Failed to send message:", error);
        toast.error("Failed to send message");
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      }
    }
  };

  const toggleMobileMenu = () => {
    setConvSidebarOpen((prev: boolean) => !prev);
  };

  // Main chat UI
  return (
    <div className="flex flex-col overflow-hidden h-max">
      {/* Chat interface fills remaining height */}
      <main className="flex-1 overflow-hidden">
        <div className="min-[1300px]:hidden bg-white w-full border-y border-gray-200 fixed top-16 left-0 right-0 z-20 flex justify-between items-center p-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {convSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>

          {deductCreditForThisUser ? (
            <button
              className="flex cursor-auto! items-center gap-1 rounded-md bg-[#dde3ea] px-4 py-2 hover:bg-[#ced3da]"
              title={`${Math.max(credits, 0)} credits remaining`}
              aria-label={`${Math.max(credits, 0)} credits remaining`}
              type="button"
              disabled={isLoading || authLoading}
            >
              <img
                alt="Credit Icon"
                loading="eager"
                width="16"
                height="16"
                decoding="async"
                data-nimg="1"
                className="size-3 text-primary md:size-4"
                src={creditImg}
              />
              <span>{Math.max(credits, 0)} credits</span>
            </button>
          ) : null}
        </div>
        <ChatInterface
          conversationId={conversationId}
          isLoading={isLoading}
          isStreaming={isStreaming}
          messages={messages}
          onSendMessage={handleSendMessage}
          onStopStream={stopStream}
          setMessages={setMessages}
          convSidebarOpen={convSidebarOpen}
          setConvSidebarOpen={setConvSidebarOpen}
        />
      </main>
    </div>
  );
}
