/**
 * アクセシブルなチャット入力コンポーネント
 */

import React, { useState, useRef, useEffect, memo } from 'react';
import { Send, Mic, Paperclip, Smile } from 'lucide-react';
import { ScreenReaderOnly, LiveRegion } from '@/components/accessibility/ScreenReaderOnly';
import { useAnnounce } from '@/hooks/useAccessibility';

interface AccessibleChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const AccessibleChatInputComponent: React.FC<AccessibleChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'メッセージを入力...',
  maxLength = 1000,
}) => {
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { announcement, announce } = useAnnounce();

  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      announce('メッセージを送信しました');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingChars = maxLength - charCount;
  const isNearLimit = remainingChars < 50;

  return (
    <div className="border-t bg-white p-4">
      <LiveRegion>{announcement}</LiveRegion>
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        role="form"
        aria-label="メッセージ送信フォーム"
      >
        <div className="flex items-end space-x-2">
          {/* 添付ファイルボタン */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="ファイルを添付"
            disabled={disabled}
          >
            <Paperclip size={20} />
          </button>

          {/* メッセージ入力 */}
          <div className="flex-1 relative">
            <label htmlFor="message-input" className="sr-only">
              メッセージを入力
            </label>
            <input
              ref={inputRef}
              id="message-input"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              className="w-full px-4 py-2 pr-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              aria-describedby="char-count"
              aria-invalid={charCount > maxLength}
              autoComplete="off"
            />
            
            {/* 文字数カウンター */}
            <div
              id="char-count"
              className={`absolute right-2 top-2 text-xs ${
                isNearLimit ? 'text-orange-500' : 'text-gray-400'
              }`}
              aria-live={isNearLimit ? 'polite' : 'off'}
            >
              <ScreenReaderOnly>
                残り{remainingChars}文字入力可能
              </ScreenReaderOnly>
              <span aria-hidden="true">
                {charCount}/{maxLength}
              </span>
            </div>
          </div>

          {/* 絵文字ボタン */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="絵文字を選択"
            disabled={disabled}
          >
            <Smile size={20} />
          </button>

          {/* 音声入力ボタン */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="音声で入力"
            disabled={disabled}
          >
            <Mic size={20} />
          </button>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              message.trim() && !disabled
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="メッセージを送信"
          >
            <Send size={20} />
            <ScreenReaderOnly>
              {message.trim() ? '送信可能' : 'メッセージを入力してください'}
            </ScreenReaderOnly>
          </button>
        </div>

        {/* キーボードショートカットのヒント */}
        <div className="mt-2 text-xs text-gray-500" role="status">
          <ScreenReaderOnly>
            Enterキーで送信、Shift+Enterで改行
          </ScreenReaderOnly>
          <span aria-hidden="true">
            Enter: 送信 | Shift+Enter: 改行
          </span>
        </div>
      </form>
    </div>
  );
};

export const AccessibleChatInput = memo(AccessibleChatInputComponent);