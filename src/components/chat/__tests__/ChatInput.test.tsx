import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  test('メッセージ入力が正しく動作する', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);
    
    const input = screen.getByPlaceholderText('メッセージを入力...');
    await user.type(input, 'テストメッセージ');
    
    expect(input).toHaveValue('テストメッセージ');
  });

  test('送信ボタンでメッセージが送信される', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);
    
    const input = screen.getByPlaceholderText('メッセージを入力...');
    const sendButton = screen.getByRole('button');
    
    await user.type(input, 'テストメッセージ');
    await user.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('テストメッセージ');
    expect(input).toHaveValue('');
  });

  test('Enterキーでメッセージが送信される', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);
    
    const input = screen.getByPlaceholderText('メッセージを入力...');
    
    await user.type(input, 'テストメッセージ{enter}');
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('テストメッセージ');
    expect(input).toHaveValue('');
  });

  test('空メッセージは送信されない', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={false} />);
    
    const sendButton = screen.getByRole('button');
    await user.click(sendButton);
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  test('無効状態では送信できない', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />);
    
    const input = screen.getByPlaceholderText('メッセージを入力...');
    const sendButton = screen.getByRole('button');
    
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });
});