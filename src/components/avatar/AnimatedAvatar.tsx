import React, { useState, useEffect } from 'react';
import { AvatarSettings } from '@/types';
import { AnimeAvatar } from './AnimeAvatar';

interface AnimatedAvatarProps {
  avatar: AvatarSettings;
  size?: 'small' | 'medium' | 'large';
  mood?: number;
  isSpeaking?: boolean;
  isBlinking?: boolean;
}

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ 
  avatar, 
  size = 'medium',
  mood = 50,
  isSpeaking = false,
  isBlinking = true
}) => {
  const [currentMood, setCurrentMood] = useState(mood);
  const [isEyesClosed, setIsEyesClosed] = useState(false);
  const [mouthAnimation, setMouthAnimation] = useState(0);

  // まばたきアニメーション
  useEffect(() => {
    if (!isBlinking) return;

    const blinkInterval = setInterval(() => {
      setIsEyesClosed(true);
      setTimeout(() => setIsEyesClosed(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [isBlinking]);

  // 話している時のアニメーション
  useEffect(() => {
    if (!isSpeaking) {
      setMouthAnimation(0);
      return;
    }

    const speakInterval = setInterval(() => {
      setMouthAnimation(prev => (prev + 1) % 3);
      // 話している時は少し気分を上げる
      setCurrentMood(Math.min(mood + 15, 90));
    }, 300);

    return () => {
      clearInterval(speakInterval);
      setCurrentMood(mood);
      setMouthAnimation(0);
    };
  }, [isSpeaking, mood]);

  // 感情の微細な変動
  useEffect(() => {
    const emotionInterval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 10;
      setCurrentMood(Math.max(0, Math.min(100, mood + variation)));
    }, 5000);

    return () => clearInterval(emotionInterval);
  }, [mood]);

  const animatedMood = isEyesClosed ? Math.max(currentMood - 20, 0) : currentMood;
  const speakingMood = isSpeaking ? Math.min(animatedMood + 10, 100) : animatedMood;

  return (
    <div className={`relative ${isSpeaking ? 'animate-pulse' : ''}`}>
      <AnimeAvatar 
        avatar={avatar}
        size={size}
        mood={speakingMood}
      />
      
      {/* 話している時のエフェクト */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-10 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-purple-400 opacity-5 animate-pulse"></div>
        </>
      )}
      
      {/* 気分による追加エフェクト */}
      {currentMood >= 80 && (
        <div className="absolute -top-2 -right-2 text-yellow-400 animate-bounce">
          ✨
        </div>
      )}
      
      {currentMood <= 20 && (
        <div className="absolute -top-2 -left-2 text-blue-400 animate-pulse">
          💧
        </div>
      )}
    </div>
  );
};