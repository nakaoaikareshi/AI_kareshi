import React from 'react';
import { Message } from '@/types';
import { AnimeAvatar } from '@/components/avatar/AnimeAvatar';
import { useCharacterStore } from '@/store/characterStore';
import { SpeechButton } from './SpeechButton';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.isUser;
  const { character } = useCharacterStore();
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-2 mt-1">
          {character?.avatar ? (
            <AnimeAvatar 
              avatar={character.avatar} 
              size="small"
              mood={50}
              isSpeaking={false}
              isBlinking={true}
              emotionState="normal"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              <span className="text-base">👤</span>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col max-w-[280px] sm:max-w-xs lg:max-w-md">
        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-green-500 text-white rounded-br-md ml-auto' 
            : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <div className={`flex items-center mt-1 px-2 ${
          isUser ? 'justify-end' : 'justify-between'
        }`}>
          <div className={`text-xs ${
            isUser ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <span>{formatTime(message.timestamp)}</span>
            {isUser && (
              <span className="ml-2">
                {message.isRead ? '既読' : ''}
              </span>
            )}
          </div>
          
          {!isUser && (
            <SpeechButton text={message.content} />
          )}
        </div>
      </div>
    </div>
  );
};