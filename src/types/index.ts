// AI Character Types
export interface CharacterPersonality {
  kindness: number; // 優しさ (0-100)
  humor: number; // 面白さ (0-100)
  seriousness: number; // 真面目さ (0-100)
  activeness: number; // 積極性 (0-100)
  empathy: number; // 共感力 (0-100)
}

export interface Character {
  id: string;
  name: string; // 本名
  nickname: string; // 呼び名（普段呼ばれる名前）
  gender: 'boyfriend' | 'girlfriend';
  age: number;
  occupation: string;
  hobbies: string[];
  personality: CharacterPersonality;
  avatar?: AvatarSettings;
  voice?: VoiceSettings;
}

// Avatar System Types
export interface AvatarSettings {
  // 顔パーツ
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  eyeShape: string;
  eyebrowStyle: string;
  noseStyle: string;
  mouthStyle: string;
  skinTone: string;
  faceShape: string;
  // 体型
  bodyType: string;
  height: string;
  // 服装
  outfit: string;
  topWear: string;
  bottomWear: string;
  shoes: string;
  // アクセサリー
  accessories: string[];
  jewelry: string[];
  makeup: string[];
  // 3Dモデル
  vrmUrl?: string; // VRMモデルのURL（オプション）
}

// Background System Types
export interface BackgroundSettings {
  type: 'preset' | 'custom' | 'room';
  presetId?: string;
  customUrl?: string;
  roomConfig?: RoomConfiguration;
  blur?: number; // 0-10
  brightness?: number; // 0-100
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface RoomConfiguration {
  wallColor: string;
  floorType: 'wood' | 'carpet' | 'tile';
  floorColor: string;
  furniture: RoomFurniture[];
  decorations: RoomDecoration[];
  lighting: 'warm' | 'cool' | 'natural';
  windowType: 'none' | 'small' | 'large' | 'balcony';
}

export interface RoomFurniture {
  id: string;
  type: 'bed' | 'desk' | 'chair' | 'sofa' | 'shelf' | 'table';
  position: { x: number; y: number; z: number };
  rotation: number;
  color?: string;
}

export interface RoomDecoration {
  id: string;
  type: 'poster' | 'plant' | 'clock' | 'photo' | 'lamp' | 'books';
  position: { x: number; y: number; z: number };
  scale?: number;
}

// Voice Settings Types
export interface VoiceSettings {
  enabled: boolean;
  voiceName?: string;
  rate: number; // 0.5 - 2.0
  pitch: number; // 0.0 - 2.0
  volume: number; // 0.0 - 1.0
}

// Chat Types
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'audio';
  isRead: boolean;
  isUser: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  characterId: string;
  messages: Message[];
  lastActiveAt: Date;
  context: string; // Long-term memory context
}

// User Types
export interface User {
  id: string;
  email: string;
  password?: string; // Optional for client-side (never sent)
  name: string; // ユーザーの名前
  nickname: string; // ユーザーの呼び名（相手に呼んでもらう名前）
  createdAt: Date;
  characters: Character[];
  activeCharacterId?: string;
}

// Mood System
export interface MoodState {
  currentMood: number; // -100 to 100
  lastMoodChange: Date;
  cycleDay?: number; // For girlfriend character cycle
  factors: MoodFactor[];
}

export interface MoodFactor {
  type: 'weather' | 'season' | 'cycle' | 'interaction' | 'random';
  influence: number;
  description: string;
}

// Daily Events
export interface DailyEvent {
  id: string;
  type: 'school' | 'work' | 'friends' | 'family' | 'hobby' | 'random';
  description: string;
  mood_impact: number;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  shareWithUser: boolean;
}

// Store Types (for items shop)
export interface StoreItem {
  id: string;
  name: string;
  category: 'hair' | 'outfit' | 'accessories';
  price: number; // in yen
  imageUrl: string;
  description: string;
  isPremium: boolean;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}