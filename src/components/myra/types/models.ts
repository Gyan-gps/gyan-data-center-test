import type {
  TConversationSource,
  TMessagePart,
  TQueryType,
  TRole,
} from "./common";

/* User Types */
export type TUser = {
  _id: string;
  email: string;
  name: string;
  total_credits: number;
  myraRemainingCredits: number;
  last_login_at: Date | null;
  company?: string;
  is_active: boolean;
  relationship_manager?: string;
  createdAt: Date;
  updatedAt: Date;
};

/* Conversation Types */
export type TConversation = {
  _id: string;
  conversation_id: string;
  title: string;
  user_id: string;
  conversation_source: TConversationSource;
  created_at: Date;
  updated_at: Date;
  createdAt?: Date;
  updatedAt?: Date;
  message_count?: number;
};

/* Message Types */
export type TMessage = {
  _id: string;
  id: string;
  conv_id: string;
  blur_message: boolean;
  user_id: string;
  role: TRole;
  query_type: TQueryType;
  message_parts: TMessagePart[];
  createdAt: Date;
  updatedAt: Date;
  feedback?: "like" | "dislike" | null;
};
