/**
 * emotionAnalyzerのテスト
 */

import {
  analyzeEmotionIntensity,
  inferEmotionFromContext,
  smoothEmotionTransition,
  extractKeyEmotions,
  contextualizeEmotion
} from '@/utils/emotionAnalyzer';

describe('analyzeEmotionIntensity', () => {
  it('喜びの感情と強度を正しく分析する', () => {
    const result = analyzeEmotionIntensity('すごく嬉しい！！ありがとう！');
    expect(result.emotion).toBe('happy');
    expect(result.intensity).toBeGreaterThan(70);
  });

  it('悲しみの感情を検出する', () => {
    const result = analyzeEmotionIntensity('悲しいよ...寂しい');
    expect(result.emotion).toBe('sad');
    expect(result.intensity).toBeGreaterThan(50);
  });

  it('怒りの感情を検出する', () => {
    const result = analyzeEmotionIntensity('もう怒った！許さない！');
    expect(result.emotion).toBe('angry');
    expect(result.intensity).toBeGreaterThan(60);
  });

  it('愛情の感情を検出する', () => {
    const result = analyzeEmotionIntensity('大好き！愛してる💕');
    expect(result.emotion).toBe('love');
    expect(result.intensity).toBeGreaterThan(70);
  });

  it('感情が明確でない場合はnormalを返す', () => {
    const result = analyzeEmotionIntensity('今日は良い天気ですね');
    expect(result.emotion).toBe('normal');
    expect(result.intensity).toBe(50);
  });

  it('感嘆符で感情の強度が増加する', () => {
    const result1 = analyzeEmotionIntensity('嬉しい');
    const result2 = analyzeEmotionIntensity('嬉しい！！！');
    expect(result2.intensity).toBeGreaterThan(result1.intensity);
  });
});

describe('inferEmotionFromContext', () => {
  it('文脈から適切な感情を推論する', () => {
    const previousMessages = [
      'プレゼントありがとう',
      'すごく素敵！',
      '大切にするね'
    ];
    const result = inferEmotionFromContext('本当に嬉しい', previousMessages);
    expect(result).toBe('happy');
  });

  it('複数の感情が混在する場合、最も頻度の高い感情を選択する', () => {
    const previousMessages = [
      '嬉しい',
      '楽しい',
      'ありがとう',
      '悲しい'
    ];
    const result = inferEmotionFromContext('どうしよう', previousMessages);
    expect(result).toBe('happy');
  });

  it('文脈がない場合は現在のメッセージから感情を推論する', () => {
    const result = inferEmotionFromContext('驚いた！', []);
    expect(result).toBe('surprised');
  });
});

describe('smoothEmotionTransition', () => {
  it('同じ感情の場合はそのまま返す', () => {
    const result = smoothEmotionTransition('happy', 'happy');
    expect(result).toBe('happy');
  });

  it('normalから他の感情への遷移は即座に行う', () => {
    const result = smoothEmotionTransition('normal', 'happy');
    expect(result).toBe('happy');
  });

  it('他の感情からnormalへの遷移は即座に行う', () => {
    const result = smoothEmotionTransition('sad', 'normal');
    expect(result).toBe('normal');
  });

  it('happyからloveへの自然な遷移を許可する', () => {
    const result = smoothEmotionTransition('happy', 'love');
    expect(result).toBe('love');
  });

  it('sadからangryへの自然な遷移を許可する', () => {
    const result = smoothEmotionTransition('sad', 'angry');
    expect(result).toBe('angry');
  });

  it('happyからangryへの急激な遷移は避ける', () => {
    const result = smoothEmotionTransition('happy', 'angry');
    expect(result).toBe('normal');
  });
});

describe('extractKeyEmotions', () => {
  it('メッセージから主要な感情を抽出する', () => {
    const result = extractKeyEmotions('嬉しいし楽しいけど、少し不安もある');
    expect(result).toContain('happy');
    expect(result).toContain('worried');
  });

  it('重複を除いた感情のリストを返す', () => {
    const result = extractKeyEmotions('嬉しい！本当に嬉しい！');
    expect(result).toEqual(['happy']);
  });
});

describe('contextualizeEmotion', () => {
  it('時間帯によって感情の解釈を調整する', () => {
    const morningResult = contextualizeEmotion('眠い', 'morning');
    const nightResult = contextualizeEmotion('眠い', 'night');
    
    // 朝の「眠い」はnormal、夜の「眠い」もnormalだが文脈が異なる
    expect(morningResult).toBe('normal');
    expect(nightResult).toBe('normal');
  });

  it('興奮状態を適切に検出する', () => {
    const result = contextualizeEmotion('すごい！やった！', 'afternoon');
    expect(result).toBe('excited');
  });
});