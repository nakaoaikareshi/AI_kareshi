import React, { useState } from 'react';
import { Send, Smile, Mic } from 'lucide-react';
import { StickerPicker } from './StickerPicker';
import { VoiceRecorder } from './VoiceRecorder';
import { SpeechToTextButton } from './SpeechToTextButton';

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
    onSendMessage('🎤 ボイスメッセージ');
    setShowVoiceRecorder(false);
  };

  const handleSpeechToText = (transcript: string) => {
    setMessage(transcript);
  };

  return (
    <div className="border-t bg-white px-3 sm:px-4 py-3 relative chat-input safe-area-bottom">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-3">
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
            title="スタンプ"
          >
            <Smile size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            title="ボイスメッセージ"
          >
            <Mic size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="flex-1 relative min-w-0">
          <div className="bg-gray-100 rounded-2xl border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
            <div className="flex items-end">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージ"
                disabled={disabled}
                className="flex-1 px-3 sm:px-4 py-3 bg-transparent resize-none focus:outline-none disabled:opacity-50 text-sm min-w-0"
                rows={1}
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                }}
              />
              <div className="pb-3 pr-2 sm:pr-3 flex-shrink-0">
                <SpeechToTextButton 
                  onTranscript={handleSpeechToText}
                  className="!p-1.5"
                />
              </div>
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full p-2.5 sm:p-3 transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex-shrink-0"
        >
          <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
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