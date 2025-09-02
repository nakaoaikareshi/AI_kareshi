import React from 'react';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.isUser;
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm mr-2 mt-1">
          💕
        </div>
      )}
      <div className="flex flex-col max-w-xs lg:max-w-md">
        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-green-500 text-white rounded-br-md ml-auto' 
            : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <div className={`text-xs mt-1 px-2 ${
          isUser ? 'text-right text-gray-500' : 'text-left text-gray-400'
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          {isUser && (
            <span className="ml-2">
              {message.isRead ? '既読' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};