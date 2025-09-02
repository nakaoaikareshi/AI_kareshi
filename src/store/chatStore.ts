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
  loadConversation: (userId: string, characterId: string) => Promise<void>;
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

    // Save to database via API
    const state = get();
    if (state.currentConversation) {
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: state.currentConversation.id,
          message: newMessage,
        }),
      }).catch(console.error);
    }
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
    const state = get();
    
    // Update local state
    set((state) => ({
      messages: state.messages.map((msg) => ({
        ...msg,
        isRead: true,
      })),
    }));

    // Update database via API
    if (state.currentConversation) {
      fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: state.currentConversation.id,
        }),
      }).catch(console.error);
    }
  },

  clearChat: () => {
    set({ 
      messages: [],
      currentConversation: null,
    });
  },

  loadConversation: async (userId: string, characterId: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, characterId }),
      });

      const data = await response.json();
      
      if (data.success) {
        set({
          currentConversation: data.data,
          messages: data.data.messages,
        });
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  },
}));