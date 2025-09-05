/**
 * キャラクターアバター表示コンポーネント
 * PC版の左側表示を管理
 */

import React, { memo } from 'react';
import dynamic from 'next/dynamic';
import { MoodState } from '@/types';
import { EmotionType } from '@/utils/emotionAnalyzer';

// 遅延読み込みでVRMアバターをインポート
const VRMAvatar = dynamic(
  () => import('@/components/avatar/VRMAvatarOptimized').then(mod => ({ 
    default: mod.VRMAvatarOptimized 
  })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
);

interface CharacterAvatarDisplayProps {
  character: {
    avatar?: any;
  };
  moodState: MoodState | null;
  isSpeaking: boolean;
  currentEmotion: EmotionType;
  emotionIntensity: number;
}

const CharacterAvatarDisplayComponent: React.FC<CharacterAvatarDisplayProps> = ({
  character,
  moodState,
  isSpeaking,
  currentEmotion,
  emotionIntensity,
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
    <div 
      className="hidden lg:flex lg:w-1/2 xl:w-1/2 items-center justify-center p-2" 
      style={{ backgroundColor: '#FFF5F5' }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <VRMAvatar 
          avatar={character.avatar || defaultAvatar} 
          size="xlarge" 
          mood={moodState?.currentMood || 50}
          isSpeaking={isSpeaking}
          isBlinking={true}
          emotionState={currentEmotion}
          emotionIntensity={emotionIntensity}
        />
      </div>
    </div>
  );
};

export const CharacterAvatarDisplay = memo(CharacterAvatarDisplayComponent);