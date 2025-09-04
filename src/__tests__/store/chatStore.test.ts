/**
 * chatStoreのテスト
 */

import { renderHook, act } from '@testing-library/react';
import { useChatStore } from '@/store/chatStore';
import { Message } from '@/types';

describe('chatStore', () => {
  beforeEach(() => {
    // ストアをリセット
    useChatStore.setState({
      messages: [],
      isLoading: false,
    });
  });

  it('初期状態が正しい', () => {
    const { result } = renderHook(() => useChatStore());
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('addMessageでメッセージを追加できる', () => {
    const { result } = renderHook(() => useChatStore());
    
    const newMessage: Omit<Message, 'id' | 'timestamp'> = {
      senderId: 'user1',
      content: 'こんにちは',
      type: 'text',
      isRead: false,
      isUser: true,
    };
    
    act(() => {
      result.current.addMessage(newMessage);
    });
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('こんにちは');
    expect(result.current.messages[0].senderId).toBe('user1');
    expect(result.current.messages[0].id).toBeDefined();
    expect(result.current.messages[0].timestamp).toBeDefined();
  });

  it('複数のメッセージを追加できる', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.addMessage({
        senderId: 'user1',
        content: 'メッセージ1',
        type: 'text',
        isRead: false,
        isUser: true,
      });
      
      result.current.addMessage({
        senderId: 'ai',
        content: 'メッセージ2',
        type: 'text',
        isRead: false,
        isUser: false,
      });
    });
    
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].content).toBe('メッセージ1');
    expect(result.current.messages[1].content).toBe('メッセージ2');
  });

  it('setMessagesで全メッセージを置き換えできる', () => {
    const { result } = renderHook(() => useChatStore());
    
    const messages: Message[] = [
      {
        id: '1',
        senderId: 'user1',
        content: '新しいメッセージ1',
        type: 'text',
        timestamp: new Date(),
        isRead: true,
        isUser: true,
      },
      {
        id: '2',
        senderId: 'ai',
        content: '新しいメッセージ2',
        type: 'text',
        timestamp: new Date(),
        isRead: false,
        isUser: false,
      },
    ];
    
    act(() => {
      result.current.setMessages(messages);
    });
    
    expect(result.current.messages).toEqual(messages);
  });

  it('clearMessagesですべてのメッセージをクリアできる', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.addMessage({
        senderId: 'user1',
        content: 'メッセージ',
        type: 'text',
        isRead: false,
        isUser: true,
      });
    });
    
    expect(result.current.messages).toHaveLength(1);
    
    act(() => {
      result.current.clearMessages();
    });
    
    expect(result.current.messages).toEqual([]);
  });

  it('markMessagesAsReadで未読メッセージを既読にできる', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.addMessage({
        senderId: 'ai',
        content: '未読メッセージ1',
        type: 'text',
        isRead: false,
        isUser: false,
      });
      
      result.current.addMessage({
        senderId: 'ai',
        content: '未読メッセージ2',
        type: 'text',
        isRead: false,
        isUser: false,
      });
    });
    
    expect(result.current.messages[0].isRead).toBe(false);
    expect(result.current.messages[1].isRead).toBe(false);
    
    act(() => {
      result.current.markMessagesAsRead();
    });
    
    expect(result.current.messages[0].isRead).toBe(true);
    expect(result.current.messages[1].isRead).toBe(true);
  });

  it('setLoadingでローディング状態を設定できる', () => {
    const { result } = renderHook(() => useChatStore());
    
    expect(result.current.isLoading).toBe(false);
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('getUnreadCountで未読メッセージ数を取得できる', () => {
    const { result } = renderHook(() => useChatStore());
    
    act(() => {
      result.current.addMessage({
        senderId: 'ai',
        content: '未読1',
        type: 'text',
        isRead: false,
        isUser: false,
      });
      
      result.current.addMessage({
        senderId: 'ai',
        content: '未読2',
        type: 'text',
        isRead: false,
        isUser: false,
      });
      
      result.current.addMessage({
        senderId: 'user',
        content: '既読',
        type: 'text',
        isRead: true,
        isUser: true,
      });
    });
    
    expect(result.current.getUnreadCount()).toBe(2);
  });
});