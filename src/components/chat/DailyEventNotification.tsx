import React, { useState, useEffect, useCallback } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { DailyEvent } from '@/types';
import { generateDailyEvent, shouldTriggerEvent, generateEventMessage } from '@/utils/eventGenerator';
import { useEventStore } from '@/store/eventStore';

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
  const { 
    events, 
    lastEventTime, 
    eventEnabled, 
    eventFrequency,
    addEvent, 
    getRecentEvents 
  } = useEventStore();

  const checkForDailyEvent = useCallback(() => {
    if (!eventEnabled) return;
    
    // イベントをトリガーするか判定
    if (shouldTriggerEvent(lastEventTime)) {
      const recentEvents = getRecentEvents();
      const event = generateDailyEvent(character.occupation, recentEvents);
      
      if (event) {
        setPendingEvent(event);
        setShowNotification(true);
      }
    }
  }, [character.occupation, eventEnabled, lastEventTime, getRecentEvents]);

  useEffect(() => {
    // イベント頻度に応じた間隔でチェック
    const intervals = {
      low: 600000,   // 10分
      medium: 300000, // 5分
      high: 120000    // 2分
    };
    
    const checkInterval = intervals[eventFrequency];
    
    // 初回チェックは10秒後
    const initialTimer = setTimeout(() => {
      checkForDailyEvent();
    }, 10000);
    
    // その後は定期的にチェック
    const intervalTimer = setInterval(() => {
      checkForDailyEvent();
    }, checkInterval);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [checkForDailyEvent, eventFrequency]);

  const handleSendEvent = () => {
    if (pendingEvent) {
      const eventMessage = generateEventMessage(pendingEvent, character.nickname);
      onEventMessage(eventMessage);
      addEvent(pendingEvent); // イベントを履歴に追加
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