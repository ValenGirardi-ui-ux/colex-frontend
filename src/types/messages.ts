export type MessageSender = "me" | "peer";

export type MessageType = "text" | "image";

export type ChatMessage = {
  id: string;
  sender: MessageSender;
  text: string;
  imageUrl: string | null;
  messageType: MessageType;
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
