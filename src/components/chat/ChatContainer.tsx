import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Settings, ShoppingBag, Heart, Gift, Video, Image } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useCharacterStore } from '@/store/characterStore';
import { useUserStore } from '@/store/userStore';
import { MoodState } from '@/types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { StoreModal } from '@/components/store/StoreModal';
import { DateModal } from '@/components/date/DateModal';
import { GiftModal } from '@/components/gift/GiftModal';
import { MemoryAlbum } from '@/components/memories/MemoryAlbum';
import { ScheduleModal } from '@/components/schedule/ScheduleModal';
import { MoodIndicator } from './MoodIndicator';
import { DailyEventNotification } from './DailyEventNotification';
import { VRMAvatar } from '@/components/avatar/VRMAvatar';
import { VideoCallModal } from '@/components/video/VideoCallModal';
import { BackgroundModal } from '@/components/background/BackgroundModal';
import { speechSynthesis } from '@/utils/speechSynthesis';

export const ChatContainer: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, addMessage, setLoading, markMessagesAsRead } = useChatStore();
  const { character } = useCharacterStore();
  const { user } = useUserStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [moodState, setMoodState] = useState<MoodState | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<'happy' | 'sad' | 'surprised' | 'angry' | 'love' | 'normal'>('normal');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 音声合成の状態監視
  useEffect(() => {
    const checkSpeakingStatus = () => {
      setIsSpeaking(speechSynthesis.isSpeaking());
    };

    const interval = setInterval(checkSpeakingStatus, 100);
    return () => clearInterval(interval);
  }, []);

  // メッセージ内容に基づく感情分析
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && !lastMessage.isUser) {
      const content = lastMessage.content.toLowerCase();
      
      if (content.includes('嬉しい') || content.includes('やったー') || content.includes('最高')) {
        setCurrentEmotion('happy');
      } else if (content.includes('好き') || content.includes('愛してる') || content.includes('💕')) {
        setCurrentEmotion('love');
      } else if (content.includes('悲しい') || content.includes('つらい') || content.includes('😢')) {
        setCurrentEmotion('sad');
      } else if (content.includes('えっ') || content.includes('本当') || content.includes('驚')) {
        setCurrentEmotion('surprised');
      } else if (content.includes('怒') || content.includes('むかつく') || content.includes('💢')) {
        setCurrentEmotion('angry');
      } else {
        setCurrentEmotion('normal');
      }
      
      // 3秒後に通常の表情に戻る
      setTimeout(() => setCurrentEmotion('normal'), 3000);
    }
  }, [messages]);

  const fetchMoodState = useCallback(async () => {
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
  }, [character]);

  // Load conversation when component mounts
  useEffect(() => {
    if (character) {
      fetchMoodState();
    }
  }, [character, fetchMoodState]);

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
    if (!character) return;

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
          user: user || { id: 'guest', nickname: 'ユーザー' },
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
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 chat-container">
      {/* Character Display - Left side on PC */}
      <div className="hidden lg:flex lg:w-1/3 xl:w-2/5 bg-gradient-to-br from-purple-50 to-pink-50 items-center justify-center p-8">
        <div className="text-center">
          {/* Character Avatar - VRMを優先表示 */}
          <VRMAvatar 
            avatar={character.avatar || { 
              vrmUrl: '/models/vrm/character.vrm',
              hairStyle: 'medium',
              hairColor: '#8B4513',
              eyeColor: '#4169E1',
              eyeShape: 'round',
              eyebrowStyle: 'straight',
              noseStyle: 'normal',
              mouthStyle: 'normal',
              skinTone: '#FFE0BD',
              faceShape: 'oval',
              bodyType: 'normal',
              height: 'medium',
              outfit: 'casual',
              topWear: 'shirt',
              bottomWear: 'pants',
              shoes: 'sneakers',
              accessories: [],
              jewelry: [],
              makeup: []
            }} 
            size="large" 
            mood={moodState?.currentMood || 50}
            isSpeaking={isSpeaking}
            isBlinking={true}
            emotionState={currentEmotion}
          />
          
          {/* Character Info */}
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-gray-800">{character.nickname}</h2>
            <p className="text-gray-600 mt-2">{character.occupation || '秘密'}</p>
            
            {/* Mood Display */}
            {moodState && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
                <span className="text-sm text-gray-600">気分:</span>
                <span className="ml-2 text-sm font-medium">
                  {moodState.currentMood >= 80 ? '😊 とても良い' :
                   moodState.currentMood >= 60 ? '🙂 良い' :
                   moodState.currentMood >= 40 ? '😐 普通' :
                   moodState.currentMood >= 20 ? '😔 少し落ち込み' : '😢 落ち込んでいる'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container - Right side on PC, Full on mobile */}
      <div className="flex flex-col flex-1 h-full">
        {/* Header */}
        <div className="bg-white border-b px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          {/* Mobile only avatar - VRMを優先表示 */}
          <div className="lg:hidden">
            <VRMAvatar 
              avatar={character.avatar || { 
                vrmUrl: '/models/vrm/character.vrm',
                hairStyle: 'medium',
                hairColor: '#8B4513',
                eyeColor: '#4169E1',
                eyeShape: 'round',
                eyebrowStyle: 'straight',
                noseStyle: 'normal',
                mouthStyle: 'normal',
                skinTone: '#FFE0BD',
                faceShape: 'oval',
                bodyType: 'normal',
                height: 'medium',
                outfit: 'casual',
                topWear: 'shirt',
                bottomWear: 'pants',
                shoes: 'sneakers',
                accessories: [],
                jewelry: [],
                makeup: []
              }} 
              size="small" 
              mood={moodState?.currentMood || 50}
              isSpeaking={isSpeaking}
              isBlinking={true}
              emotionState={currentEmotion}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-gray-900 text-base sm:text-lg truncate">{character.nickname}</h1>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs sm:text-sm text-green-600 font-medium">オンライン</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
          <button
            onClick={() => setShowBackground(true)}
            className="p-1.5 sm:p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
            title="背景"
          >
            <Image size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setShowVideoCall(true)}
            className="p-1.5 sm:p-2 text-purple-500 hover:bg-purple-50 rounded-full transition-colors"
            title="ビデオ通話"
          >
            <Video size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setShowSchedule(true)}
            className="p-1.5 sm:p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
            title="スケジュール"
          >
            <span className="text-sm sm:text-base">📅</span>
          </button>
          <button
            onClick={() => setShowMemories(true)}
            className="p-1.5 sm:p-2 text-purple-500 hover:bg-purple-50 rounded-full transition-colors"
            title="思い出"
          >
            <span className="text-sm sm:text-base">📸</span>
          </button>
          <button
            onClick={() => setShowGift(true)}
            className="p-1.5 sm:p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
            title="プレゼント"
          >
            <Gift size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setShowDate(true)}
            className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="デート"
          >
            <Heart size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setShowStore(true)}
            className="p-1.5 sm:p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            title="ショップ"
          >
            <ShoppingBag size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 sm:p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
            title="設定"
          >
            <Settings size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-b from-gray-50 to-gray-100">
          {/* 気分状態表示 - Mobile only */}
          {moodState && (
            <div className="lg:hidden">
              <MoodIndicator moodState={moodState} characterName={character.nickname} />
            </div>
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
      </div>

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
      <VideoCallModal
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        onSendMessage={handleSendMessage}
      />
      <BackgroundModal
        isOpen={showBackground}
        onClose={() => setShowBackground(false)}
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