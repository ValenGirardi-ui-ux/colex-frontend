import type { Conversation } from "@/src/types/messages";

/**
 * Inbox de ejemplo. Se clona en el cliente para permitir agregar mensajes.
 */
export const initialMockConversations: Conversation[] = [
  {
    id: "conv-1",
    peerName: "Valentina R.",
    peerInitials: "VR",
    productId: "h-201",
    productLabel: "Uniforme completo verano, talle 12",
    lastMessage: "¿Podés entregar en Palermo un sábado a la mañana?",
    lastMessageAt: "2025-04-25T18:20:00.000Z",
    messages: [
      {
        id: "m-1a",
        sender: "me",
        text: "Hola, ¿el uniforme sigue disponible?",
        createdAt: "2025-04-25T17:00:00.000Z",
      },
      {
        id: "m-1b",
        sender: "seller",
        text: "Hola! Sí, está publicado. Cualquier duda con medidas, avisame.",
        createdAt: "2025-04-25T17:05:00.000Z",
      },
      {
        id: "m-1c",
        sender: "me",
        text: "¿Podés entregar en Palermo un sábado a la mañana?",
        createdAt: "2025-04-25T18:20:00.000Z",
      },
    ],
  },
  {
    id: "conv-2",
    peerName: "Librería Pilar",
    peerInitials: "LP",
    productId: "p-1002",
    productLabel: "Libro Matemática Polimodal — 2do año",
    lastMessage: "Perfecto, te reservo el ejemplar. ¿Lo pasás a buscar?",
    lastMessageAt: "2025-04-24T11:00:00.000Z",
    messages: [
      {
        id: "m-2a",
        sender: "seller",
        text: "Tenemos stock, sin anotar en el lomo.",
        createdAt: "2025-04-24T10:30:00.000Z",
      },
      {
        id: "m-2b",
        sender: "me",
        text: "Perfecto, te reservo el ejemplar. ¿Lo pasás a buscar?",
        createdAt: "2025-04-24T11:00:00.000Z",
      },
    ],
  },
  {
    id: "conv-3",
    peerName: "Matías H.",
    peerInitials: "MH",
    productId: "h-203",
    productLabel: "Mochila con ruedas, 40 L",
    lastMessage: "Dale, coordinamos en Zona Oeste. Saludos.",
    lastMessageAt: "2025-04-20T08:00:00.000Z",
    messages: [
      {
        id: "m-3a",
        sender: "me",
        text: "Hola! ¿Aceptás mercado pago a coordinar con retiro en persona?",
        createdAt: "2025-04-19T16:00:00.000Z",
      },
      {
        id: "m-3b",
        sender: "seller",
        text: "Dale, coordinamos en Zona Oeste. Saludos.",
        createdAt: "2025-04-20T08:00:00.000Z",
      },
    ],
  },
];
