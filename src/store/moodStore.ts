import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MoodState } from '@/types';

interface MoodStoreState {
  moodState: MoodState | null;
  lastMoodUpdate: Date | null;
  
  // Actions
  setMoodState: (mood: MoodState) => void;
  updateLastMoodUpdate: (date: Date) => void;
  clearMood: () => void;
}

export const useMoodStore = create<MoodStoreState>()(
  persist(
    (set) => ({
      moodState: null,
      lastMoodUpdate: null,

      setMoodState: (mood: MoodState) => {
        set({ moodState: mood, lastMoodUpdate: mood.lastMoodChange });
      },

      updateLastMoodUpdate: (date: Date) => {
        set({ lastMoodUpdate: date });
      },

      clearMood: () => {
        set({ moodState: null, lastMoodUpdate: null });
      },
    }),
    {
      name: 'mood-storage',
    }
  )
);