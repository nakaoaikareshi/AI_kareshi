/**
 * 気分状態管理用カスタムフック
 * キャラクターの気分を管理
 */

import { useState, useCallback, useEffect } from 'react';
import { MoodState } from '@/types';
import { Character } from '@/types';

interface UseMoodStateProps {
  character: Character | null;
}

export const useMoodState = ({ character }: UseMoodStateProps) => {
  const [moodState, setMoodState] = useState<MoodState | null>(null);

  const fetchMoodState = useCallback(async () => {
    if (!character) return;
    
    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ character }),
      });
      
      const data = await response.json();
      if (data.success) {
        setMoodState(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch mood state:', error);
    }
  }, [character]);

  // Load mood state when character changes
  useEffect(() => {
    if (character) {
      fetchMoodState();
    }
  }, [character, fetchMoodState]);

  return {
    moodState,
    fetchMoodState,
  };
};