import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-200 rounded-2xl rounded-bl-none px-4 py-2 max-w-xs">
        <div className="flex items-center space-x-1">
          <div className="typing-dot animate-bounce"></div>
          <div className="typing-dot animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="typing-dot animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <style jsx>{`
          .typing-dot {
            width: 4px;
            height: 4px;
            background-color: #9ca3af;
            border-radius: 50%;
            animation-duration: 1s;
            animation-iteration-count: infinite;
          }
        `}</style>
      </div>
    </div>
  );
};