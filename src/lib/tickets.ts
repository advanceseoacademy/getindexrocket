import type { SupportTicket, TicketMessage } from "@prisma/client";

export const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export const TICKET_PRIORITIES = ["low", "normal", "high"] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export function formatTicketRef(id: string) {
  return `#${id.slice(-6).toUpperCase()}`;
}

export function isTicketStatus(value: string): value is TicketStatus {
  return (TICKET_STATUSES as readonly string[]).includes(value);
}

export function isTicketPriority(value: string): value is TicketPriority {
  return (TICKET_PRIORITIES as readonly string[]).includes(value);
}

export function canUserReply(status: string) {
  return status === "open" || status === "in_progress" || status === "resolved";
}

export type SerializedMessage = {
  id: string;
  body: string;
  isStaff: boolean;
  authorId: string | null;
  createdAt: string;
};

export type SerializedTicket = {
  id: string;
  ref: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessageAt?: string | null;
  userEmail?: string;
  messages?: SerializedMessage[];
};

export function serializeMessage(msg: TicketMessage): SerializedMessage {
  return {
    id: msg.id,
    body: msg.body,
    isStaff: msg.isStaff,
    authorId: msg.authorId,
    createdAt: msg.createdAt.toISOString(),
  };
}

export function serializeTicket(
  ticket: SupportTicket & {
    messages?: TicketMessage[];
    _count?: { messages: number };
    user?: { email: string };
  },
  includeMessages = false,
): SerializedTicket {
  const messages = ticket.messages ?? [];
  const last = messages.length > 0 ? messages[messages.length - 1] : null;

  return {
    id: ticket.id,
    ref: formatTicketRef(ticket.id),
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    messageCount: ticket._count?.messages ?? messages.length,
    lastMessageAt: last?.createdAt.toISOString() ?? null,
    userEmail: ticket.user?.email,
    ...(includeMessages ? { messages: messages.map(serializeMessage) } : {}),
  };
}
