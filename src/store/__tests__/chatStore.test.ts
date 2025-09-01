import { useChatStore } from '../chatStore';

describe('chatStore', () => {
  beforeEach(() => {
    useChatStore.getState().clearChat();
  });

  test('初期状態が正しい', () => {
    const state = useChatStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  test('メッセージ追加が正しく動作する', () => {
    const message = {
      senderId: 'user',
      content: 'テストメッセージ',
      type: 'text' as const,
      isRead: true,
      isUser: true,
    };

    useChatStore.getState().addMessage(message);
    
    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0]).toMatchObject(message);
    expect(state.messages[0].id).toBeDefined();
    expect(state.messages[0].timestamp).toBeInstanceOf(Date);
  });

  test('ローディング状態の変更が正しく動作する', () => {
    useChatStore.getState().setLoading(true);
    expect(useChatStore.getState().isLoading).toBe(true);
    
    useChatStore.getState().setLoading(false);
    expect(useChatStore.getState().isLoading).toBe(false);
  });

  test('メッセージクリアが正しく動作する', () => {
    const message = {
      senderId: 'user',
      content: 'テストメッセージ',
      type: 'text' as const,
      isRead: true,
      isUser: true,
    };

    useChatStore.getState().addMessage(message);
    expect(useChatStore.getState().messages).toHaveLength(1);
    
    useChatStore.getState().clearChat();
    expect(useChatStore.getState().messages).toHaveLength(0);
  });

  test('複数メッセージの追加が正しく動作する', () => {
    const message1 = {
      senderId: 'user',
      content: 'メッセージ1',
      type: 'text' as const,
      isRead: true,
      isUser: true,
    };

    const message2 = {
      senderId: 'ai',
      content: 'メッセージ2',
      type: 'text' as const,
      isRead: true,
      isUser: false,
    };

    useChatStore.getState().addMessage(message1);
    useChatStore.getState().addMessage(message2);
    
    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(2);
    expect(state.messages[0].content).toBe('メッセージ1');
    expect(state.messages[1].content).toBe('メッセージ2');
  });
});