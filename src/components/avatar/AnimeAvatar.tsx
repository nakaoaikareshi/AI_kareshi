import React from 'react';
import { AvatarSettings } from '@/types';

interface AnimeAvatarProps {
  avatar: AvatarSettings;
  size?: 'small' | 'medium' | 'large';
  mood?: number;
}

export const AnimeAvatar: React.FC<AnimeAvatarProps> = ({ 
  avatar, 
  size = 'medium',
  mood = 50 
}) => {
  const sizeMap = {
    small: { width: 48, height: 48, scale: 0.5 },
    medium: { width: 96, height: 96, scale: 1 },
    large: { width: 192, height: 192, scale: 2 },
  };

  const { width, height, scale } = sizeMap[size];

  const getHairColor = (color: string) => {
    const colors = {
      black: '#2D2D2D',
      brown: '#8B4513', 
      blonde: '#FFD700',
      red: '#DC143C',
      blue: '#4169E1',
      pink: '#FF69B4',
      silver: '#C0C0C0',
      purple: '#9370DB',
      white: '#F8F8FF',
      mint: '#98FB98',
    };
    return colors[color as keyof typeof colors] || '#8B4513';
  };

  const getEyeColor = (color: string) => {
    const colors = {
      brown: '#8B4513',
      black: '#2D2D2D',
      blue: '#4169E1',
      green: '#228B22',
      hazel: '#DAA520',
      violet: '#8A2BE2',
      amber: '#FFBF00',
      crimson: '#DC143C',
    };
    return colors[color as keyof typeof colors] || '#8B4513';
  };

  const getOutfitColor = (outfit: string) => {
    const outfits = {
      casual: '#6B7280',
      formal: '#1F2937',
      sporty: '#EF4444',
      elegant: '#8B5CF6',
      cute: '#EC4899',
      cool: '#374151',
    };
    return outfits[outfit as keyof typeof outfits] || '#6B7280';
  };

  // 気分に基づいた表情
  const getEyeExpression = (mood: number) => {
    if (mood >= 70) return { eyeHeight: 6, eyebrowY: 8 }; // 嬉しい
    if (mood >= 40) return { eyeHeight: 5, eyebrowY: 10 }; // 普通
    if (mood >= 10) return { eyeHeight: 4, eyebrowY: 12 }; // 普通
    if (mood >= -20) return { eyeHeight: 3, eyebrowY: 14 }; // 少し疲れ
    return { eyeHeight: 2, eyebrowY: 16 }; // 落ち込み
  };

  const getMouthExpression = (mood: number) => {
    if (mood >= 70) return { path: 'M 15 25 Q 25 30 35 25', color: '#FF69B4' }; // 笑顔
    if (mood >= 40) return { path: 'M 18 27 Q 25 29 32 27', color: '#F87171' }; // 微笑み
    if (mood >= 10) return { path: 'M 20 28 L 30 28', color: '#9CA3AF' }; // 普通
    if (mood >= -20) return { path: 'M 18 30 Q 25 28 32 30', color: '#6B7280' }; // 少し下向き
    return { path: 'M 15 32 Q 25 28 35 32', color: '#9CA3AF' }; // 悲しい
  };

  const eyeExpr = getEyeExpression(mood);
  const mouthExpr = getMouthExpression(mood);
  const hairColor = getHairColor(avatar.hairColor);
  const eyeColor = getEyeColor(avatar.eyeColor);
  const outfitColor = getOutfitColor(avatar.outfit);

  return (
    <div style={{ width, height }} className="relative">
      <svg
        width={width}
        height={height}
        viewBox="0 0 50 50"
        className="drop-shadow-lg"
      >
        {/* 背景 */}
        <circle cx="25" cy="25" r="24" fill="url(#bgGradient)" />
        
        {/* グラデーション定義 */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDF2F8" />
            <stop offset="100%" stopColor="#FCE7F3" />
          </linearGradient>
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hairColor} />
            <stop offset="100%" stopColor={hairColor} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* 顔の輪郭（モンハン風のよりリアルで整った顔立ち） */}
        <path d="M 13 20 Q 13 16 16 14 Q 20 12 25 12 Q 30 12 34 14 Q 37 16 37 20 L 37 28 Q 37 35 34 38 Q 30 40 25 40 Q 20 40 16 38 Q 13 35 13 28 Z" 
              fill="#FDBCB4" stroke="#E8A598" strokeWidth="0.8" />
        
        {/* 顔のハイライト・陰影 */}
        <path d="M 16 18 Q 20 16 25 16 Q 30 16 34 18" stroke="#FFE4E1" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M 17 32 Q 21 34 25 34 Q 29 34 33 32" stroke="#E8A598" strokeWidth="1" fill="none" opacity="0.5" />

        {/* 髪型 - モンハン風のかっこいい/美しいデザイン */}
        {avatar.hairStyle === 'short' && (
          <>
            <path d="M 12 18 Q 15 14 20 13 Q 25 11 30 13 Q 35 14 38 18 Q 38 24 36 28 Q 32 30 25 30 Q 18 30 14 28 Q 12 24 12 18" 
                  fill="url(#hairGradient)" stroke={hairColor} strokeWidth="0.8" />
            {/* 立体的な前髪 */}
            <path d="M 15 20 Q 18 17 21 20 M 21 19 Q 25 16 29 19 M 29 20 Q 32 17 35 20" 
                  stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* ボリューム表現 */}
            <path d="M 14 22 Q 17 21 20 23 M 30 23 Q 33 21 36 22" 
                  stroke={hairColor} strokeWidth="1" fill="none" opacity="0.7" />
          </>
        )}
        {avatar.hairStyle === 'medium' && (
          <>
            <path d="M 9 17 Q 15 12 25 10 Q 35 12 41 17 Q 41 26 39 34 Q 35 37 25 37 Q 15 37 11 34 Q 9 26 9 17" 
                  fill="url(#hairGradient)" stroke={hairColor} strokeWidth="0.8" />
            {/* モンハン風レイヤード前髪 */}
            <path d="M 14 21 Q 19 17 25 21 Q 31 17 36 21" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 16 22 Q 21 19 25 22 Q 29 19 34 22" stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* サイドの毛束 */}
            <path d="M 11 25 Q 8 27 10 30" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 39 25 Q 42 27 40 30" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
        {avatar.hairStyle === 'long' && (
          <>
            <path d="M 7 15 Q 12 10 25 8 Q 38 10 43 15 Q 43 28 41 40 Q 37 45 25 45 Q 13 45 9 40 Q 7 28 7 15" 
                  fill="url(#hairGradient)" stroke={hairColor} strokeWidth="0.8" />
            {/* 美しい流れる前髪 */}
            <path d="M 13 20 Q 19 16 25 20 Q 31 16 37 20" stroke={hairColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 15 22 Q 20 18 25 22 Q 30 18 35 22" stroke={hairColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* ロングヘアの流れ */}
            <path d="M 9 30 Q 6 35 8 42" stroke={hairColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 41 30 Q 44 35 42 42" stroke={hairColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 12 35 Q 10 40 12 44" stroke={hairColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M 38 35 Q 40 40 38 44" stroke={hairColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </>
        )}
        {avatar.hairStyle === 'ponytail' && (
          <>
            <path d="M 11 17 Q 15 13 25 11 Q 35 13 39 17 Q 39 24 37 30 Q 32 32 25 32 Q 18 32 13 30 Q 11 24 11 17" 
                  fill="url(#hairGradient)" stroke={hairColor} strokeWidth="0.8" />
            {/* 美しいポニーテール */}
            <path d="M 38 16 Q 45 12 48 20 Q 47 28 44 35 Q 42 38 40 35 Q 39 28 38 20" 
                  fill="url(#hairGradient)" stroke={hairColor} strokeWidth="0.8" />
            {/* ポニーテールの流れ */}
            <path d="M 40 18 Q 44 16 46 22 M 42 25 Q 45 27 44 32" 
                  stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* きれいな前髪 */}
            <path d="M 15 21 Q 20 17 25 21 Q 30 17 35 21" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
        {avatar.hairStyle === 'twintails' && (
          <>
            <path d="M 11 17 Q 15 13 25 11 Q 35 13 39 17 Q 39 24 37 30 Q 32 32 25 32 Q 18 32 13 30 Q 11 24 11 17" 
                  fill="url(#hairGradient)" stroke={hairColor} strokeWidth="0.8" />
            {/* 美しいツインテール */}
            <path d="M 6 18 Q 4 12 8 8 Q 12 10 10 18 Q 8 25 6 30 Q 4 28 6 22" 
                  fill="url(#hairGradient)" stroke={hairColor} strokeWidth="0.8" />
            <path d="M 44 18 Q 46 12 42 8 Q 38 10 40 18 Q 42 25 44 30 Q 46 28 44 22" 
                  fill="url(#hairGradient)" stroke={hairColor} strokeWidth="0.8" />
            {/* ツインテールの流れ */}
            <path d="M 8 16 Q 6 20 8 24 M 42 16 Q 44 20 42 24" stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* きれいな前髪 */}
            <path d="M 16 21 Q 21 17 25 21 Q 29 17 34 21" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
        {avatar.hairStyle === 'bob' && (
          <>
            <path d="M 10 18 Q 15 13 25 11 Q 35 13 40 18 Q 40 26 38 32 Q 33 35 25 35 Q 17 35 12 32 Q 10 26 10 18" 
                  fill="url(#hairGradient)" stroke={hairColor} strokeWidth="0.8" />
            {/* モンハン風ボブの前髪 */}
            <path d="M 15 20 Q 20 17 25 20 Q 30 17 35 20" stroke={hairColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 17 21.5 Q 22 19 25 21.5 Q 28 19 33 21.5" stroke={hairColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* サイドの丸み */}
            <path d="M 12 24 Q 10 27 12 30" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 38 24 Q 40 27 38 30" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
        {avatar.hairStyle === 'curly' && (
          <>
            <path d="M 9 16 Q 15 11 25 9 Q 35 11 41 16 Q 41 27 39 35 Q 34 38 25 38 Q 16 38 11 35 Q 9 27 9 16" 
                  fill="url(#hairGradient)" stroke={hairColor} strokeWidth="0.8" />
            {/* エレガントなカール */}
            <path d="M 14 22 Q 12 24 14 26 Q 16 28 14 30" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 36 22 Q 38 24 36 26 Q 34 28 36 30" stroke={hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 18 28 Q 16 30 18 32 Q 20 34 18 36" stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 32 28 Q 34 30 32 32 Q 30 34 32 36" stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* 美しい前髪 */}
            <path d="M 14 20 Q 19 16 25 20 Q 31 16 36 20" stroke={hairColor} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </>
        )}
        {avatar.hairStyle === 'spiky' && (
          <>
            <path d="M 11 19 L 14 10 L 17 19 L 20 9 L 23 19 L 25 8 L 27 19 L 30 9 L 33 19 L 36 10 L 39 19 Q 39 25 37 31 Q 32 33 25 33 Q 18 33 13 31 Q 11 25 11 19" 
                  fill="url(#hairGradient)" stroke={hairColor} strokeWidth="0.8" />
            {/* スパイクの立体感 */}
            <path d="M 14 12 Q 16 10 18 12 M 20 11 Q 22 9 24 11 M 27 11 Q 29 9 31 11 M 36 12 Q 38 10 40 12" 
                  stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* 眉毛（モンハン風の整った形） */}
        <path d={`M 17 ${eyeExpr.eyebrowY} Q 19 ${eyeExpr.eyebrowY - 1.5} 21 ${eyeExpr.eyebrowY - 0.5} Q 22 ${eyeExpr.eyebrowY} 23 ${eyeExpr.eyebrowY + 0.5}`} 
              stroke="#8B4513" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d={`M 27 ${eyeExpr.eyebrowY + 0.5} Q 28 ${eyeExpr.eyebrowY} 29 ${eyeExpr.eyebrowY - 0.5} Q 31 ${eyeExpr.eyebrowY - 1.5} 33 ${eyeExpr.eyebrowY}`} 
              stroke="#8B4513" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* 目（モンハン風の美しく整った目） */}
        <ellipse cx="20" cy="24" rx="4.5" ry={eyeExpr.eyeHeight + 1.5} fill="white" stroke="#333" strokeWidth="1" />
        <ellipse cx="30" cy="24" rx="4.5" ry={eyeExpr.eyeHeight + 1.5} fill="white" stroke="#333" strokeWidth="1" />
        
        {/* 瞳（より美しいグラデーション） */}
        <defs>
          <radialGradient id="eyeGradient" cx="0.3" cy="0.2" r="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="30%" stopColor={eyeColor} stopOpacity="0.7" />
            <stop offset="70%" stopColor={eyeColor} />
            <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="pupilGradient" cx="0.5" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#000" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
        </defs>
        <ellipse cx="20" cy="24" rx="3.5" ry={eyeExpr.eyeHeight + 0.5} fill="url(#eyeGradient)" />
        <ellipse cx="30" cy="24" rx="3.5" ry={eyeExpr.eyeHeight + 0.5} fill="url(#eyeGradient)" />
        
        {/* 瞳孔（よりリアル） */}
        <ellipse cx="20" cy="24.5" rx="1.8" ry={Math.max(eyeExpr.eyeHeight - 1, 1.5)} fill="url(#pupilGradient)" />
        <ellipse cx="30" cy="24.5" rx="1.8" ry={Math.max(eyeExpr.eyeHeight - 1, 1.5)} fill="url(#pupilGradient)" />
        
        {/* モンハン風ハイライト */}
        <ellipse cx="18.2" cy="22" rx="1.5" ry="2.2" fill="white" opacity="0.95" />
        <ellipse cx="28.2" cy="22" rx="1.5" ry="2.2" fill="white" opacity="0.95" />
        <circle cx="21.5" cy="22.5" r="0.7" fill="white" opacity="0.8" />
        <circle cx="31.5" cy="22.5" r="0.7" fill="white" opacity="0.8" />
        <circle cx="19" cy="25" r="0.3" fill="white" opacity="0.9" />
        <circle cx="29" cy="25" r="0.3" fill="white" opacity="0.9" />
        
        {/* 美しいまつ毛 */}
        <path d="M 16 21.5 Q 17 20 18.5 21.5 M 19 21 Q 20 19.5 21.5 21 M 22 21.5 Q 23 20 24.5 21.5" 
              stroke="#333" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M 25.5 21.5 Q 27 20 28.5 21 M 29 21.5 Q 30 19.5 31.5 21.5 M 32 21.5 Q 33 20 34.5 21.5" 
              stroke="#333" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* 下まつ毛 */}
        <path d="M 17.5 26.5 Q 18 27 18.5 26.5 M 21.5 26.8 Q 22 27.3 22.5 26.8" 
              stroke="#333" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M 27.5 26.8 Q 28 27.3 28.5 26.8 M 31.5 26.5 Q 32 27 32.5 26.5" 
              stroke="#333" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6" />

        {/* 鼻（より立体的でリアル） */}
        <path d="M 24.5 26.5 Q 25 27.5 25.5 26.5" stroke="#E8A598" strokeWidth="1" fill="none" strokeLinecap="round" />
        <circle cx="25" cy="27.2" r="0.3" fill="#F8BBD9" opacity="0.4" />

        {/* 口（モンハン風の美しい唇） */}
        <path d={mouthExpr.path} stroke={mouthExpr.color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 唇のハイライト */}
        {mood >= 50 && (
          <path d="M 20 27.5 Q 25 26.5 30 27.5" stroke="#FFB6C1" strokeWidth="0.8" fill="none" opacity="0.6" />
        )}

        {/* 頬の赤み */}
        {mood >= 40 && (
          <>
            <ellipse cx="16" cy="29" rx="2" ry="1.5" fill="#FFB6C1" opacity="0.6" />
            <ellipse cx="34" cy="29" rx="2" ry="1.5" fill="#FFB6C1" opacity="0.6" />
          </>
        )}

        {/* 服装（より詳細なアニメ風デザイン） */}
        {avatar.outfit === 'casual' && (
          <>
            <rect x="15" y="42" width="20" height="8" rx="2" fill={outfitColor} opacity="0.9" />
            <rect x="17" y="44" width="16" height="1" fill="white" opacity="0.6" />
            <circle cx="18" cy="46" r="0.5" fill="white" opacity="0.8" />
          </>
        )}
        {avatar.outfit === 'formal' && (
          <>
            <rect x="15" y="42" width="20" height="8" rx="1" fill={outfitColor} />
            <rect x="24" y="42" width="2" height="8" fill="white" />
            <circle cx="20" cy="45" r="0.8" fill="#FFD700" />
            <circle cx="22" cy="47" r="0.8" fill="#FFD700" />
            <rect x="16" y="43" width="18" height="0.5" fill="white" opacity="0.4" />
          </>
        )}
        {avatar.outfit === 'cute' && (
          <>
            <rect x="15" y="42" width="20" height="8" rx="3" fill="#FFB6C1" />
            <rect x="17" y="44" width="16" height="4" rx="2" fill="white" opacity="0.8" />
            <circle cx="19" cy="46" r="0.5" fill="#FF69B4" />
            <circle cx="25" cy="46" r="0.5" fill="#FF69B4" />
            <circle cx="31" cy="46" r="0.5" fill="#FF69B4" />
          </>
        )}
        {avatar.outfit === 'elegant' && (
          <>
            <path d="M 15 42 Q 25 40 35 42 L 35 50 Q 25 52 15 50 Z" fill="#8B5CF6" />
            <path d="M 17 44 Q 25 42 33 44" stroke="white" strokeWidth="0.8" fill="none" />
            <circle cx="25" cy="46" r="1" fill="#FFD700" opacity="0.8" />
          </>
        )}
        {avatar.outfit === 'sporty' && (
          <>
            <rect x="15" y="42" width="20" height="8" rx="2" fill="#EF4444" />
            <rect x="17" y="44" width="6" height="4" rx="1" fill="white" />
            <rect x="27" y="44" width="6" height="4" rx="1" fill="white" />
            <circle cx="25" cy="46" r="1.5" fill="white" />
            <circle cx="25" cy="46" r="1" fill="#EF4444" />
          </>
        )}
        {(avatar.outfit === 'cool' || avatar.outfit === 'gothic' || avatar.outfit === 'sailor') && (
          <>
            <rect x="15" y="42" width="20" height="8" rx="2" fill={outfitColor} opacity="0.9" />
            {avatar.outfit === 'sailor' && (
              <>
                <rect x="17" y="43" width="16" height="2" fill="white" />
                <rect x="24" y="42" width="2" height="8" fill="white" />
              </>
            )}
          </>
        )}
        
        {/* アクセサリー（より詳細なアニメ風） */}
        {avatar.accessories.includes('ribbon') && (
          <>
            <path d="M 20 15 Q 25 12 30 15 Q 27 17 25 17 Q 23 17 20 15" 
                  fill="#FF69B4" stroke="#E91E63" strokeWidth="0.5" />
            <path d="M 22 16 Q 25 14 28 16" stroke="#FFB6C1" strokeWidth="0.8" fill="none" />
            <circle cx="25" cy="15" r="0.8" fill="#FFD700" opacity="0.8" />
          </>
        )}
        
        {avatar.accessories.includes('glasses') && (
          <>
            <ellipse cx="20" cy="24" rx="4.5" ry="3" fill="none" stroke="#333" strokeWidth="1.2" />
            <ellipse cx="30" cy="24" rx="4.5" ry="3" fill="none" stroke="#333" strokeWidth="1.2" />
            <path d="M 24.5 24 L 25.5 24" stroke="#333" strokeWidth="1" />
            <path d="M 15.5 24 Q 14 23 13 24" stroke="#333" strokeWidth="1" fill="none" />
            <path d="M 34.5 24 Q 36 23 37 24" stroke="#333" strokeWidth="1" fill="none" />
          </>
        )}
        
        {avatar.accessories.includes('earrings') && (
          <>
            <circle cx="13" cy="26" r="1" fill="#FFD700" stroke="#DAA520" strokeWidth="0.3" />
            <circle cx="37" cy="26" r="1" fill="#FFD700" stroke="#DAA520" strokeWidth="0.3" />
          </>
        )}
        
        {/* 表情の詳細（アニメ風頬マーク） */}
        {mood >= 60 && (
          <>
            <circle cx="15" cy="28" r="1.5" fill="#FFB6C1" opacity="0.7" />
            <circle cx="35" cy="28" r="1.5" fill="#FFB6C1" opacity="0.7" />
          </>
        )}
        
        {/* 気分による追加表現 */}
        {mood >= 80 && (
          <>
            <circle cx="13" cy="26" r="0.5" fill="#FFD700" opacity="0.8" />
            <circle cx="37" cy="26" r="0.5" fill="#FFD700" opacity="0.8" />
            <circle cx="12" cy="28" r="0.3" fill="#FFD700" opacity="0.6" />
            <circle cx="38" cy="28" r="0.3" fill="#FFD700" opacity="0.6" />
          </>
        )}
        
        {mood <= 20 && (
          <>
            <path d="M 18 31 Q 20 32 22 31" stroke="#87CEEB" strokeWidth="0.8" fill="none" opacity="0.6" />
            <circle cx="19" cy="31.5" r="0.3" fill="#87CEEB" opacity="0.4" />
          </>
        )}
      </svg>
    </div>
  );
};