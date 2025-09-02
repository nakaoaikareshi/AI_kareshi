import React, { useState, useEffect, useCallback } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { DailyEvent } from '@/types';
import { DailyEventGenerator } from '@/utils/dailyEvents';

interface DailyEventNotificationProps {
  character: {
    id: string;
    nickname: string;
    occupation: string;
  };
  onEventMessage: (message: string) => void;
}

export const DailyEventNotification: React.FC<DailyEventNotificationProps> = ({ 
  character, 
  onEventMessage 
}) => {
  const [pendingEvent, setPendingEvent] = useState<DailyEvent | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const checkForDailyEvent = useCallback(() => {
    const event = DailyEventGenerator.generateDailyEvent(character.occupation);
    
    if (event && DailyEventGenerator.shouldShareEvent()) {
      setPendingEvent(event);
      setShowNotification(true);
    }
  }, [character.occupation]);

  useEffect(() => {
    // 10秒後にランダムで日常イベントをチェック
    const timer = setTimeout(() => {
      checkForDailyEvent();
    }, 10000);

    return () => clearTimeout(timer);
  }, [checkForDailyEvent]);

  const handleSendEvent = () => {
    if (pendingEvent) {
      const eventMessage = DailyEventGenerator.createEventMessage(pendingEvent, character.nickname);
      onEventMessage(eventMessage);
      setShowNotification(false);
      setPendingEvent(null);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    setPendingEvent(null);
  };

  if (!showNotification || !pendingEvent) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-slide-down">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm">
              💕
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-sm">{character.nickname}</div>
              <div className="text-xs text-gray-500">今日の出来事を話したそうです</div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X size={16} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="text-sm text-gray-700 leading-relaxed">
            {pendingEvent.description}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            後で
          </button>
          <button
            onClick={handleSendEvent}
            className="flex-1 px-3 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
          >
            <MessageCircle size={14} />
            <span>聞く</span>
          </button>
        </div>
      </div>
    </div>
  );
};