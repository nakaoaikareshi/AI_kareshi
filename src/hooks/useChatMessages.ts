/**
 * チャットメッセージ管理用カスタムフック
 * メッセージの送受信と状態管理
 */

import { useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useCharacterStore } from '@/store/characterStore';
import { useUserStore } from '@/store/userStore';

export const useChatMessages = () => {
  const { messages, isLoading, addMessage, setLoading, markMessagesAsRead } = useChatStore();
  const { character } = useCharacterStore();
  const { user } = useUserStore();

  const sendMessage = useCallback(async (content: string) => {
    if (!character) return;

    // Add user message
    addMessage({
      senderId: 'user',
      content,
      type: 'text',
      isRead: true,
      isUser: true,
    });

    // Set loading state
    setLoading(true);

    try {
      // Send to OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          character,
          conversationHistory: messages,
          user: user || { id: 'guest', nickname: 'ユーザー' },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      // Add AI response
      addMessage({
        senderId: character.id,
        content: data.data.content,
        type: 'text',
        isRead: false, // AI messages start as unread
        isUser: false,
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        senderId: character.id,
        content: 'すみません、少し調子が悪いみたいです...😅 もう一度話しかけてもらえますか？',
        type: 'text',
        isRead: false,
        isUser: false,
      });
    } finally {
      setLoading(false);
    }
  }, [character, messages, addMessage, setLoading, user]);

  const handleGiftMessage = useCallback((giftMessage: string) => {
    if (!character) return;
    
    addMessage({
      senderId: 'user',
      content: giftMessage,
      type: 'text',
      isRead: true,
      isUser: true,
    });

    // AI response to gift
    setTimeout(() => {
      addMessage({
        senderId: character.id,
        content: 'わあ〜！ありがとう💕 すごく嬉しい！大切にするね😊',
        type: 'text',
        isRead: false,
        isUser: false,
      });
    }, 1000);
  }, [character, addMessage]);

  const handleEventMessage = useCallback((eventMessage: string) => {
    if (!character) return;
    
    // キャラクターからの日常イベントメッセージを追加
    addMessage({
      senderId: character.id,
      content: eventMessage,
      type: 'text',
      isRead: false,
      isUser: false,
    });
  }, [character, addMessage]);

  return {
    messages,
    isLoading,
    sendMessage,
    handleGiftMessage,
    handleEventMessage,
    markMessagesAsRead,
  };
};