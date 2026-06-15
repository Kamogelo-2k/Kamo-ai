export type Role = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;
}
