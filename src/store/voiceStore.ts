import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VoiceStore {
  voiceEnabled: boolean;
  autoPlay: boolean;
  voiceRate: number;
  voicePitch: number;
  voiceVolume: number;
  selectedVoice: string | null;
  
  setVoiceEnabled: (enabled: boolean) => void;
  setAutoPlay: (enabled: boolean) => void;
  setVoiceRate: (rate: number) => void;
  setVoicePitch: (pitch: number) => void;
  setVoiceVolume: (volume: number) => void;
  setSelectedVoice: (voice: string | null) => void;
  resetVoiceSettings: () => void;
}

const defaultSettings = {
  voiceEnabled: false,
  autoPlay: false,
  voiceRate: 1.0,
  voicePitch: 1.0,
  voiceVolume: 0.8,
  selectedVoice: null,
};

export const useVoiceStore = create<VoiceStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
      setAutoPlay: (enabled) => set({ autoPlay: enabled }),
      setVoiceRate: (rate) => set({ voiceRate: Math.max(0.5, Math.min(2, rate)) }),
      setVoicePitch: (pitch) => set({ voicePitch: Math.max(0.5, Math.min(2, pitch)) }),
      setVoiceVolume: (volume) => set({ voiceVolume: Math.max(0, Math.min(1, volume)) }),
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),
      
      resetVoiceSettings: () => set(defaultSettings),
    }),
    {
      name: 'voice-storage',
    }
  )
);