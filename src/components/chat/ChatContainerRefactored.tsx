/**
 * リファクタリングされたチャットコンテナコンポーネント
 * 各機能をカスタムフックとコンポーネントに分割して管理
 */

import React, { useEffect, useRef, useMemo, memo } from 'react';
import { useCharacterStore } from '@/store/characterStore';

// Custom Hooks
import { useModalManager } from '@/hooks/useModalManager';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useEmotionAnalysis } from '@/hooks/useEmotionAnalysis';
import { useMoodState } from '@/hooks/useMoodState';

// Components
import { ChatHeader } from './ChatHeader';
import { CharacterAvatarDisplay } from './CharacterAvatarDisplay';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { MoodIndicator } from './MoodIndicator';
import { DailyEventNotification } from './DailyEventNotification';

// Modals
import { SettingsModal } from '@/components/settings/SettingsModal';
import { StoreModal } from '@/components/store/StoreModal';
import { DateModal } from '@/components/date/DateModal';
import { GiftModal } from '@/components/gift/GiftModal';
import { MemoryAlbum } from '@/components/memories/MemoryAlbum';
import { ScheduleModal } from '@/components/schedule/ScheduleModal';
import { VideoCallModal } from '@/components/video/VideoCallModal';
import { BackgroundModal } from '@/components/background/BackgroundModal';

const ChatContainerRefactoredComponent: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { character } = useCharacterStore();

  // カスタムフックで機能を分離
  const { modals, openModal, closeModal } = useModalManager();
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    handleGiftMessage, 
    handleEventMessage,
    markMessagesAsRead 
  } = useChatMessages();
  const { currentEmotion, emotionIntensity, isSpeaking } = useEmotionAnalysis({ messages });
  const { moodState } = useMoodState({ character });

  // スクロール制御
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // メッセージの既読処理
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages, markMessagesAsRead]);

  // メッセージのレンダリングをメモ化
  const renderedMessages = useMemo(() => (
    messages.map((message) => (
      <ChatMessage key={message.id} message={message} />
    ))
  ), [messages]);

  // キャラクター未設定時の表示
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
      {/* PC版 左側アバター表示 */}
      <CharacterAvatarDisplay
        character={character}
        moodState={moodState}
        isSpeaking={isSpeaking}
        currentEmotion={currentEmotion}
        emotionIntensity={emotionIntensity}
      />

      {/* チャットエリア */}
      <div className="flex flex-col flex-1 h-full">
        {/* ヘッダー */}
        <ChatHeader
          character={character}
          moodState={moodState}
          isSpeaking={isSpeaking}
          currentEmotion={currentEmotion}
          emotionIntensity={emotionIntensity}
          onOpenModal={openModal}
        />

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-b from-gray-50 to-gray-100">
          {/* 気分状態表示 - モバイルのみ */}
          {moodState && (
            <div className="lg:hidden">
              <MoodIndicator 
                moodState={moodState} 
                characterName={character.nickname} 
              />
            </div>
          )}
        
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>{character.nickname}との会話を始めましょう！</p>
            </div>
          ) : (
            renderedMessages
          )}
        
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        <ChatInput 
          onSendMessage={sendMessage} 
          disabled={isLoading} 
        />
      </div>

      {/* モーダル群 */}
      <SettingsModal 
        isOpen={modals.settings} 
        onClose={() => closeModal('settings')} 
      />
      <StoreModal 
        isOpen={modals.store} 
        onClose={() => closeModal('store')} 
        character={character} 
      />
      <DateModal 
        isOpen={modals.date} 
        onClose={() => closeModal('date')} 
        characterName={character.nickname}
      />
      <GiftModal 
        isOpen={modals.gift} 
        onClose={() => closeModal('gift')} 
        characterName={character.nickname}
        onGiftSent={handleGiftMessage}
      />
      <MemoryAlbum
        isOpen={modals.memories}
        onClose={() => closeModal('memories')}
        characterName={character.nickname}
      />
      <ScheduleModal
        isOpen={modals.schedule}
        onClose={() => closeModal('schedule')}
        characterName={character.nickname}
      />
      <VideoCallModal
        isOpen={modals.videoCall}
        onClose={() => closeModal('videoCall')}
        onSendMessage={sendMessage}
      />
      <BackgroundModal
        isOpen={modals.background}
        onClose={() => closeModal('background')}
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

// React.memoでパフォーマンス最適化
export const ChatContainerRefactored = memo(ChatContainerRefactoredComponent);