import React from 'react';
import { AvatarSettings } from '@/types';
import { Live2DAvatarWrapper } from './Live2DAvatarWrapper';

const AVATAR_OPTIONS = {
  hairStyle: [
    { id: 'short', name: 'ショート', free: true, emoji: '👦' },
    { id: 'medium', name: 'ミディアム', free: true, emoji: '👧' },
    { id: 'long', name: 'ロング', free: true, emoji: '👩' },
    { id: 'ponytail', name: 'ポニーテール', free: false, emoji: '👩‍🦰' },
    { id: 'twintails', name: 'ツインテール', free: false, emoji: '👯‍♀️' },
    { id: 'bob', name: 'ボブ', free: false, emoji: '👱‍♀️' },
  ],
  hairColor: [
    { id: 'black', name: '黒', free: true, color: '#2D2D2D' },
    { id: 'brown', name: '茶色', free: true, color: '#8B4513' },
    { id: 'blonde', name: '金髪', free: false, color: '#FFD700' },
    { id: 'red', name: '赤毛', free: false, color: '#DC143C' },
    { id: 'blue', name: '青', free: false, color: '#4169E1' },
    { id: 'pink', name: 'ピンク', free: false, color: '#FF69B4' },
  ],
  eyeColor: [
    { id: 'brown', name: '茶色', free: true, color: '#8B4513' },
    { id: 'black', name: '黒', free: true, color: '#2D2D2D' },
    { id: 'blue', name: '青', free: false, color: '#4169E1' },
    { id: 'green', name: '緑', free: false, color: '#228B22' },
    { id: 'hazel', name: 'ヘーゼル', free: false, color: '#DAA520' },
    { id: 'violet', name: '紫', free: false, color: '#8A2BE2' },
  ],
  outfit: [
    { id: 'casual', name: 'カジュアル', free: true, emoji: '👕' },
    { id: 'formal', name: 'フォーマル', free: true, emoji: '👔' },
    { id: 'sporty', name: 'スポーティ', free: false, emoji: '🏃‍♂️' },
    { id: 'elegant', name: 'エレガント', free: false, emoji: '👗' },
    { id: 'cute', name: 'キュート', free: false, emoji: '🎀' },
    { id: 'cool', name: 'クール', free: false, emoji: '🕶️' },
  ],
};

interface AvatarPreviewProps {
  avatar: AvatarSettings;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  characterName?: string;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ 
  avatar, 
  size = 'medium',
  showName = false,
  characterName 
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-24 h-24', 
    large: 'w-48 h-48',
  };

  const getHairStyleEmoji = (style: string) => {
    const styles = {
      short: '👦',
      medium: '👧',
      long: '👩',
      ponytail: '👩‍🦰',
      twintails: '👯‍♀️',
      bob: '👱‍♀️',
    };
    return styles[style as keyof typeof styles] || '👤';
  };

  const getHairColor = (color: string) => {
    const colors = {
      black: '#2D2D2D',
      brown: '#8B4513',
      blonde: '#FFD700',
      red: '#DC143C',
      blue: '#4169E1',
      pink: '#FF69B4',
    };
    return colors[color as keyof typeof colors] || '#2D2D2D';
  };

  const getEyeColor = (color: string) => {
    const colors = {
      brown: '#8B4513',
      black: '#2D2D2D',
      blue: '#4169E1',
      green: '#228B22',
      hazel: '#DAA520',
      violet: '#8A2BE2',
    };
    return colors[color as keyof typeof colors] || '#8B4513';
  };

  const getOutfitEmoji = (outfit: string) => {
    const outfits = {
      casual: '👕',
      formal: '👔',
      sporty: '🏃‍♂️',
      elegant: '👗',
      cute: '🎀',
      cool: '🕶️',
    };
    return outfits[outfit as keyof typeof outfits] || '👕';
  };

  return (
    <div className="flex flex-col items-center">
      {/* アニメ風アバター表示 */}
      <div className="relative">
        <Live2DAvatarWrapper 
          avatar={avatar} 
          size={size}
          mood={50} // デフォルト気分
          isBlinking={true}
          emotionState="normal"
        />
      </div>

      {/* キャラクター名 */}
      {showName && characterName && (
        <div className="mt-2 text-center">
          <div className="text-sm font-medium text-gray-800">{characterName}</div>
        </div>
      )}

      {/* アバター詳細（大きいサイズの時のみ） */}
      {size === 'large' && (
        <div className="mt-4 text-center space-y-1">
          <div className="text-xs text-gray-600">
            髪型: {AVATAR_OPTIONS.hairStyle.find(h => h.id === avatar.hairStyle)?.name || '不明'}
          </div>
          <div className="text-xs text-gray-600">
            髪色: {AVATAR_OPTIONS.hairColor.find(h => h.id === avatar.hairColor)?.name || '不明'}
          </div>
          <div className="text-xs text-gray-600">
            瞳色: {AVATAR_OPTIONS.eyeColor.find(e => e.id === avatar.eyeColor)?.name || '不明'}
          </div>
          <div className="text-xs text-gray-600">
            服装: {AVATAR_OPTIONS.outfit.find(o => o.id === avatar.outfit)?.name || '不明'}
          </div>
        </div>
      )}
    </div>
  );
};