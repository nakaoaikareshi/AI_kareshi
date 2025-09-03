import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DatePlan, DateSpot, DateMemory } from '@/utils/dateSystem';

interface DateStore {
  currentDatePlan: DatePlan | null;
  dateHistory: DatePlan[];
  totalDatesCount: number;
  favoriteSpots: string[]; // お気に入りスポットのID
  
  // デート管理
  startDate: (plan: DatePlan) => void;
  endDate: () => void;
  cancelDate: () => void;
  updateDateStatus: (status: 'planning' | 'ongoing' | 'completed' | 'cancelled') => void;
  
  // メモリー管理
  addMemory: (memory: DateMemory) => void;
  
  // お気に入り管理
  addFavoriteSpot: (spotId: string) => void;
  removeFavoriteSpot: (spotId: string) => void;
  
  // 統計
  getTotalSpentAmount: () => number;
  getMostVisitedSpot: () => string | null;
}

export const useDateStore = create<DateStore>()(
  persist(
    (set, get) => ({
      currentDatePlan: null,
      dateHistory: [],
      totalDatesCount: 0,
      favoriteSpots: [],
      
      startDate: (plan) => set((state) => ({
        currentDatePlan: { ...plan, status: 'ongoing' },
        totalDatesCount: state.totalDatesCount + 1
      })),
      
      endDate: () => set((state) => {
        if (!state.currentDatePlan) return state;
        
        const completedPlan = {
          ...state.currentDatePlan,
          status: 'completed' as const
        };
        
        return {
          currentDatePlan: null,
          dateHistory: [...state.dateHistory, completedPlan].slice(-50) // 最新50件を保持
        };
      }),
      
      cancelDate: () => set((state) => ({
        currentDatePlan: state.currentDatePlan 
          ? { ...state.currentDatePlan, status: 'cancelled' as const }
          : null
      })),
      
      updateDateStatus: (status) => set((state) => ({
        currentDatePlan: state.currentDatePlan
          ? { ...state.currentDatePlan, status }
          : null
      })),
      
      addMemory: (memory) => set((state) => {
        if (!state.currentDatePlan) return state;
        
        return {
          currentDatePlan: {
            ...state.currentDatePlan,
            memories: [...state.currentDatePlan.memories, memory]
          }
        };
      }),
      
      addFavoriteSpot: (spotId) => set((state) => ({
        favoriteSpots: state.favoriteSpots.includes(spotId)
          ? state.favoriteSpots
          : [...state.favoriteSpots, spotId]
      })),
      
      removeFavoriteSpot: (spotId) => set((state) => ({
        favoriteSpots: state.favoriteSpots.filter(id => id !== spotId)
      })),
      
      getTotalSpentAmount: () => {
        const state = get();
        return state.dateHistory
          .filter(plan => plan.status === 'completed')
          .reduce((total, plan) => total + plan.totalCost, 0);
      },
      
      getMostVisitedSpot: () => {
        const state = get();
        const spotCounts: { [key: string]: number } = {};
        
        state.dateHistory
          .filter(plan => plan.status === 'completed')
          .forEach(plan => {
            plan.spots.forEach(spot => {
              spotCounts[spot.id] = (spotCounts[spot.id] || 0) + 1;
            });
          });
        
        const entries = Object.entries(spotCounts);
        if (entries.length === 0) return null;
        
        const [mostVisited] = entries.reduce((max, current) => 
          current[1] > max[1] ? current : max
        );
        
        return mostVisited;
      }
    }),
    {
      name: 'date-storage',
      partialize: (state) => ({
        dateHistory: state.dateHistory.slice(-20), // 永続化は最新20件
        totalDatesCount: state.totalDatesCount,
        favoriteSpots: state.favoriteSpots
      })
    }
  )
);