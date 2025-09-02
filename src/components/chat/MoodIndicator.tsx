import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { MoodState } from '@/types';
import { MoodSystem } from '@/utils/moodSystem';

interface MoodIndicatorProps {
  moodState: MoodState;
  characterName: string;
}

export const MoodIndicator: React.FC<MoodIndicatorProps> = ({ moodState, characterName }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const moodDescription = MoodSystem.getMoodDescription(moodState.currentMood);
  const moodEmoji = MoodSystem.getMoodEmoji(moodState.currentMood);

  const getMoodColor = (mood: number) => {
    if (mood >= 70) return 'text-green-600 bg-green-50';
    if (mood >= 40) return 'text-blue-600 bg-blue-50';
    if (mood >= 10) return 'text-gray-600 bg-gray-50';
    if (mood >= -20) return 'text-yellow-600 bg-yellow-50';
    if (mood >= -50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getMoodBarWidth = (mood: number) => {
    return Math.max(0, Math.min(100, ((mood + 100) / 200) * 100));
  };

  const getMoodBarColor = (mood: number) => {
    if (mood >= 70) return 'bg-green-400';
    if (mood >= 40) return 'bg-blue-400';
    if (mood >= 10) return 'bg-gray-400';
    if (mood >= -20) return 'bg-yellow-400';
    if (mood >= -50) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{moodEmoji}</span>
          <div>
            <div className="text-sm font-medium text-gray-700">
              {characterName}の今の気分
            </div>
            <div className={`text-xs px-2 py-1 rounded-full inline-block ${getMoodColor(moodState.currentMood)}`}>
              {moodDescription}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          title="詳細を見る"
        >
          <Info size={16} />
        </button>
      </div>

      {/* 気分バー */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getMoodBarColor(moodState.currentMood)}`}
            style={{ width: `${getMoodBarWidth(moodState.currentMood)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>😢</span>
          <span>😐</span>
          <span>😊</span>
        </div>
      </div>

      {/* 詳細情報 */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-600 mb-2">気分に影響している要因:</div>
          <div className="space-y-1">
            {moodState.factors.map((factor, index) => (
              <div key={index} className="text-xs flex items-center justify-between">
                <span className="text-gray-600">{factor.description}</span>
                <span className={`px-1 py-0.5 rounded text-xs ${
                  factor.influence > 0 ? 'text-green-600 bg-green-50' : 
                  factor.influence < 0 ? 'text-red-600 bg-red-50' : 
                  'text-gray-600 bg-gray-50'
                }`}>
                  {factor.influence > 0 ? '+' : ''}{factor.influence}
                </span>
              </div>
            ))}
          </div>
          
          {moodState.cycleDay && (
            <div className="mt-2 text-xs text-gray-500">
              生理周期: {moodState.cycleDay}日目
            </div>
          )}
        </div>
      )}
    </div>
  );
};