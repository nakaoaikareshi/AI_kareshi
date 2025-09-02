import React, { useState } from 'react';
import { Send, Smile, Mic } from 'lucide-react';
import { StickerPicker } from './StickerPicker';
import { VoiceRecorder } from './VoiceRecorder';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStickerSelect = (sticker: string) => {
    onSendMessage(sticker);
    setShowStickerPicker(false);
  };

  const handleVoiceMessage = (audioBlob: Blob) => {
    // ボイスメッセージの場合は文字として「🎤 ボイスメッセージ」を送信
    onSendMessage('🎤 ボイスメッセージ');
    setShowVoiceRecorder(false);
  };

  return (
    <div className="border-t bg-white px-4 py-3 relative">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
            title="スタンプ"
          >
            <Smile size={20} />
          </button>
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            title="ボイスメッセージ"
          >
            <Mic size={20} />
          </button>
        </div>
        <div className="flex-1 relative">
          <div className="bg-gray-100 rounded-2xl border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージ"
              disabled={disabled}
              className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none disabled:opacity-50 text-sm"
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
              }}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full p-3 transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
        >
          <Send size={18} />
        </button>
      </form>
      
      <StickerPicker
        isOpen={showStickerPicker}
        onClose={() => setShowStickerPicker(false)}
        onStickerSelect={handleStickerSelect}
      />
      
      <VoiceRecorder
        isOpen={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onVoiceMessage={handleVoiceMessage}
      />
    </div>
  );
};