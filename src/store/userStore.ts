import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface UserState {
  user: User | null;
  isUserSetup: boolean;
  
  // Actions
  setUser: (user: User) => void;
  updateUser: (info: Partial<User>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isUserSetup: false,

      setUser: (user: User) => {
        set({ user, isUserSetup: true });
      },

      updateUser: (userUpdate: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...userUpdate,
            },
          });
        }
      },

      clearUser: () => {
        set({ user: null, isUserSetup: false });
      },
    }),
    {
      name: 'user-storage',
    }
  )
);