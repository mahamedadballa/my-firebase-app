import type { User, Chat, Message } from './types';

export const currentUser: User = {
  id: 'user-1',
  name: 'You',
  avatar: 'https://placehold.co/100x100.png',
  status: 'online',
};

const otherUsers: User[] = [
  { id: 'user-2', name: 'Alice', avatar: 'https://placehold.co/100x100.png', status: 'online' },
  { id: 'user-3', name: 'Bob', avatar: 'https://placehold.co/100x100.png', status: 'offline' },
  { id: 'user-4', name: 'Charlie', avatar: 'https://placehold.co/100x100.png', status: 'online' },
  { id: 'user-5', name: 'Diana', avatar: 'https://placehold.co/100x100.png', status: 'offline' },
];

export const initialUsers: User[] = [currentUser, ...otherUsers];

const generateMessages = (senderId: string, receiverId: string, count: number): Message[] => {
  const messages: Message[] = [];
  for (let i = 0; i < count; i++) {
    const isCurrentUser = i % 2 === 0;
    messages.push({
      id: `msg-${senderId}-${receiverId}-${i}`,
      senderId: isCurrentUser ? senderId : receiverId,
      text: `This is message number ${i + 1} in the conversation.`,
      timestamp: new Date(Date.now() - (count - i) * 60000 * 5),
      status: 'read',
      type: 'text',
    });
  }
  return messages;
};

export const initialChats: Chat[] = [
  {
    id: 'chat-1',
    participants: [currentUser, otherUsers[0]],
    messages: [
        ...generateMessages(currentUser.id, otherUsers[0].id, 3),
        { id: 'msg-1-4', senderId: otherUsers[0].id, text: 'Hey, how are you?', timestamp: new Date(Date.now() - 60000 * 2), status: 'read', type: 'text' },
        { id: 'msg-1-5', senderId: currentUser.id, text: 'I am good, thanks for asking! How about you? Planning anything for the weekend?', timestamp: new Date(Date.now() - 60000), status: 'read', type: 'text' },
    ],
    unreadCount: 0,
  },
  {
    id: 'chat-2',
    participants: [currentUser, otherUsers[1]],
    messages: [
      { id: 'msg-2-1', senderId: otherUsers[1].id, text: 'Can you send me the file?', timestamp: new Date(Date.now() - 60000 * 60 * 24), status: 'read', type: 'text' },
      { id: 'msg-2-2', senderId: currentUser.id, text: 'Sure, here it is.', timestamp: new Date(Date.now() - 60000 * 60 * 23), status: 'read', type: 'text' },
      { id: 'msg-2-3', senderId: currentUser.id, text: 'https://placehold.co/400x300.png', timestamp: new Date(Date.now() - 60000 * 60 * 23), status: 'read', type: 'image' },
    ],
    unreadCount: 1,
  },
  {
    id: 'chat-3',
    participants: [currentUser, otherUsers[2]],
    messages: [
      { id: 'msg-3-1', senderId: otherUsers[2].id, text: 'Let\'s catch up tomorrow.', timestamp: new Date(Date.now() - 60000 * 60 * 48), status: 'read', type: 'text' }
    ],
    unreadCount: 0,
  },
  {
    id: 'chat-4',
    participants: [currentUser, otherUsers[3]],
    messages: [
       { id: 'msg-4-1', senderId: currentUser.id, text: 'Dinner tonight?', timestamp: new Date(Date.now() - 60000 * 30), status: 'read', type: 'text' },
       { id: 'msg-4-2', senderId: otherUsers[3].id, text: 'Sounds great! What time?', timestamp: new Date(Date.now() - 60000 * 28), status: 'read', type: 'text' }
    ],
    unreadCount: 2,
  },
];
