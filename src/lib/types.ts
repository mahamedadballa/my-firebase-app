export type User = {
  id: string; // This will be the uid
  uid: string;
  firstName: string;
  lastName: string;
  name: string; // Combination of first and last
  phone?: string;
  email?: string;
  avatar: string;
  status: 'online' | 'offline';
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number; // Use number for Firebase compatibility
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image';
};

export type Chat = {
  id: string;
  participants: User[];
  participantIds: Record<string, boolean>;
  messages: Message[];
  unreadCount?: number;
  lastMessage?: Message;
};
