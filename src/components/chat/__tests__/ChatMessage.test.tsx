import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';
import { Message } from '@/types';

const mockMessage: Message = {
  id: '1',
  senderId: 'user',
  content: 'こんにちは！',
  timestamp: new Date('2025-09-01T12:00:00Z'),
  type: 'text',
  isRead: true,
  isUser: true,
};

describe('ChatMessage', () => {
  test('ユーザーメッセージが正しく表示される', () => {
    render(<ChatMessage message={mockMessage} />);
    expect(screen.getByText('こんにちは！')).toBeInTheDocument();
    expect(screen.getByText('既読')).toBeInTheDocument();
  });

  test('AIメッセージが正しく表示される', () => {
    const aiMessage = { ...mockMessage, isUser: false, senderId: 'ai' };
    render(<ChatMessage message={aiMessage} />);
    expect(screen.getByText('こんにちは！')).toBeInTheDocument();
    expect(screen.queryByText('既読')).not.toBeInTheDocument();
  });

  test('時刻が正しく表示される', () => {
    render(<ChatMessage message={mockMessage} />);
    expect(screen.getByText('21:00')).toBeInTheDocument();
  });
});