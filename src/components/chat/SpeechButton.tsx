import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { speechSynthesis } from '@/utils/speechSynthesis';
import { useCharacterStore } from '@/store/characterStore';

interface SpeechButtonProps {
  text: string;
  messageId?: string;
}

export const SpeechButton: React.FC<SpeechButtonProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { character } = useCharacterStore();

  useEffect(() => {
    const checkSpeechStatus = () => {
      setIsPlaying(speechSynthesis.isSpeaking());
      setIsPaused(speechSynthesis.isPaused());
    };

    const interval = setInterval(checkSpeechStatus, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSpeak = () => {
    if (isPlaying && !isPaused) {
      speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    } else {
      if (character) {
        speechSynthesis.speakWithPersonality(text, {
          gender: character.gender,
          personality: {
            kindness: character.personality.kindness,
            humor: character.personality.humor,
            seriousness: character.personality.seriousness,
            activeness: character.personality.activeness,
            empathy: character.personality.empathy
          } as any
        }, {
          onStart: () => {
            setIsPlaying(true);
            setIsPaused(false);
          },
          onEnd: () => {
            setIsPlaying(false);
            setIsPaused(false);
          },
          onError: (error) => {
            console.error('Speech synthesis error:', error);
            setIsPlaying(false);
            setIsPaused(false);
          }
        });
      }
    }
  };

  const handleStop = () => {
    speechSynthesis.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!window.speechSynthesis) {
    return null;
  }

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={handleSpeak}
        className={`p-1.5 rounded-full transition-colors ${
          isPlaying 
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }`}
        title={isPlaying ? (isPaused ? '再生' : '一時停止') : '音声再生'}
      >
        {isPlaying ? (
          isPaused ? <Play size={14} /> : <Pause size={14} />
        ) : (
          <Volume2 size={14} />
        )}
      </button>
      
      {isPlaying && (
        <button
          onClick={handleStop}
          className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="停止"
        >
          <VolumeX size={14} />
        </button>
      )}
    </div>
  );
};