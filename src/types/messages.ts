export type MessageSender = "me" | "seller";

export type ChatMessage = {
  id: string;
  sender: MessageSender;
  text: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  peerName: string;
  peerInitials: string;
  productId: string;
  productLabel: string;
  lastMessage: string;
  lastMessageAt: string;
  messages: ChatMessage[];
};
