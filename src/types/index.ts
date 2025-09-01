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
}

// Avatar System Types
export interface AvatarSettings {
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  outfit: string;
  accessories: string[];
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