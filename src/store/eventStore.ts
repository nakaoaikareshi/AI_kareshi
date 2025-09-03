import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyEvent } from '@/types';

interface EventStore {
  events: DailyEvent[];
  lastEventTime: Date | null;
  eventEnabled: boolean;
  eventFrequency: 'low' | 'medium' | 'high';
  
  addEvent: (event: DailyEvent) => void;
  clearEvents: () => void;
  setEventEnabled: (enabled: boolean) => void;
  setEventFrequency: (frequency: 'low' | 'medium' | 'high') => void;
  updateLastEventTime: () => void;
  getRecentEvents: (count?: number) => DailyEvent[];
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],
      lastEventTime: null,
      eventEnabled: true,
      eventFrequency: 'medium',
      
      addEvent: (event) => set((state) => ({
        events: [...state.events, event].slice(-100), // 最新100件を保持
        lastEventTime: new Date()
      })),
      
      clearEvents: () => set({ events: [], lastEventTime: null }),
      
      setEventEnabled: (enabled) => set({ eventEnabled: enabled }),
      
      setEventFrequency: (frequency) => set({ eventFrequency: frequency }),
      
      updateLastEventTime: () => set({ lastEventTime: new Date() }),
      
      getRecentEvents: (count = 10) => {
        const state = get();
        return state.events.slice(-count);
      },
    }),
    {
      name: 'event-storage',
      partialize: (state) => ({
        events: state.events.slice(-20), // 永続化は最新20件のみ
        lastEventTime: state.lastEventTime,
        eventEnabled: state.eventEnabled,
        eventFrequency: state.eventFrequency,
      }),
    }
  )
);