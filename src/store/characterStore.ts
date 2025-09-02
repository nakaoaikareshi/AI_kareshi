import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character, CharacterPersonality, AvatarSettings } from '@/types';

interface CharacterState {
  character: Character | null;
  isCharacterSetup: boolean;
  
  // Actions
  setCharacter: (character: Character) => void;
  updatePersonality: (personality: Partial<CharacterPersonality>) => void;
  updateBasicInfo: (info: Partial<Omit<Character, 'id' | 'personality'>>) => void;
  updateAvatar: (avatar: AvatarSettings) => void;
  clearCharacter: () => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      character: null,
      isCharacterSetup: false,

      setCharacter: (character: Character) => {
        set({ character, isCharacterSetup: true });
      },

      updatePersonality: (personalityUpdate: Partial<CharacterPersonality>) => {
        const currentCharacter = get().character;
        if (currentCharacter) {
          set({
            character: {
              ...currentCharacter,
              personality: {
                ...currentCharacter.personality,
                ...personalityUpdate,
              },
            },
          });
        }
      },

      updateBasicInfo: (infoUpdate: Partial<Omit<Character, 'id' | 'personality'>>) => {
        const currentCharacter = get().character;
        if (currentCharacter) {
          set({
            character: {
              ...currentCharacter,
              ...infoUpdate,
            },
          });
        }
      },

      updateAvatar: (avatar: AvatarSettings) => {
        const currentCharacter = get().character;
        if (currentCharacter) {
          set({
            character: {
              ...currentCharacter,
              avatar,
            },
          });
        }
      },

      clearCharacter: () => {
        set({ character: null, isCharacterSetup: false });
      },
    }),
    {
      name: 'character-storage',
    }
  )
);