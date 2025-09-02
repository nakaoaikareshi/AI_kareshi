import React, { useState, useEffect } from 'react';
import { AvatarSettings } from '@/types';

interface FantasyAvatarProps {
  avatar: AvatarSettings;
  size?: 'small' | 'medium' | 'large';
  mood?: number;
  isSpeaking?: boolean;
  isBlinking?: boolean;
  emotionState?: 'happy' | 'sad' | 'surprised' | 'angry' | 'love' | 'normal';
}

export const FantasyAvatar: React.FC<FantasyAvatarProps> = ({ 
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
  const [hairFloat, setHairFloat] = useState(0);

  const sizeMap = {
    small: { width: 100, height: 150, scale: 0.5 },
    medium: { width: 200, height: 300, scale: 1 },
    large: { width: 300, height: 450, scale: 1.5 },
  };

  const { width, height, scale } = sizeMap[size];

  // アニメーション
  useEffect(() => {
    if (!isBlinking) return;
    const blinkInterval = setInterval(() => {
      setCurrentBlink(true);
      setTimeout(() => setCurrentBlink(false), 120);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, [isBlinking]);

  useEffect(() => {
    if (!isSpeaking) {
      setLipSyncFrame(0);
      return;
    }
    const lipSyncInterval = setInterval(() => {
      setLipSyncFrame(prev => (prev + 1) % 4);
    }, 180);
    return () => clearInterval(lipSyncInterval);
  }, [isSpeaking]);

  useEffect(() => {
    const idleInterval = setInterval(() => {
      setIdleAnimation(prev => {
        const next = (prev + 1) % 360;
        setHairFloat(Math.sin(next * 0.05) * 2);
        return next;
      });
    }, 50);
    return () => clearInterval(idleInterval);
  }, []);

  // FF風の色彩
  const getSkinTone = () => {
    const tones = {
      '#FDBCB4': '#FFE8DC', // より明るく
      '#FFDAB9': '#FFF5EE',
      '#FFE4B5': '#FFF8F0',
      '#F5DEB3': '#FAF0E6',
    };
    return tones[avatar.skinTone as keyof typeof tones] || '#FFE8DC';
  };

  const getHairColor = () => {
    const colors = {
      black: 'url(#blackHairGradient)',
      brown: 'url(#brownHairGradient)', 
      blonde: 'url(#blondeHairGradient)',
      red: 'url(#redHairGradient)',
      blue: 'url(#blueHairGradient)',
      pink: 'url(#pinkHairGradient)',
      silver: 'url(#silverHairGradient)',
      purple: 'url(#purpleHairGradient)',
      white: 'url(#whiteHairGradient)',
      mint: 'url(#mintHairGradient)',
    };
    return colors[avatar.hairColor as keyof typeof colors] || 'url(#brownHairGradient)';
  };

  const getEyeColor = () => {
    const colors = {
      brown: '#8B4513',
      black: '#1C1C1C',
      blue: '#1E90FF',
      green: '#00CED1',
      hazel: '#DAA520',
      violet: '#9370DB',
      amber: '#FFC125',
      crimson: '#DC143C',
    };
    return colors[avatar.eyeColor as keyof typeof colors] || '#8B4513';
  };

  // FF風の表情
  const getExpression = () => {
    if (currentBlink) return { eyeOpen: 0.1, eyeShine: 0 };
    
    switch (emotionState) {
      case 'happy': return { eyeOpen: 0.9, eyeShine: 1.2, mouthCurve: 1.2, blush: 0.6 };
      case 'sad': return { eyeOpen: 0.7, eyeShine: 0.5, mouthCurve: -0.8, blush: 0 };
      case 'surprised': return { eyeOpen: 1.3, eyeShine: 1.5, mouthCurve: 0.3, blush: 0.3 };
      case 'angry': return { eyeOpen: 0.6, eyeShine: 0.8, mouthCurve: -0.5, blush: 0 };
      case 'love': return { eyeOpen: 0.85, eyeShine: 1.8, mouthCurve: 1, blush: 0.8 };
      default: 
        const moodFactor = (mood - 50) / 50;
        return { 
          eyeOpen: 1 + moodFactor * 0.1,
          eyeShine: 1 + moodFactor * 0.3,
          mouthCurve: moodFactor * 0.5,
          blush: Math.max(0, moodFactor * 0.4)
        };
    }
  };

  const expr = getExpression();
  const breathingOffset = Math.sin(idleAnimation * 0.02) * 1.5;

  return (
    <div 
      className="relative"
      style={{
        width, 
        height,
        transform: `scale(${scale}) translateY(${breathingOffset}px)`,
        transition: 'transform 0.15s ease-out'
      }}
    >
      <svg
        width="200"
        height="300"
        viewBox="0 0 200 300"
        className="drop-shadow-2xl"
        style={{ filter: 'contrast(1.1) brightness(1.05)' }}
      >
        <defs>
          {/* FF風グラデーション */}
          <radialGradient id="skinGradient" cx="0.5" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="30%" stopColor={getSkinTone()} />
            <stop offset="100%" stopColor={getSkinTone()} stopOpacity="0.85" />
          </radialGradient>

          {/* 髪のグラデーション - FF風の光沢 */}
          <linearGradient id="blackHairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2C1810" />
            <stop offset="30%" stopColor="#1A0E08" />
            <stop offset="60%" stopColor="#0F0705" />
            <stop offset="90%" stopColor="#2C1810" />
            <stop offset="100%" stopColor="#3D2418" />
          </linearGradient>

          <linearGradient id="blondeHairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF8DC" />
            <stop offset="30%" stopColor="#FFE4B5" />
            <stop offset="60%" stopColor="#F0E68C" />
            <stop offset="90%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>

          <linearGradient id="silverHairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5F5F5" />
            <stop offset="30%" stopColor="#E0E0E0" />
            <stop offset="60%" stopColor="#C0C0C0" />
            <stop offset="90%" stopColor="#D3D3D3" />
            <stop offset="100%" stopColor="#A9A9A9" />
          </linearGradient>

          <linearGradient id="brownHairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B6F47" />
            <stop offset="30%" stopColor="#6B4423" />
            <stop offset="60%" stopColor="#5D4E37" />
            <stop offset="90%" stopColor="#654321" />
            <stop offset="100%" stopColor="#704214" />
          </linearGradient>

          {/* 目の輝き */}
          <radialGradient id="eyeShine" cx="0.3" cy="0.2" r="0.8">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* 影のフィルター */}
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="1" dy="2" result="offsetblur"/>
            <feFlood floodColor="#000000" floodOpacity="0.2"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 背景の光 */}
        <ellipse cx="100" cy="100" rx="95" ry="140" fill="url(#bgGlow)" opacity="0.3" />
        
        {/* 首 */}
        <rect x="88" y="110" width="24" height="25" fill="url(#skinGradient)" />
        <ellipse cx="100" cy="110" rx="12" ry="8" fill="url(#skinGradient)" />

        {/* 顔の基本形状 - FF風の細長い顔 */}
        <path d="M 100 30 Q 130 35 135 65 Q 135 85 130 105 Q 120 120 100 125 Q 80 120 70 105 Q 65 85 65 65 Q 70 35 100 30"
              fill="url(#skinGradient)" filter="url(#softShadow)" />

        {/* 顔の陰影 */}
        <ellipse cx="100" cy="60" rx="28" ry="35" fill="#FFFFFF" opacity="0.15" />
        <ellipse cx="85" cy="95" rx="12" ry="8" fill="#E8A598" opacity="0.15" />
        <ellipse cx="115" cy="95" rx="12" ry="8" fill="#E8A598" opacity="0.15" />

        {/* FF風の華麗な髪 */}
        <g transform={`translate(0, ${hairFloat})`}>
          {avatar.hairStyle === 'long' && (
            <>
              <path d="M 60 40 Q 70 20 100 15 Q 130 20 140 40 Q 140 80 135 120 Q 130 160 125 200 Q 115 210 100 210 Q 85 210 75 200 Q 70 160 65 120 Q 60 80 60 40"
                    fill={getHairColor()} opacity="0.95" />
              <path d="M 65 45 Q 75 25 100 20 Q 125 25 135 45"
                    stroke={getHairColor()} strokeWidth="2" fill="none" opacity="0.7" />
              <path d="M 55 60 Q 50 100 55 150 Q 60 180 65 200"
                    fill={getHairColor()} opacity="0.9" />
              <path d="M 145 60 Q 150 100 145 150 Q 140 180 135 200"
                    fill={getHairColor()} opacity="0.9" />
            </>
          )}
          {avatar.hairStyle === 'short' && (
            <>
              <path d="M 70 45 Q 80 25 100 20 Q 120 25 130 45 Q 130 70 125 85 Q 115 95 100 95 Q 85 95 75 85 Q 70 70 70 45"
                    fill={getHairColor()} opacity="0.95" />
              <path d="M 75 50 Q 85 30 100 25 Q 115 30 125 50"
                    stroke={getHairColor()} strokeWidth="2" fill="none" opacity="0.7" />
            </>
          )}
          {avatar.hairStyle === 'medium' && (
            <>
              <path d="M 65 42 Q 75 22 100 17 Q 125 22 135 42 Q 135 75 130 110 Q 125 130 120 145 Q 110 150 100 150 Q 90 150 80 145 Q 75 130 70 110 Q 65 75 65 42"
                    fill={getHairColor()} opacity="0.95" />
              <path d="M 70 47 Q 80 27 100 22 Q 120 27 130 47"
                    stroke={getHairColor()} strokeWidth="2" fill="none" opacity="0.7" />
            </>
          )}
        </g>

        {/* FF風の大きく美しい目 */}
        <g transform={`scale(1, ${expr.eyeOpen})`} style={{ transformOrigin: '100px 75px' }}>
          {/* 左目 */}
          <ellipse cx="85" cy="75" rx="12" ry="10" fill="white" stroke="#4A5568" strokeWidth="1" />
          <ellipse cx="85" cy="75" rx="9" ry="9" fill={getEyeColor()} />
          <ellipse cx="85" cy="75" rx="5" ry="5" fill="#000000" />
          <ellipse cx="83" cy="73" rx={3 * expr.eyeShine} ry={4 * expr.eyeShine} fill="url(#eyeShine)" />
          <ellipse cx="87" cy="77" rx={1.5 * expr.eyeShine} ry={2 * expr.eyeShine} fill="url(#eyeShine)" />
          
          {/* 右目 */}
          <ellipse cx="115" cy="75" rx="12" ry="10" fill="white" stroke="#4A5568" strokeWidth="1" />
          <ellipse cx="115" cy="75" rx="9" ry="9" fill={getEyeColor()} />
          <ellipse cx="115" cy="75" rx="5" ry="5" fill="#000000" />
          <ellipse cx="113" cy="73" rx={3 * expr.eyeShine} ry={4 * expr.eyeShine} fill="url(#eyeShine)" />
          <ellipse cx="117" cy="77" rx={1.5 * expr.eyeShine} ry={2 * expr.eyeShine} fill="url(#eyeShine)" />
        </g>

        {/* まつ毛 - FF風の長いまつ毛 */}
        <path d="M 73 72 Q 74 70 76 71 M 77 70 Q 78 68 80 69 M 81 69 Q 82 67 84 68"
              stroke="#2C1810" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 103 72 Q 104 70 106 71 M 107 70 Q 108 68 110 69 M 111 69 Q 112 67 114 68"
              stroke="#2C1810" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* 眉毛 - FF風の細く美しい眉 */}
        <path d="M 75 65 Q 85 62 92 65" stroke="#6B4423" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M 108 65 Q 115 62 125 65" stroke="#6B4423" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />

        {/* 鼻 - FF風の繊細な鼻 */}
        <path d="M 98 85 Q 100 90 102 85" stroke="#E8A598" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
        <ellipse cx="97" cy="88" rx="1.5" ry="1" fill="#E8A598" opacity="0.3" />
        <ellipse cx="103" cy="88" rx="1.5" ry="1" fill="#E8A598" opacity="0.3" />

        {/* 口 - FF風の美しい口 */}
        <g transform={`translate(0, ${lipSyncFrame * 2})`}>
          <path d={`M 88 ${98 + expr.mouthCurve * 3} Q 100 ${100 + expr.mouthCurve * 5} 112 ${98 + expr.mouthCurve * 3}`}
                stroke="#DC143C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d={`M 90 ${99 + expr.mouthCurve * 2.5} Q 100 ${100 + expr.mouthCurve * 4} 110 ${99 + expr.mouthCurve * 2.5}`}
                stroke="#FF69B4" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
        </g>

        {/* 頬の赤み */}
        {expr.blush > 0 && (
          <>
            <ellipse cx="70" cy="90" rx="8" ry="5" fill="#FFB6C1" opacity={expr.blush * 0.5} />
            <ellipse cx="130" cy="90" rx="8" ry="5" fill="#FFB6C1" opacity={expr.blush * 0.5} />
          </>
        )}

        {/* 体 - FF風の衣装 */}
        <g transform="translate(0, 5)">
          {/* 肩 */}
          <ellipse cx="65" cy="135" rx="18" ry="12" fill={avatar.topWear === 'elegant' ? '#8B5CF6' : '#4A90E2'} />
          <ellipse cx="135" cy="135" rx="18" ry="12" fill={avatar.topWear === 'elegant' ? '#8B5CF6' : '#4A90E2'} />
          
          {/* 胴体 */}
          <path d="M 65 135 Q 100 125 135 135 L 140 220 Q 100 230 60 220 Z" 
                fill={avatar.topWear === 'elegant' ? '#8B5CF6' : '#4A90E2'} />
          
          {/* 装飾 */}
          <path d="M 75 150 Q 100 145 125 150" stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.8" />
          <circle cx="100" cy="160" r="3" fill="#FFD700" opacity="0.9" />
          <path d="M 80 180 Q 100 175 120 180" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.6" />
        </g>

        {/* 腕 */}
        <ellipse cx="50" cy="160" rx="8" ry="30" fill="url(#skinGradient)" transform="rotate(-15 50 160)" />
        <ellipse cx="150" cy="160" rx="8" ry="30" fill="url(#skinGradient)" transform="rotate(15 150 160)" />
        
        {/* 手 */}
        <ellipse cx="45" cy="190" rx="7" ry="10" fill="url(#skinGradient)" />
        <ellipse cx="155" cy="190" rx="7" ry="10" fill="url(#skinGradient)" />

        {/* 特殊エフェクト - FF風の光 */}
        {emotionState === 'love' && (
          <>
            <circle cx="60" cy="50" r="3" fill="#FF69B4" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="140" cy="50" r="3" fill="#FF69B4" opacity="0.8">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {(mood >= 80 || emotionState === 'happy') && (
          <>
            <circle cx="55" cy="55" r="2" fill="#FFD700" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="145" cy="55" r="2" fill="#FFD700" opacity="0.7">
              <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>
    </div>
  );
};