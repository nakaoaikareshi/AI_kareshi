import React, { useState } from 'react';
import { Character } from '@/types';

interface SimpleAvatarProps {
  character: Character;
  className?: string;
}

interface AvatarParts {
  hairStyle: 'short' | 'long' | 'medium' | 'curly';
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'blue';
  eyeColor: 'brown' | 'blue' | 'green' | 'black';
  outfit: 'casual' | 'formal' | 'sport' | 'cute';
  expression: 'happy' | 'normal' | 'sad' | 'excited';
}

export const SimpleAvatar: React.FC<SimpleAvatarProps> = ({ character, className = '' }) => {
  const [parts, setParts] = useState<AvatarParts>({
    hairStyle: 'medium',
    hairColor: 'brown',
    eyeColor: 'brown',
    outfit: 'casual',
    expression: 'happy',
  });

  const getHairPath = () => {
    const styles = {
      short: 'M60,40 Q80,20 100,40 Q120,20 140,40 L140,80 L60,80 Z',
      long: 'M50,30 Q80,10 110,30 Q140,10 150,40 L150,120 Q140,130 100,125 Q60,130 50,120 Z',
      medium: 'M55,35 Q80,15 105,35 Q130,15 145,40 L145,100 L55,100 Z',
      curly: 'M60,35 Q70,15 85,25 Q100,10 115,25 Q130,15 140,35 L140,95 Q130,105 100,100 Q70,105 60,95 Z',
    };
    return styles[parts.hairStyle];
  };

  const getHairColor = () => {
    const colors = {
      black: '#2d2d2d',
      brown: '#8b4513',
      blonde: '#ffd700',
      red: '#cd853f',
      blue: '#4169e1',
    };
    return colors[parts.hairColor];
  };

  const getEyeColor = () => {
    const colors = {
      brown: '#8b4513',
      blue: '#4169e1',
      green: '#228b22',
      black: '#2d2d2d',
    };
    return colors[parts.eyeColor];
  };

  const getExpression = () => {
    const expressions = {
      happy: { mouth: 'M75,110 Q100,125 125,110', eyeHeight: 8 },
      normal: { mouth: 'M80,115 L120,115', eyeHeight: 6 },
      sad: { mouth: 'M75,125 Q100,110 125,125', eyeHeight: 4 },
      excited: { mouth: 'M70,110 Q100,130 130,110', eyeHeight: 10 },
    };
    return expressions[parts.expression];
  };

  return (
    <div className={`relative ${className}`}>
      <svg width="200" height="200" viewBox="0 0 200 200" className="w-full h-full">
        {/* Face */}
        <ellipse cx="100" cy="100" rx="45" ry="55" fill="#fdbcb4" />
        
        {/* Hair */}
        <path d={getHairPath()} fill={getHairColor()} />
        
        {/* Eyes */}
        <ellipse cx="85" cy="85" rx="8" ry={getExpression().eyeHeight} fill={getEyeColor()} />
        <ellipse cx="115" cy="85" rx="8" ry={getExpression().eyeHeight} fill={getEyeColor()} />
        
        {/* Eye highlights */}
        <ellipse cx="88" cy="82" rx="2" ry="3" fill="white" />
        <ellipse cx="118" cy="82" rx="2" ry="3" fill="white" />
        
        {/* Nose */}
        <ellipse cx="100" cy="95" rx="2" ry="3" fill="#f4a5a5" />
        
        {/* Mouth */}
        <path d={getExpression().mouth} stroke="#d4827e" strokeWidth="2" fill="none" />
        
        {/* Body/Clothes */}
        <rect x="70" y="145" width="60" height="55" fill={parts.outfit === 'casual' ? '#87ceeb' : '#ff69b4'} rx="10" />
      </svg>
      
      {/* Simple customization */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 hover:opacity-100 transition-opacity">
        <div className="grid grid-cols-2 gap-1">
          <button onClick={() => setParts(prev => ({ ...prev, expression: 'happy' }))}>😊</button>
          <button onClick={() => setParts(prev => ({ ...prev, expression: 'normal' }))}>😐</button>
          <button onClick={() => setParts(prev => ({ ...prev, expression: 'sad' }))}>😢</button>
          <button onClick={() => setParts(prev => ({ ...prev, expression: 'excited' }))}>🤩</button>
        </div>
      </div>
    </div>
  );
};