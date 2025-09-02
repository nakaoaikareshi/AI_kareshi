import axios from 'axios';
import { Character, APIResponse, Message, User } from '@/types';

export const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export interface ChatRequest {
  message: string;
  character: Character;
  conversationHistory?: Message[];
  user?: User;
}

export interface ChatResponse {
  content: string;
  timestamp: string;
}

export const chatAPI = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post<APIResponse<ChatResponse>>('/chat', data);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to send message');
    }
    
    return response.data.data;
  },
};