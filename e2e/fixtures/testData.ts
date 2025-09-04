/**
 * E2Eテスト用のテストデータ
 */

export const testCharacter = {
  name: 'テスト太郎',
  nickname: 'たろう',
  age: 25,
  gender: 'boyfriend' as const,
  occupation: 'エンジニア',
  hobbies: ['プログラミング', 'ゲーム', '読書'],
  personality: {
    kindness: 80,
    humor: 60,
    seriousness: 40,
    romance: 70,
    activity: 50,
    honesty: 90,
    empathy: 75,
    intelligence: 85,
    creativity: 65,
    patience: 70,
  },
  relationship: 'boyfriend',
  relationshipLevel: 50,
};

export const testUser = {
  nickname: 'テストユーザー',
  email: 'test@example.com',
  password: 'Test123456!',
};

export const testMessages = [
  'こんにちは！',
  '今日はいい天気だね',
  '何してる？',
  '会いたいな',
  'ありがとう！',
];

export const expectedResponses = {
  greeting: /こんにちは|やあ|hello/i,
  thanks: /どういたしまして|いえいえ|気にしないで/i,
  question: /\?|？/,
};