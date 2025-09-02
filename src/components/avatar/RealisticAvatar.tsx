import React, { useState, useEffect } from 'react';
import { AvatarSettings } from '@/types';

interface RealisticAvatarProps {
  avatar: AvatarSettings;
  size?: 'small' | 'medium' | 'large';
  mood?: number;
  isSpeaking?: boolean;
  isBlinking?: boolean;
  emotionState?: 'happy' | 'sad' | 'surprised' | 'angry' | 'love' | 'normal';
}

export const RealisticAvatar: React.FC<RealisticAvatarProps> = ({ 
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

  const sizeMap = {
    small: { width: 80, height: 120, scale: 0.6 },
    medium: { width: 120, height: 180, scale: 1 },
    large: { width: 200, height: 300, scale: 1.6 },
  };

  const { width, height } = sizeMap[size];

  // アニメーション効果
  useEffect(() => {
    if (!isBlinking) return;
    const blinkInterval = setInterval(() => {
      setCurrentBlink(true);
      setTimeout(() => setCurrentBlink(false), 150);
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(blinkInterval);
  }, [isBlinking]);

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

  useEffect(() => {
    const idleInterval = setInterval(() => {
      setIdleAnimation(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(idleInterval);
  }, []);

  const getSkinColor = () => avatar.skinTone || '#FDBCB4';
  const getHairColor = () => {
    const colors = {
      black: '#1A1A1A', brown: '#654321', blonde: '#DAA520',
      red: '#8B0000', blue: '#191970', pink: '#DB7093',
      silver: '#A9A9A9', purple: '#4B0082', white: '#F0F0F0',
      mint: '#7FFFD4'
    };
    return colors[avatar.hairColor as keyof typeof colors] || '#654321';
  };

  const getEyeColor = () => {
    const colors = {
      brown: '#8B4513', black: '#2F2F2F', blue: '#4682B4',
      green: '#228B22', hazel: '#DAA520', violet: '#8A2BE2',
      amber: '#FFBF00', crimson: '#DC143C'
    };
    return colors[avatar.eyeColor as keyof typeof colors] || '#8B4513';
  };

  // リアルな表情計算
  const getRealisticExpression = () => {
    const base = currentBlink ? { eyeHeight: 0.2 } : { eyeHeight: 1 };
    
    switch (emotionState) {
      case 'happy': return { ...base, eyeHeight: base.eyeHeight * 0.8, mouthCurve: 8, browHeight: -2 };
      case 'sad': return { ...base, eyeHeight: base.eyeHeight * 0.6, mouthCurve: -6, browHeight: 3 };
      case 'surprised': return { ...base, eyeHeight: base.eyeHeight * 1.4, mouthCurve: 0, browHeight: -4 };
      case 'angry': return { ...base, eyeHeight: base.eyeHeight * 0.7, mouthCurve: -3, browHeight: 4 };
      case 'love': return { ...base, eyeHeight: base.eyeHeight * 0.9, mouthCurve: 5, browHeight: -1 };
      default: 
        const moodFactor = (mood - 50) / 50;
        return { 
          ...base, 
          eyeHeight: base.eyeHeight * (1 + moodFactor * 0.2),
          mouthCurve: moodFactor * 4,
          browHeight: -moodFactor * 2
        };
    }
  };

  const expr = getRealisticExpression();
  const breathingOffset = Math.sin(idleAnimation * 0.02) * 0.8;

  return (
    <div 
      className="relative"
      style={{
        width, 
        height,
        transform: `translateY(${breathingOffset}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 150"
        className="drop-shadow-xl"
      >
        <defs>
          {/* リアルなグラデーション */}
          <radialGradient id="skinGradient" cx="0.3" cy="0.2" r="1.2">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="40%" stopColor={getSkinColor()} />
            <stop offset="100%" stopColor={getSkinColor()} stopOpacity="0.7" />
          </radialGradient>
          
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={getHairColor()} />
            <stop offset="50%" stopColor={getHairColor()} stopOpacity="0.9" />
            <stop offset="100%" stopColor={getHairColor()} stopOpacity="0.6" />
          </linearGradient>

          <radialGradient id="eyeGradient" cx="0.3" cy="0.2" r="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="30%" stopColor={getEyeColor()} stopOpacity="0.6" />
            <stop offset="70%" stopColor={getEyeColor()} />
            <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
          </radialGradient>
        </defs>

        {/* 頭部 - より大きく、リアルな比率 */}
        <ellipse cx="50" cy="35" rx="20" ry="25" fill="url(#skinGradient)" stroke="#E8A598" strokeWidth="0.5" />
        
        {/* 顔の陰影とハイライト */}
        <ellipse cx="50" cy="30" rx="16" ry="18" fill="#FFFFFF" opacity="0.15" />
        <ellipse cx="45" cy="45" rx="8" ry="4" fill="#E8A598" opacity="0.2" />
        <ellipse cx="55" cy="45" rx="8" ry="4" fill="#E8A598" opacity="0.2" />

        {/* リアルな髪の毛 */}
        {avatar.hairStyle === 'short' && (
          <path d="M 25 20 Q 35 10 50 8 Q 65 10 75 20 Q 75 35 70 45 Q 60 50 50 50 Q 40 50 30 45 Q 25 35 25 20" 
                fill="url(#hairGradient)" stroke={getHairColor()} strokeWidth="0.8" />
        )}
        {avatar.hairStyle === 'medium' && (
          <path d="M 20 18 Q 30 8 50 5 Q 70 8 80 18 Q 80 40 75 55 Q 65 60 50 60 Q 35 60 25 55 Q 20 40 20 18" 
                fill="url(#hairGradient)" stroke={getHairColor()} strokeWidth="0.8" />
        )}
        {avatar.hairStyle === 'long' && (
          <path d="M 15 15 Q 25 5 50 2 Q 75 5 85 15 Q 85 45 80 70 Q 70 75 50 75 Q 30 75 20 70 Q 15 45 15 15" 
                fill="url(#hairGradient)" stroke={getHairColor()} strokeWidth="0.8" />
        )}

        {/* リアルな眉毛 */}
        <path d={`M 35 ${28 + expr.browHeight} Q 40 ${26 + expr.browHeight} 45 ${29 + expr.browHeight}`} 
              stroke="#654321" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d={`M 55 ${29 + expr.browHeight} Q 60 ${26 + expr.browHeight} 65 ${28 + expr.browHeight}`} 
              stroke="#654321" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* リアルな目 */}
        <ellipse cx="42" cy="35" rx="8" ry={6 * expr.eyeHeight} fill="white" stroke="#333" strokeWidth="0.8" />
        <ellipse cx="58" cy="35" rx="8" ry={6 * expr.eyeHeight} fill="white" stroke="#333" strokeWidth="0.8" />
        
        {/* 虹彩 */}
        <ellipse cx="42" cy="35" rx="6" ry={5 * expr.eyeHeight} fill="url(#eyeGradient)" />
        <ellipse cx="58" cy="35" rx="6" ry={5 * expr.eyeHeight} fill="url(#eyeGradient)" />
        
        {/* 瞳孔 */}
        <ellipse cx="42" cy="36" rx="3" ry={3 * expr.eyeHeight} fill="#000" />
        <ellipse cx="58" cy="36" rx="3" ry={3 * expr.eyeHeight} fill="#000" />
        
        {/* リアルなハイライト */}
        <ellipse cx="40" cy="33" rx="2" ry="3" fill="white" opacity="0.9" />
        <ellipse cx="56" cy="33" rx="2" ry="3" fill="white" opacity="0.9" />

        {/* 鼻 - よりリアル */}
        <path d="M 48 42 Q 50 44 52 42" stroke="#E8A598" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="49" cy="44" rx="0.8" ry="0.5" fill="#E8A598" opacity="0.3" />
        <ellipse cx="51" cy="44" rx="0.8" ry="0.5" fill="#E8A598" opacity="0.3" />

        {/* 口 - リアルな形状 */}
        <path d={`M 42 ${50 + expr.mouthCurve} Q 50 ${52 + expr.mouthCurve * 0.5} 58 ${50 + expr.mouthCurve}`} 
              stroke="#CC6677" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={`M 44 ${51 + expr.mouthCurve * 0.8} Q 50 ${52 + expr.mouthCurve * 0.3} 56 ${51 + expr.mouthCurve * 0.8}`} 
              stroke="#FF9999" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />

        {/* 首 */}
        <rect x="45" y="58" width="10" height="12" fill="url(#skinGradient)" stroke="#E8A598" strokeWidth="0.3" />

        {/* 体 - リアルなプロポーション */}
        <path d="M 25 70 Q 50 65 75 70 L 80 110 Q 50 115 20 110 Z" fill="#4A90E2" stroke="#357ABD" strokeWidth="0.8" />
        
        {/* 腕 */}
        <ellipse cx="15" cy="85" rx="6" ry="20" fill="url(#skinGradient)" transform="rotate(-20 15 85)" />
        <ellipse cx="85" cy="85" rx="6" ry="20" fill="url(#skinGradient)" transform="rotate(20 85 85)" />
        
        {/* 手 */}
        <circle cx="8" cy="102" r="5" fill="url(#skinGradient)" stroke="#E8A598" strokeWidth="0.5" />
        <circle cx="92" cy="102" r="5" fill="url(#skinGradient)" stroke="#E8A598" strokeWidth="0.5" />

        {/* 足 */}
        <rect x="40" y="110" width="7" height="25" fill="url(#skinGradient)" />
        <rect x="53" y="110" width="7" height="25" fill="url(#skinGradient)" />

        {/* 靴 */}
        <ellipse cx="43.5" cy="137" rx="5" ry="2.5" fill="#2C3E50" />
        <ellipse cx="56.5" cy="137" rx="5" ry="2.5" fill="#2C3E50" />

        {/* リアルな頬の色 */}
        {mood >= 40 && (
          <>
            <ellipse cx="32" cy="42" rx="3" ry="2" fill="#FFB6C1" opacity="0.4" />
            <ellipse cx="68" cy="42" rx="3" ry="2" fill="#FFB6C1" opacity="0.4" />
          </>
        )}

        {/* 感情による微妙な変化 */}
        {emotionState === 'love' && (
          <>
            <circle cx="25" cy="25" r="1.5" fill="#FF1493" opacity="0.6">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="75" cy="25" r="1.5" fill="#FF1493" opacity="0.6">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
            </circle>
          </>
        )}

        {emotionState === 'happy' && mood >= 70 && (
          <>
            <circle cx="28" cy="28" r="0.8" fill="#FFD700" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="72" cy="28" r="0.8" fill="#FFD700" opacity="0.7">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite"/>
            </circle>
          </>
        )}
      </svg>
    </div>
  );
};