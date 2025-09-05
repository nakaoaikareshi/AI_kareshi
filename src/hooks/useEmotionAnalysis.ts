/**
 * 感情分析用カスタムフック
 * メッセージから感情を分析し、適切な感情状態を管理
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  analyzeEmotionIntensity, 
  inferEmotionFromContext, 
  smoothEmotionTransition, 
  EmotionType 
} from '@/utils/emotionAnalyzer';
import { speechSynthesis } from '@/utils/speechSynthesis';

interface UseEmotionAnalysisProps {
  messages: Array<{
    id: string;
    isUser: boolean;
    content: string;
  }>;
}

export const useEmotionAnalysis = ({ messages }: UseEmotionAnalysisProps) => {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('normal');
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 音声合成の状態監視
  useEffect(() => {
    const checkSpeakingStatus = () => {
      setIsSpeaking(speechSynthesis.isSpeaking());
    };

    const interval = setInterval(checkSpeakingStatus, 100);
    return () => clearInterval(interval);
  }, []);

  // 感情分析
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && !lastMessage.isUser) {
      // 過去のメッセージから文脈を取得
      const previousMessages = messages
        .slice(-5, -1)
        .filter(m => !m.isUser)
        .map(m => m.content);
      
      // 感情を分析
      const { emotion, intensity } = analyzeEmotionIntensity(lastMessage.content);
      const contextEmotion = inferEmotionFromContext(lastMessage.content, previousMessages);
      
      // 文脈を考慮した感情を選択
      const finalEmotion = emotion !== 'normal' ? emotion : contextEmotion;
      
      // スムーズな感情遷移
      const newEmotion = smoothEmotionTransition(currentEmotion, finalEmotion);
      
      setCurrentEmotion(newEmotion);
      setEmotionIntensity(intensity);
      
      // 感情の持続時間を強度に応じて調整
      const duration = 3000 + (intensity * 50); // 3秒〜8秒
      setTimeout(() => {
        setCurrentEmotion('normal');
        setEmotionIntensity(50);
      }, duration);
    }
  }, [messages, currentEmotion]);

  const resetEmotion = useCallback(() => {
    setCurrentEmotion('normal');
    setEmotionIntensity(50);
  }, []);

  return {
    currentEmotion,
    emotionIntensity,
    isSpeaking,
    resetEmotion,
  };
};