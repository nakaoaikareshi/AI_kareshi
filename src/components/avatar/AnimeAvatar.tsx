import React, { useState, useEffect } from 'react';
import { AvatarSettings } from '@/types';

interface AnimeAvatarProps {
  avatar: AvatarSettings;
  size?: 'small' | 'medium' | 'large';
  mood?: number;
  isSpeaking?: boolean;
  isBlinking?: boolean;
  emotionState?: 'happy' | 'sad' | 'surprised' | 'angry' | 'love' | 'normal';
}

export const AnimeAvatar: React.FC<AnimeAvatarProps> = ({ 
  avatar, 
  size = 'medium',
  mood = 50,
  isSpeaking = false,
  isBlinking = true,
  emotionState = 'normal'
}) => {
  const [currentBlink, setCurrentBlink] = useState(false);
  const [lipSyncFrame, setLipSyncFrame] = useState(0);
  const [idleAnimation, setIdleAnimation] = useState(0);
  const [emotionTransition, setEmotionTransition] = useState(1);
  const sizeMap = {
    small: { width: 48, height: 48, scale: 0.5 },
    medium: { width: 96, height: 96, scale: 1 },
    large: { width: 192, height: 192, scale: 2 },
  };

  const { width, height } = sizeMap[size];

  // まばたきアニメーション
  useEffect(() => {
    if (!isBlinking) return;

    const blinkInterval = setInterval(() => {
      setCurrentBlink(true);
      setTimeout(() => setCurrentBlink(false), 150);
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, [isBlinking]);

  // リップシンクアニメーション
  useEffect(() => {
    if (!isSpeaking) {
      setLipSyncFrame(0);
      return;
    }

    const lipSyncInterval = setInterval(() => {
      setLipSyncFrame(prev => (prev + 1) % 4);
    }, 200);

    return () => clearInterval(lipSyncInterval);
  }, [isSpeaking]);

  // アイドルアニメーション
  useEffect(() => {
    const idleInterval = setInterval(() => {
      setIdleAnimation(prev => (prev + 1) % 360);
    }, 100);

    return () => clearInterval(idleInterval);
  }, []);

  // 感情遷移アニメーション
  useEffect(() => {
    setEmotionTransition(0);
    const transitionTimer = setTimeout(() => {
      setEmotionTransition(1);
    }, 50);

    return () => clearTimeout(transitionTimer);
  }, [emotionState]);

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

  // アニメーション対応の表情システム
  const getAnimatedEyeExpression = (mood: number, emotionState: string, isBlink: boolean) => {
    if (isBlink) return { eyeHeight: 0.5, eyebrowY: 12 };
    
    const baseExpression = (() => {
      switch (emotionState) {
        case 'happy': return { eyeHeight: 7, eyebrowY: 6 };
        case 'love': return { eyeHeight: 6, eyebrowY: 8, sparkle: true };
        case 'surprised': return { eyeHeight: 8, eyebrowY: 5 };
        case 'sad': return { eyeHeight: 2, eyebrowY: 16 };
        case 'angry': return { eyeHeight: 3, eyebrowY: 14, tilt: true };
        default:
          if (mood >= 70) return { eyeHeight: 6, eyebrowY: 8 };
          if (mood >= 40) return { eyeHeight: 5, eyebrowY: 10 };
          if (mood >= 10) return { eyeHeight: 4, eyebrowY: 12 };
          if (mood >= -20) return { eyeHeight: 3, eyebrowY: 14 };
          return { eyeHeight: 2, eyebrowY: 16 };
      }
    })();

    // アイドルアニメーション微調整
    const idleOffset = Math.sin(idleAnimation * 0.05) * 0.5;
    return {
      ...baseExpression,
      eyeHeight: baseExpression.eyeHeight + idleOffset,
      eyebrowY: baseExpression.eyebrowY - idleOffset * 0.5
    };
  };

  const getAnimatedMouthExpression = (mood: number, emotionState: string, lipSync: number) => {
    // リップシンク用の口の形
    if (isSpeaking) {
      const syncPaths = [
        'M 22 30 L 28 30', // 閉じ
        'M 21 29 Q 25 31 29 29', // 微開
        'M 20 28 Q 25 32 30 28', // 開
        'M 22 29 Q 25 31 28 29', // 中間
      ];
      return { path: syncPaths[lipSync], color: '#FF69B4' };
    }

    // 感情に基づく口の表情
    switch (emotionState) {
      case 'happy':
        return { path: 'M 19 29 Q 25 33 31 29', color: '#FF69B4' }; // 大きな笑顔
      case 'love':
        return { path: 'M 21 30 Q 25 32 29 30', color: '#FF1493' }; // 愛らしい笑顔
      case 'surprised':
        return { path: 'M 23 30 Q 25 32 27 30', color: '#FF6347' }; // 驚き
      case 'sad':
        return { path: 'M 21 33 Q 25 31 29 33', color: '#9CA3AF' }; // 悲しい
      case 'angry':
        return { path: 'M 21 31 L 29 31', color: '#DC143C' }; // 怒り
      default:
        // 気分ベース
        if (mood >= 70) return { path: 'M 19 29 Q 25 32 31 29', color: '#FF69B4' };
        if (mood >= 40) return { path: 'M 21 30 Q 25 31 29 30', color: '#F87171' };
        if (mood >= 10) return { path: 'M 22 30 L 28 30', color: '#9CA3AF' };
        if (mood >= -20) return { path: 'M 21 31 Q 25 30 29 31', color: '#6B7280' };
        return { path: 'M 19 33 Q 25 30 31 33', color: '#9CA3AF' };
    }
  };

  const eyeExpr = getAnimatedEyeExpression(mood, emotionState, currentBlink);
  const mouthExpr = getAnimatedMouthExpression(mood, emotionState, lipSyncFrame);
  const hairColor = getHairColor(avatar.hairColor);
  const eyeColor = getEyeColor(avatar.eyeColor);
  const outfitColor = getOutfitColor(avatar.outfit);

  // アニメーション用の動的計算
  const breathingOffset = Math.sin(idleAnimation * 0.02) * 0.5;
  const headTilt = Math.sin(idleAnimation * 0.03) * 0.8;

  return (
    <div 
      className={`relative transition-all duration-300 ${
        isSpeaking ? 'animate-pulse' : ''
      }`}
      style={{
        width, 
        height,
        transform: `rotate(${headTilt}deg) translateY(${breathingOffset}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 50 50"
        className="drop-shadow-lg"
        style={{
          opacity: emotionTransition,
          transition: 'opacity 0.3s ease-in-out'
        }}
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

        {/* 顔の輪郭（より自然な楕円形） */}
        <ellipse cx="25" cy="26" rx="11" ry="13" fill="#FDBCB4" stroke="#E8A598" strokeWidth="0.8" />
        
        {/* 顔のハイライト・陰影 */}
        <ellipse cx="25" cy="22" rx="8" ry="6" fill="#FFE4E1" opacity="0.4" />
        <ellipse cx="25" cy="32" rx="6" ry="3" fill="#E8A598" opacity="0.3" />

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

        {/* アニメーション対応眉毛 */}
        <path d={`M 18 ${eyeExpr.eyebrowY + 2} Q 20 ${eyeExpr.eyebrowY + 0.5} 22 ${eyeExpr.eyebrowY + 1.5} Q 23 ${eyeExpr.eyebrowY + 2} 24 ${eyeExpr.eyebrowY + 2.5}`} 
              stroke="#8B4513" strokeWidth="1.8" fill="none" strokeLinecap="round"
              style={{ 
                transform: ('tilt' in eyeExpr && eyeExpr.tilt) ? 'rotate(-2deg)' : 'none',
                transformOrigin: '21px 20px',
                transition: 'transform 0.2s ease-out'
              }} />
        <path d={`M 26 ${eyeExpr.eyebrowY + 2.5} Q 27 ${eyeExpr.eyebrowY + 2} 28 ${eyeExpr.eyebrowY + 1.5} Q 30 ${eyeExpr.eyebrowY + 0.5} 32 ${eyeExpr.eyebrowY + 2}`} 
              stroke="#8B4513" strokeWidth="1.8" fill="none" strokeLinecap="round"
              style={{ 
                transform: ('tilt' in eyeExpr && eyeExpr.tilt) ? 'rotate(2deg)' : 'none',
                transformOrigin: '29px 20px',
                transition: 'transform 0.2s ease-out'
              }} />

        {/* アニメーション対応の目 */}
        <ellipse cx="21" cy="25" rx="3.5" ry={eyeExpr.eyeHeight + 1} fill="white" stroke="#333" strokeWidth="1" 
                 style={{ transition: 'ry 0.15s ease-out' }} />
        <ellipse cx="29" cy="25" rx="3.5" ry={eyeExpr.eyeHeight + 1} fill="white" stroke="#333" strokeWidth="1" 
                 style={{ transition: 'ry 0.15s ease-out' }} />
        
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
        <ellipse cx="21" cy="25" rx="2.8" ry={eyeExpr.eyeHeight + 0.5} fill="url(#eyeGradient)" />
        <ellipse cx="29" cy="25" rx="2.8" ry={eyeExpr.eyeHeight + 0.5} fill="url(#eyeGradient)" />
        
        {/* 瞳孔（よりリアル） */}
        <ellipse cx="21" cy="25.5" rx="1.5" ry={Math.max(eyeExpr.eyeHeight - 0.5, 1.2)} fill="url(#pupilGradient)" />
        <ellipse cx="29" cy="25.5" rx="1.5" ry={Math.max(eyeExpr.eyeHeight - 0.5, 1.2)} fill="url(#pupilGradient)" />
        
        {/* アニメ風ハイライト */}
        <ellipse cx="19.5" cy="23.5" rx="1.2" ry="1.8" fill="white" opacity="0.95" />
        <ellipse cx="27.5" cy="23.5" rx="1.2" ry="1.8" fill="white" opacity="0.95" />
        <circle cx="22" cy="24" r="0.5" fill="white" opacity="0.8" />
        <circle cx="30" cy="24" r="0.5" fill="white" opacity="0.8" />
        <circle cx="20.5" cy="26" r="0.2" fill="white" opacity="0.9" />
        <circle cx="28.5" cy="26" r="0.2" fill="white" opacity="0.9" />
        
        {/* 美しいまつ毛 */}
        <path d="M 18 23 Q 18.5 22 19.5 23 M 20 22.5 Q 20.5 21.5 21.5 22.5 M 22 23 Q 22.5 22 23.5 23" 
              stroke="#333" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M 26.5 23 Q 27 22 27.5 22.5 M 28 22.5 Q 28.5 21.5 29.5 22.5 M 30 23 Q 30.5 22 31.5 23" 
              stroke="#333" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* 下まつ毛 */}
        <path d="M 19 27 Q 19.5 27.5 20 27 M 22 27.2 Q 22.5 27.7 23 27.2" 
              stroke="#333" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M 27 27.2 Q 27.5 27.7 28 27.2 M 30 27 Q 30.5 27.5 31 27" 
              stroke="#333" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6" />

        {/* 鼻（より立体的でリアル） */}
        <path d="M 24.5 28 Q 25 29 25.5 28" stroke="#E8A598" strokeWidth="1" fill="none" strokeLinecap="round" />
        <circle cx="25" cy="28.8" r="0.3" fill="#F8BBD9" opacity="0.4" />

        {/* アニメーション対応の口 */}
        <path d={mouthExpr.path} stroke={mouthExpr.color} strokeWidth="2.5" fill="none" strokeLinecap="round"
              style={{ 
                transition: 'all 0.2s ease-out',
                transform: isSpeaking ? `scale(${1 + lipSyncFrame * 0.1})` : 'scale(1)',
                transformOrigin: '25px 28px'
              }} />
        
        {/* 唇のハイライト（アニメーション対応） */}
        {(mood >= 50 || emotionState === 'happy' || emotionState === 'love') && (
          <path d="M 22 29.5 Q 25 28.5 28 29.5" stroke="#FFB6C1" strokeWidth="0.8" fill="none" 
                opacity={emotionState === 'love' ? 0.9 : 0.6}
                style={{ transition: 'opacity 0.3s ease-out' }} />
        )}

        {/* リップシンク時の追加エフェクト */}
        {isSpeaking && lipSyncFrame > 1 && (
          <ellipse cx="25" cy="30" rx="6" ry="2" fill="none" stroke="#FF69B4" strokeWidth="0.5" 
                   opacity="0.3" style={{ animation: 'pulse 0.3s ease-out' }} />
        )}

        {/* 頬の赤み */}
        {mood >= 40 && (
          <>
            <ellipse cx="17" cy="30" rx="1.8" ry="1.2" fill="#FFB6C1" opacity="0.6" />
            <ellipse cx="33" cy="30" rx="1.8" ry="1.2" fill="#FFB6C1" opacity="0.6" />
          </>
        )}

        {/* 服装（より詳細なアニメ風デザイン） */}
        {avatar.outfit === 'casual' && (
          <>
            <rect x="17" y="38" width="16" height="12" rx="2" fill={outfitColor} opacity="0.9" />
            <rect x="19" y="40" width="12" height="1" fill="white" opacity="0.6" />
            <circle cx="20" cy="42" r="0.5" fill="white" opacity="0.8" />
          </>
        )}
        {avatar.outfit === 'formal' && (
          <>
            <rect x="17" y="38" width="16" height="12" rx="1" fill={outfitColor} />
            <rect x="24" y="38" width="2" height="12" fill="white" />
            <circle cx="21" cy="41" r="0.8" fill="#FFD700" />
            <circle cx="23" cy="43" r="0.8" fill="#FFD700" />
            <rect x="18" y="39" width="14" height="0.5" fill="white" opacity="0.4" />
          </>
        )}
        {avatar.outfit === 'cute' && (
          <>
            <rect x="17" y="38" width="16" height="12" rx="3" fill="#FFB6C1" />
            <rect x="19" y="40" width="12" height="8" rx="2" fill="white" opacity="0.8" />
            <circle cx="21" cy="42" r="0.5" fill="#FF69B4" />
            <circle cx="25" cy="42" r="0.5" fill="#FF69B4" />
            <circle cx="29" cy="42" r="0.5" fill="#FF69B4" />
          </>
        )}
        {avatar.outfit === 'elegant' && (
          <>
            <path d="M 17 38 Q 25 36 33 38 L 33 50 Q 25 52 17 50 Z" fill="#8B5CF6" />
            <path d="M 19 40 Q 25 38 31 40" stroke="white" strokeWidth="0.8" fill="none" />
            <circle cx="25" cy="42" r="1" fill="#FFD700" opacity="0.8" />
          </>
        )}
        {avatar.outfit === 'sporty' && (
          <>
            <rect x="17" y="38" width="16" height="12" rx="2" fill="#EF4444" />
            <rect x="19" y="40" width="5" height="8" rx="1" fill="white" />
            <rect x="26" y="40" width="5" height="8" rx="1" fill="white" />
            <circle cx="25" cy="42" r="1.5" fill="white" />
            <circle cx="25" cy="42" r="1" fill="#EF4444" />
          </>
        )}
        {(avatar.outfit === 'cool' || avatar.outfit === 'gothic' || avatar.outfit === 'sailor') && (
          <>
            <rect x="17" y="38" width="16" height="12" rx="2" fill={outfitColor} opacity="0.9" />
            {avatar.outfit === 'sailor' && (
              <>
                <rect x="19" y="39" width="12" height="2" fill="white" />
                <rect x="24" y="38" width="2" height="12" fill="white" />
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
            <circle cx="16" cy="29" r="1.2" fill="#FFB6C1" opacity="0.7" />
            <circle cx="34" cy="29" r="1.2" fill="#FFB6C1" opacity="0.7" />
          </>
        )}
        
        {/* 感情状態による特殊エフェクト */}
        {emotionState === 'love' && (
          <>
            <circle cx="14" cy="18" r="0.8" fill="#FF1493" opacity="0.7">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="36" cy="18" r="0.8" fill="#FF1493" opacity="0.7">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <path d="M 13 16 Q 16 13 19 16" stroke="#FF69B4" strokeWidth="1" fill="none" opacity="0.8"/>
            <path d="M 31 16 Q 34 13 37 16" stroke="#FF69B4" strokeWidth="1" fill="none" opacity="0.8"/>
          </>
        )}

        {emotionState === 'surprised' && (
          <>
            <circle cx="16" cy="20" r="0.6" fill="#FFD700" opacity="0.9">
              <animate attributeName="r" values="0.6;1.0;0.6" dur="0.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="34" cy="20" r="0.6" fill="#FFD700" opacity="0.9">
              <animate attributeName="r" values="0.6;1.0;0.6" dur="0.5s" repeatCount="indefinite"/>
            </circle>
          </>
        )}

        {emotionState === 'angry' && (
          <>
            <path d="M 12 17 Q 14 14 16 17" stroke="#DC143C" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M 34 17 Q 36 14 38 17" stroke="#DC143C" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="13" cy="18" r="0.4" fill="#DC143C" opacity="0.8"/>
            <circle cx="37" cy="18" r="0.4" fill="#DC143C" opacity="0.8"/>
          </>
        )}
        
        {/* 高気分時のキラキラエフェクト */}
        {(mood >= 80 || emotionState === 'happy') && (
          <>
            <circle cx="14" cy="22" r="0.4" fill="#FFD700" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="36" cy="22" r="0.4" fill="#FFD700" opacity="0.8">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="13" cy="24" r="0.25" fill="#FFD700" opacity="0.6">
              <animate attributeName="r" values="0.25;0.5;0.25" dur="1.8s" repeatCount="indefinite"/>
            </circle>
            <circle cx="37" cy="24" r="0.25" fill="#FFD700" opacity="0.6">
              <animate attributeName="r" values="0.5;0.25;0.5" dur="1.8s" repeatCount="indefinite"/>
            </circle>
          </>
        )}
        
        {/* 低気分時の涙エフェクト */}
        {(mood <= 20 || emotionState === 'sad') && (
          <>
            <path d="M 19 32 Q 21 36 23 32" stroke="#87CEEB" strokeWidth="1.2" fill="none" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite"/>
            </path>
            <circle cx="20" cy="34" r="0.4" fill="#87CEEB" opacity="0.6">
              <animate attributeName="cy" values="34;39;34" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
          </>
        )}
      </svg>
    </div>
  );
};