import { MoodSystem } from '../moodSystem';
import { Character } from '@/types';

const mockCharacter: Character = {
  id: '1',
  name: 'テスト彼女',
  nickname: 'テスト',
  age: 20,
  gender: 'girlfriend',
  personality: 'cheerful',
  appearance: {
    bodyType: 'slim',
    hairColor: 'black',
    hairStyle: 'long',
    eyeColor: 'brown',
    height: 160,
    clothing: 'casual',
  },
  interests: ['reading'],
  occupation: 'student',
  relationshipGoals: ['companionship'],
  communicationStyle: 'friendly',
  personalityTraits: {
    openness: 7,
    conscientiousness: 6,
    extraversion: 8,
    agreeableness: 9,
    neuroticism: 3,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('MoodSystem', () => {
  test('彼女の現在のムードが正しく計算される', () => {
    const moodState = MoodSystem.calculateCurrentMood(mockCharacter);
    
    expect(typeof moodState.currentMood).toBe('number');
    expect(moodState.currentMood).toBeGreaterThanOrEqual(-50);
    expect(moodState.currentMood).toBeLessThanOrEqual(100);
    expect(Array.isArray(moodState.factors)).toBe(true);
  });

  test('彼氏のムードが正しく計算される', () => {
    const boyfriendCharacter = { ...mockCharacter, gender: 'boyfriend' as const };
    const moodState = MoodSystem.calculateCurrentMood(boyfriendCharacter);
    
    expect(typeof moodState.currentMood).toBe('number');
    expect(moodState.currentMood).toBeGreaterThanOrEqual(-50);
    expect(moodState.currentMood).toBeLessThanOrEqual(100);
  });
});