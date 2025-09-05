import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BackgroundSettings, RoomConfiguration } from '@/types';

interface BackgroundStore {
  background: BackgroundSettings;
  setBackground: (background: BackgroundSettings) => void;
  setBackgroundType: (type: 'preset' | 'custom' | 'room') => void;
  setPresetBackground: (presetId: string) => void;
  setRoomConfig: (config: RoomConfiguration) => void;
  updateRoomWallColor: (color: string) => void;
  updateRoomFloorType: (type: 'wood' | 'carpet' | 'tile') => void;
  updateRoomLighting: (lighting: 'warm' | 'cool' | 'natural') => void;
}

const defaultRoomConfig: RoomConfiguration = {
  wallColor: '#F5F5F5',
  floorType: 'wood',
  floorColor: '#8B4513',
  furniture: [],
  decorations: [],
  lighting: 'warm',
  windowType: 'large',
};

const defaultBackground: BackgroundSettings = {
  type: 'preset',
  presetId: 'bedroom',
  blur: 0,
  brightness: 100,
  timeOfDay: 'afternoon',
  roomConfig: defaultRoomConfig,
};

export const useBackgroundStore = create<BackgroundStore>()(
  persist(
    (set) => ({
      background: defaultBackground,
      
      setBackground: (background) => set({ background }),
      
      setBackgroundType: (type) => 
        set((state) => ({
          background: { ...state.background, type }
        })),
      
      setPresetBackground: (presetId) =>
        set((state) => ({
          background: { 
            ...state.background, 
            type: 'preset',
            presetId 
          }
        })),
      
      setRoomConfig: (roomConfig) =>
        set((state) => ({
          background: { 
            ...state.background,
            type: 'room',
            roomConfig 
          }
        })),
      
      updateRoomWallColor: (color) =>
        set((state) => ({
          background: {
            ...state.background,
            roomConfig: state.background.roomConfig 
              ? { ...state.background.roomConfig, wallColor: color }
              : { ...defaultRoomConfig, wallColor: color }
          }
        })),
      
      updateRoomFloorType: (type) =>
        set((state) => ({
          background: {
            ...state.background,
            roomConfig: state.background.roomConfig
              ? { ...state.background.roomConfig, floorType: type }
              : { ...defaultRoomConfig, floorType: type }
          }
        })),
      
      updateRoomLighting: (lighting) =>
        set((state) => ({
          background: {
            ...state.background,
            roomConfig: state.background.roomConfig
              ? { ...state.background.roomConfig, lighting }
              : { ...defaultRoomConfig, lighting }
          }
        })),
    }),
    {
      name: 'background-storage',
    }
  )
);