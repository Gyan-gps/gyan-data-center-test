import type { TMessagePart } from "./common";
import type { TConversation, TMessage } from "./models";

/* Common Component Props */
export type TClassName = { className?: string };

/* Auth Components */
export type TLoginModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

/* Chat Components */
export type TChatInterfaceProps = { conversationId?: string } & TClassName;

export type TMessageListProps = {
  messages: TMessage[];
  isLoading?: boolean;
  isStreaming?: boolean;
} & TClassName;

export type TMessageInputProps = {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  isStreaming: boolean; // Whether AI is currently streaming response
  onStopStream: () => void; // Callback to stop streaming
} & TClassName;

export type TChatHistoryProps = {
  conversations: TConversation[];
  selectedId?: string;
  onSelect: (conversation: TConversation) => void;
  isLoading?: boolean;
} & TClassName;

export type TStreamingMessageProps = {
  role: "user" | "agent";
  parts: TMessagePart[];
  isStreaming?: boolean;
} & TClassName;

/* Shared Components */
export type TMarkdownRendererProps = { content: string } & TClassName;

export type TGraphRendererProps = {
  data: any;
  type?: "line" | "bar" | "pie";
} & TClassName;

export type TFollowupQuestionsProps = {
  questions: string[];
  onSelect: (question: string) => void;
} & TClassName;

export type THeaderProps = {
  showUser?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  onPurchaseCredits?: () => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarOpened?: string[];
  showMenuIcon?: boolean;
} & TClassName;
