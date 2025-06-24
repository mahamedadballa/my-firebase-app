export type User = {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image';
};

export type Chat = {
  id: string;
  participants: User[];
  messages: Message[];
  unreadCount?: number;
};
