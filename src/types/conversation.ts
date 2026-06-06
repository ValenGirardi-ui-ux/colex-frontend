import type { ConversationType } from "@/src/types/messages";

export type DbConversation = {
  id: string;
  product_id: string;
  product_title: string;
  buyer_id: string;
  seller_id: string;
  conversation_type: ConversationType;
  created_at: string;
  updated_at: string;
};

export type DbMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  message_type: "text" | "image";
  created_at: string;
  read_at: string | null;
};
