import { create } from 'zustand';
import { Message, Conversation } from '@/types';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentConversation: Conversation | null;
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setConversation: (conversation: Conversation) => void;
  markMessagesAsRead: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  currentConversation: null,

  addMessage: (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...messageData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  setMessages: (messages: Message[]) => {
    set({ messages });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setConversation: (conversation: Conversation) => {
    set({ 
      currentConversation: conversation,
      messages: conversation.messages,
    });
  },

  markMessagesAsRead: () => {
    set((state) => ({
      messages: state.messages.map((msg) => ({
        ...msg,
        isRead: true,
      })),
    }));
  },

  clearChat: () => {
    set({ 
      messages: [],
      currentConversation: null,
    });
  },
}));