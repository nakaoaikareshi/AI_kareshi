export type EmotionType = 'happy' | 'sad' | 'surprised' | 'angry' | 'love' | 'shy' | 'excited' | 'worried' | 'normal';

interface EmotionKeywords {
  [key: string]: string[];
}

const emotionKeywords: EmotionKeywords = {
  happy: [
    '嬉しい', 'うれしい', '楽しい', 'たのしい', 'やったー', '最高', 'さいこう',
    'ありがとう', 'わーい', 'イェーイ', 'ラッキー', '幸せ', 'しあわせ',
    '😊', '😃', '😄', '😁', '🎉', '✨', '🌟'
  ],
  love: [
    '好き', 'すき', '愛してる', 'あいしてる', '大好き', 'だいすき', 'ラブ',
    'かわいい', '素敵', 'すてき', 'ドキドキ', '会いたい', 'あいたい',
    '💕', '❤️', '💗', '💖', '😍', '🥰', '💝'
  ],
  sad: [
    '悲しい', 'かなしい', 'つらい', '辛い', '寂しい', 'さみしい', 'さびしい',
    '泣', 'ごめん', 'すまん', '残念', 'ざんねん', 'ショック',
    '😢', '😭', '😔', '😞', '💔', '😿'
  ],
  angry: [
    '怒', 'むかつく', 'ムカつく', 'イライラ', 'いらいら', 'もう', 'ふざけ',
    '許さない', 'ゆるさない', '最悪', 'さいあく', 'ダメ', 'だめ',
    '💢', '😠', '😡', '🤬', '😤', '👿'
  ],
  surprised: [
    'えっ', 'え？', 'まじ', 'マジ', '本当', 'ほんとう', 'ホント',
    'びっくり', 'ビックリ', '驚', 'すごい', 'スゴイ', '信じられない',
    '😲', '😱', '🤯', '😮', '‼️', '⁉️'
  ],
  shy: [
    '恥ずかしい', 'はずかしい', '照れ', 'てれ', 'えへへ', 'もじもじ',
    'ドキドキ', 'どきどき', '////', 'キャー', 'きゃー',
    '😳', '😊', '☺️', '🤭', '💦'
  ],
  excited: [
    'ワクワク', 'わくわく', '楽しみ', 'たのしみ', 'テンション', '盛り上が',
    'やる気', 'ヤル気', '頑張', 'がんば', 'ファイト',
    '🔥', '💪', '✊', '🎯', '⚡', '🚀'
  ],
  worried: [
    '心配', 'しんぱい', '不安', 'ふあん', '大丈夫', 'だいじょうぶ',
    'どうしよう', '困った', 'こまった', '悩', 'なや', 'うーん',
    '😟', '😥', '😰', '🥺', '😨', '💭'
  ]
};

// 感情の強度を計算
export function analyzeEmotionIntensity(text: string): { emotion: EmotionType; intensity: number } {
  let detectedEmotion: EmotionType = 'normal';
  let maxScore = 0;

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += keyword.length > 2 ? 2 : 1; // 長いキーワードは高スコア
      }
    }
    
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion as EmotionType;
    }
  }

  // 強度を0-100の範囲に正規化
  const intensity = Math.min(100, maxScore * 20);

  return { emotion: detectedEmotion, intensity };
}

// 複数の感情を検出
export function detectMultipleEmotions(text: string): Map<EmotionType, number> {
  const emotions = new Map<EmotionType, number>();

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += 1;
      }
    }
    if (score > 0) {
      emotions.set(emotion as EmotionType, score);
    }
  }

  return emotions;
}

// 文脈から感情を推測
export function inferEmotionFromContext(
  currentText: string,
  previousMessages: string[] = []
): EmotionType {
  // 現在のメッセージの感情
  const currentEmotion = analyzeEmotionIntensity(currentText);
  
  // 文脈を考慮した感情分析
  if (previousMessages.length > 0) {
    const contextEmotions = previousMessages
      .slice(-3) // 直近3件のメッセージ
      .map(msg => analyzeEmotionIntensity(msg));
    
    // 会話の流れから感情を調整
    if (currentEmotion.emotion === 'normal' && contextEmotions.some(e => e.emotion === 'happy')) {
      // 前が楽しい雰囲気なら、普通のメッセージも楽しい可能性
      return 'happy';
    }
    
    if (currentEmotion.emotion === 'normal' && contextEmotions.some(e => e.emotion === 'sad')) {
      // 前が悲しい雰囲気なら、心配している可能性
      return 'worried';
    }
  }
  
  return currentEmotion.emotion;
}

// 感情の遷移をスムーズにする
export function smoothEmotionTransition(
  currentEmotion: EmotionType,
  targetEmotion: EmotionType,
  transitionSpeed: number = 0.3
): EmotionType {
  // 感情の相性マップ（遷移しやすい感情の組み合わせ）
  const emotionCompatibility: { [key: string]: string[] } = {
    happy: ['excited', 'love', 'normal'],
    sad: ['worried', 'normal'],
    angry: ['sad', 'normal'],
    surprised: ['happy', 'worried', 'excited'],
    love: ['happy', 'shy', 'normal'],
    shy: ['love', 'happy', 'normal'],
    excited: ['happy', 'surprised'],
    worried: ['sad', 'normal']
  };
  
  // 互換性のある感情への遷移は速く、そうでない場合は遅く
  const isCompatible = emotionCompatibility[currentEmotion]?.includes(targetEmotion);
  
  if (isCompatible || Math.random() < transitionSpeed) {
    return targetEmotion;
  }
  
  return currentEmotion;
}