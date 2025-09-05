/**
 * チャットヘッダーコンポーネント
 * チャット画面上部のナビゲーションバー
 */

import React, { memo } from 'react';
import { Settings, ShoppingBag, Heart, Gift, Video, Image } from 'lucide-react';
import { MoodState } from '@/types';
import dynamic from 'next/dynamic';

// 遅延読み込みでVRMアバターをインポート
const VRMAvatar = dynamic(
  () => import('@/components/avatar/VRMAvatarOptimized').then(mod => ({ 
    default: mod.VRMAvatarOptimized 
  })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    )
  }
);

interface ChatHeaderProps {
  character: {
    id: string;
    nickname: string;
    avatar?: any;
  };
  moodState: MoodState | null;
  isSpeaking: boolean;
  currentEmotion: string;
  emotionIntensity?: number;
  onOpenModal: (modalType: any) => void;
}

const ChatHeaderComponent: React.FC<ChatHeaderProps> = ({
  character,
  moodState,
  isSpeaking,
  currentEmotion,
  emotionIntensity = 50,
  onOpenModal,
}) => {
  const defaultAvatar = {
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
  };

  return (
    <div className="bg-white border-b px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
        {/* Mobile only avatar */}
        <div className="lg:hidden">
          <VRMAvatar 
            avatar={character.avatar || defaultAvatar} 
            size="small" 
            mood={moodState?.currentMood || 50}
            isSpeaking={isSpeaking}
            isBlinking={true}
            emotionState={currentEmotion as any}
            emotionIntensity={emotionIntensity}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-gray-900 text-base sm:text-lg truncate">
            {character.nickname}
          </h1>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-xs sm:text-sm text-green-600 font-medium">オンライン</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
        <button
          onClick={() => onOpenModal('background')}
          className="p-1.5 sm:p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
          title="背景"
        >
          <Image size={16} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={() => onOpenModal('videoCall')}
          className="p-1.5 sm:p-2 text-purple-500 hover:bg-purple-50 rounded-full transition-colors"
          title="ビデオ通話"
        >
          <Video size={16} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={() => onOpenModal('schedule')}
          className="p-1.5 sm:p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
          title="スケジュール"
        >
          <span className="text-sm sm:text-base">📅</span>
        </button>
        <button
          onClick={() => onOpenModal('memories')}
          className="p-1.5 sm:p-2 text-purple-500 hover:bg-purple-50 rounded-full transition-colors"
          title="思い出"
        >
          <span className="text-sm sm:text-base">📸</span>
        </button>
        <button
          onClick={() => onOpenModal('gift')}
          className="p-1.5 sm:p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
          title="プレゼント"
        >
          <Gift size={16} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={() => onOpenModal('date')}
          className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="デート"
        >
          <Heart size={16} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={() => onOpenModal('store')}
          className="p-1.5 sm:p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          title="ショップ"
        >
          <ShoppingBag size={16} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={() => onOpenModal('settings')}
          className="p-1.5 sm:p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
          title="設定"
        >
          <Settings size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export const ChatHeader = memo(ChatHeaderComponent);