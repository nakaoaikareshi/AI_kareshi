/**
 * characterStoreのテスト
 */

import { renderHook, act } from '@testing-library/react';
import { useCharacterStore } from '@/store/characterStore';
import { Character } from '@/types';

describe('characterStore', () => {
  beforeEach(() => {
    // ストアをリセット
    useCharacterStore.setState({
      character: null,
      characters: [],
      isLoading: false,
      error: null,
    });
  });

  it('初期状態が正しい', () => {
    const { result } = renderHook(() => useCharacterStore());
    
    expect(result.current.character).toBeNull();
    expect(result.current.characters).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('setCharacterでキャラクターを設定できる', () => {
    const { result } = renderHook(() => useCharacterStore());
    
    const testCharacter: Character = {
      id: '1',
      nickname: 'テスト太郎',
      age: 20,
      gender: 'boyfriend',
      occupation: '学生',
      personality: {
        kindness: 80,
        humor: 60,
        seriousness: 40,
        romance: 70,
        activity: 50,
        honesty: 90,
        empathy: 75,
        intelligence: 65,
        creativity: 55,
        patience: 70,
      },
      relationship: 'boyfriend',
      relationshipLevel: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    act(() => {
      result.current.setCharacter(testCharacter);
    });
    
    expect(result.current.character).toEqual(testCharacter);
  });

  it('updatePersonalityで性格を更新できる', () => {
    const { result } = renderHook(() => useCharacterStore());
    
    const initialCharacter: Character = {
      id: '1',
      nickname: 'テスト太郎',
      age: 20,
      gender: 'boyfriend',
      occupation: '学生',
      personality: {
        kindness: 50,
        humor: 50,
        seriousness: 50,
        romance: 50,
        activity: 50,
        honesty: 50,
        empathy: 50,
        intelligence: 50,
        creativity: 50,
        patience: 50,
      },
      relationship: 'boyfriend',
      relationshipLevel: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    act(() => {
      result.current.setCharacter(initialCharacter);
    });
    
    const updatedPersonality = {
      kindness: 80,
      humor: 70,
    };
    
    act(() => {
      result.current.updatePersonality(updatedPersonality);
    });
    
    expect(result.current.character?.personality.kindness).toBe(80);
    expect(result.current.character?.personality.humor).toBe(70);
    expect(result.current.character?.personality.seriousness).toBe(50); // 変更されていない
  });

  it('setLoadingでローディング状態を設定できる', () => {
    const { result } = renderHook(() => useCharacterStore());
    
    expect(result.current.isLoading).toBe(false);
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('setErrorでエラーを設定できる', () => {
    const { result } = renderHook(() => useCharacterStore());
    
    expect(result.current.error).toBeNull();
    
    act(() => {
      result.current.setError('エラーが発生しました');
    });
    
    expect(result.current.error).toBe('エラーが発生しました');
  });

  it('clearErrorでエラーをクリアできる', () => {
    const { result } = renderHook(() => useCharacterStore());
    
    act(() => {
      result.current.setError('エラー');
    });
    
    expect(result.current.error).toBe('エラー');
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('setCharactersで複数のキャラクターを設定できる', () => {
    const { result } = renderHook(() => useCharacterStore());
    
    const characters: Character[] = [
      {
        id: '1',
        nickname: 'キャラ1',
        age: 20,
        gender: 'boyfriend',
        occupation: '学生',
        personality: {
          kindness: 50,
          humor: 50,
          seriousness: 50,
          romance: 50,
          activity: 50,
          honesty: 50,
          empathy: 50,
          intelligence: 50,
          creativity: 50,
          patience: 50,
        },
        relationship: 'boyfriend',
        relationshipLevel: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        nickname: 'キャラ2',
        age: 22,
        gender: 'girlfriend',
        occupation: 'OL',
        personality: {
          kindness: 60,
          humor: 60,
          seriousness: 60,
          romance: 60,
          activity: 60,
          honesty: 60,
          empathy: 60,
          intelligence: 60,
          creativity: 60,
          patience: 60,
        },
        relationship: 'girlfriend',
        relationshipLevel: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    act(() => {
      result.current.setCharacters(characters);
    });
    
    expect(result.current.characters).toHaveLength(2);
    expect(result.current.characters[0].nickname).toBe('キャラ1');
    expect(result.current.characters[1].nickname).toBe('キャラ2');
  });
});