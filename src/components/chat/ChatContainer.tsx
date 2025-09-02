import React, { useEffect, useRef, useState } from 'react';
import { Settings, ShoppingBag, Heart, Gift } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useCharacterStore } from '@/store/characterStore';
import { useUserStore } from '@/store/userStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { StoreModal } from '@/components/store/StoreModal';
import { DateModal } from '@/components/date/DateModal';
import { GiftModal } from '@/components/gift/GiftModal';
import { SimpleAvatar } from '@/components/avatar/SimpleAvatar';
import { MemoryAlbum } from '@/components/memories/MemoryAlbum';
import { ScheduleModal } from '@/components/schedule/ScheduleModal';
import { MoodIndicator } from './MoodIndicator';
import { MoodSystem } from '@/utils/moodSystem';
import { DailyEventNotification } from './DailyEventNotification';

export const ChatContainer: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, addMessage, setLoading, loadConversation, markMessagesAsRead } = useChatStore();
  const { character } = useCharacterStore();
  const { user } = useUserStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [moodState, setMoodState] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation when component mounts
  useEffect(() => {
    if (character && user) {
      loadConversation(user.id, character.id);
      fetchMoodState();
    }
  }, [character, user, loadConversation]);

  const fetchMoodState = async () => {
    if (!character) return;
    
    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ character }),
      });
      
      const data = await response.json();
      if (data.success) {
        setMoodState(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch mood state:', error);
    }
  };

  // Mark messages as read when user views them
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 1000); // Mark as read after 1 second of viewing
      
      return () => clearTimeout(timer);
    }
  }, [messages, markMessagesAsRead]);

  const handleSendMessage = async (content: string) => {
    if (!character || !user) return;

    // Add user message
    addMessage({
      senderId: 'user',
      content,
      type: 'text',
      isRead: true,
      isUser: true,
    });

    // Set loading state
    setLoading(true);

    try {
      // Send to OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          character,
          conversationHistory: messages,
          user,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      // Add AI response
      addMessage({
        senderId: character.id,
        content: data.data.content,
        type: 'text',
        isRead: false, // AI messages start as unread
        isUser: false,
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        senderId: character.id,
        content: 'すみません、少し調子が悪いみたいです...😅 もう一度話しかけてもらえますか？',
        type: 'text',
        isRead: false,
        isUser: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGiftSent = (giftMessage: string) => {
    addMessage({
      senderId: 'user',
      content: giftMessage,
      type: 'text',
      isRead: true,
      isUser: true,
    });

    // AI response to gift
    setTimeout(() => {
      addMessage({
        senderId: character!.id,
        content: 'わあ〜！ありがとう💕 すごく嬉しい！大切にするね😊',
        type: 'text',
        isRead: false,
        isUser: false,
      });
    }, 1000);
  };

  const handleEventMessage = (eventMessage: string) => {
    // キャラクターからの日常イベントメッセージを追加
    addMessage({
      senderId: character!.id,
      content: eventMessage,
      type: 'text',
      isRead: false,
      isUser: false,
    });
  };

  if (!character) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            まずはキャラクターを設定してください
          </h2>
          <p className="text-gray-500">
            性格や基本情報を決めて、あなたのAI恋人を作りましょう
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
            💕
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">{character.nickname}</h1>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-600 font-medium">オンライン</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowSchedule(true)}
            className="p-2 text-green-500 hover:bg-green-50 rounded-full"
            title="スケジュール"
          >
            📅
          </button>
          <button
            onClick={() => setShowMemories(true)}
            className="p-2 text-purple-500 hover:bg-purple-50 rounded-full"
            title="思い出"
          >
            📸
          </button>
          <button
            onClick={() => setShowGift(true)}
            className="p-2 text-pink-500 hover:bg-pink-50 rounded-full"
            title="プレゼント"
          >
            <Gift size={20} />
          </button>
          <button
            onClick={() => setShowDate(true)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            title="デート"
          >
            <Heart size={20} />
          </button>
          <button
            onClick={() => setShowStore(true)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
            title="ショップ"
          >
            <ShoppingBag size={20} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-full"
            title="設定"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-gray-50 to-gray-100">
        {/* 気分状態表示 */}
        {moodState && (
          <MoodIndicator moodState={moodState} characterName={character.nickname} />
        )}
        
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>{character.nickname}との会話を始めましょう！</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={isLoading} 
      />

      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <StoreModal isOpen={showStore} onClose={() => setShowStore(false)} character={character} />
      <DateModal 
        isOpen={showDate} 
        onClose={() => setShowDate(false)} 
        characterName={character.nickname}
      />
      <GiftModal 
        isOpen={showGift} 
        onClose={() => setShowGift(false)} 
        characterName={character.nickname}
        onGiftSent={handleGiftSent}
      />
      <MemoryAlbum
        isOpen={showMemories}
        onClose={() => setShowMemories(false)}
        characterName={character.nickname}
      />
      <ScheduleModal
        isOpen={showSchedule}
        onClose={() => setShowSchedule(false)}
        characterName={character.nickname}
      />

      {/* 日常イベント通知 */}
      <DailyEventNotification 
        character={{
          id: character.id,
          nickname: character.nickname,
          occupation: character.occupation,
        }}
        onEventMessage={handleEventMessage}
      />
    </div>
  );
};