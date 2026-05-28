export type MessageSender = "me" | "peer";

export type ChatMessage = {
  id: string;
  sender: MessageSender;
  text: string;
  createdAt: string;
};

/** Origen de la conversación: consulta (chat) o compra confirmada (sale). */
export type ConversationType = "chat" | "sale";

export type Conversation = {
  id: string;
  peerId: string;
  peerName: string;
  peerEmail: string | null;
  peerInitials: string;
  peerIsVerified: boolean;
  productId: string;
  productLabel: string;
  conversationType: ConversationType;
  lastMessage: string;
  lastMessageAt: string;
  messages: ChatMessage[];
};
