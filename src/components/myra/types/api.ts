import type { TConversation, TMessage } from "./models";

/* Auth API Types */
export type TSyncUserRequest = {
  email: string;
  name: string;
  uid: string;
  fingerprint?: string;
  profile_pic?: string | null;
};

export type TSyncUserResponse = {
  user: {
    _id: string;
    email: string;
    name: string;
    myraRemainingCredits: number;
    total_credits: number;
    company?: string;
    is_active: boolean;
    profile_pic?: string | null;
  };
  is_new_user: boolean;
};

/* Chat API Types */
export type TChatStreamRequest = { message: string; conversation_id?: string };

/* Conversation API Types */
export type TGetConversationsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type TGetMessagesParams = {
  conversation_id: string;
  page?: number;
  limit?: number;
};

export type TGetConversationsResponse = {
  data: {
    conversations: (TConversation & { message_count: number })[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};

export type TGetConversationResponse = {
  data: {
    messages: TMessage[];
    conversation: { id: string; title: string };
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};
