import { MoodState, MoodFactor, Character } from '@/types';

export class MoodSystem {
  static calculateCurrentMood(character: Character, lastMoodUpdate?: Date): MoodState {
    const now = new Date();
    const factors: MoodFactor[] = [];
    let currentMood = 50; // Base neutral mood

    // 性別による基本的な気分安定性の違い
    const moodVariability = character.gender === 'boyfriend' ? 0.5 : 1.5; // 彼氏は変動少なめ、彼女は変動大きめ

    // 彼女キャラの生理周期
    if (character.gender === 'girlfriend') {
      const cycleDay = this.getCycleDay(lastMoodUpdate || now);
      const cycleMoodAdjustment = this.getCycleMoodAdjustment(cycleDay);
      
      currentMood += cycleMoodAdjustment;
      factors.push({
        type: 'cycle',
        influence: cycleMoodAdjustment,
        description: `生理周期 (${cycleDay}日目)`,
      });

      // 彼女キャラは気分の起伏が激しい
      if (cycleMoodAdjustment < -10) {
        factors.push({
          type: 'cycle',
          influence: -5,
          description: '感情的になりやすい状態',
        });
        currentMood -= 5;
      }
    } else {
      // 彼氏キャラは基本的に安定
      factors.push({
        type: 'random',
        influence: Math.floor(Math.random() * 6) - 3, // -3～+3の小さな変動
        description: '日常的な気分の微調整',
      });
    }

    // 季節による影響（性別により感受性が違う）
    const seasonMood = this.getSeasonalMood(now);
    const seasonInfluence = Math.floor(seasonMood.influence * moodVariability);
    currentMood += seasonInfluence;
    factors.push({
      type: seasonMood.type,
      influence: seasonInfluence,
      description: seasonMood.description,
    });

    // 天気による影響（彼女キャラの方が敏感）
    const weatherMood = this.getRandomWeatherMood();
    const weatherInfluence = Math.floor(weatherMood.influence * moodVariability);
    currentMood += weatherInfluence;
    factors.push({
      type: weatherMood.type,
      influence: weatherInfluence,
      description: weatherMood.description,
    });

    // ランダムな日常要因（彼女キャラの方が影響を受けやすい）
    const randomChance = character.gender === 'girlfriend' ? 0.4 : 0.2; // 彼女40%、彼氏20%
    if (Math.random() < randomChance) {
      const randomMood = this.getRandomMoodFactor(character.gender);
      const randomInfluence = Math.floor(randomMood.influence * moodVariability);
      currentMood += randomInfluence;
      factors.push({
        type: randomMood.type,
        influence: randomInfluence,
        description: randomMood.description,
      });
    }

    // 気分を-100から100の範囲に制限
    currentMood = Math.max(-100, Math.min(100, currentMood));

    return {
      currentMood,
      lastMoodChange: now,
      cycleDay: character.gender === 'girlfriend' ? this.getCycleDay(lastMoodUpdate || now) : undefined,
      factors,
    };
  }

  private static getCycleDay(baseDate: Date): number {
    const cycleLength = 28; // 28日周期
    const daysSinceStart = Math.floor((Date.now() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSinceStart % cycleLength) + 1;
  }

  private static getCycleMoodAdjustment(cycleDay: number): number {
    // 生理周期による気分変動（医学的に基づいた簡易モデル）
    if (cycleDay >= 1 && cycleDay <= 5) return -15; // 生理期間：気分低下
    if (cycleDay >= 6 && cycleDay <= 13) return 10; // 卵胞期：気分良好
    if (cycleDay >= 14 && cycleDay <= 16) return 5; // 排卵期：少し良い
    if (cycleDay >= 17 && cycleDay <= 24) return 0; // 黄体期前期：普通
    if (cycleDay >= 25 && cycleDay <= 28) return -10; // PMS期：気分やや低下
    return 0;
  }

  private static getSeasonalMood(date: Date): MoodFactor {
    const month = date.getMonth() + 1;
    
    if (month >= 3 && month <= 5) {
      return { type: 'season', influence: 5, description: '春の暖かさ' };
    } else if (month >= 6 && month <= 8) {
      return { type: 'season', influence: -5, description: '夏の暑さ' };
    } else if (month >= 9 && month <= 11) {
      return { type: 'season', influence: 3, description: '秋の心地よさ' };
    } else {
      return { type: 'season', influence: -8, description: '冬の寒さ' };
    }
  }

  private static getRandomWeatherMood(): MoodFactor {
    const weathers = [
      { description: '晴天', influence: 8 },
      { description: '曇り', influence: -3 },
      { description: '雨', influence: -8 },
      { description: '雪', influence: 5 },
      { description: '風が強い', influence: -5 },
    ];
    
    const weather = weathers[Math.floor(Math.random() * weathers.length)];
    return {
      type: 'weather',
      influence: weather.influence,
      description: weather.description,
    };
  }

  private static getRandomMoodFactor(gender: 'boyfriend' | 'girlfriend'): MoodFactor {
    const commonFactors = [
      { description: '友達からの連絡', influence: 8 },
      { description: '好きな歌を聞いた', influence: 6 },
      { description: '美味しいものを食べた', influence: 7 },
      { description: '電車の遅延', influence: -6 },
      { description: 'ちょっとした失敗', influence: -4 },
      { description: '良いニュースを見た', influence: 5 },
      { description: '疲れがたまっている', influence: -8 },
      { description: '新しい発見があった', influence: 6 },
    ];

    const boyfriendFactors = [
      { description: '仕事でちょっとした達成感', influence: 5 },
      { description: '好きなスポーツチームが勝った', influence: 7 },
      { description: '新しいゲームを見つけた', influence: 6 },
      { description: '残業でちょっと疲れた', influence: -3 },
    ];

    const girlfriendFactors = [
      { description: 'ネイルがうまくできた', influence: 8 },
      { description: '可愛い洋服を見つけた', influence: 10 },
      { description: '髪型がうまくきまらない', influence: -8 },
      { description: '友達がSNSで楽しそうで羨ましい', influence: -7 },
      { description: 'ドラマを見て感動して泣いた', influence: 5 },
      { description: 'お気に入りのカフェで美味しいケーキ', influence: 12 },
      { description: '今日の占いが悪かった', influence: -5 },
    ];
    
    const allFactors = [...commonFactors, ...(gender === 'boyfriend' ? boyfriendFactors : girlfriendFactors)];
    const factor = allFactors[Math.floor(Math.random() * allFactors.length)];
    
    return {
      type: 'random',
      influence: factor.influence,
      description: factor.description,
    };
  }

  static getMoodDescription(mood: number): string {
    if (mood >= 70) return '絶好調♪';
    if (mood >= 40) return '元気';
    if (mood >= 10) return '普通';
    if (mood >= -20) return 'ちょっと疲れ気味';
    if (mood >= -50) return '気分が下がってる';
    return 'かなり落ち込んでる';
  }

  static getMoodEmoji(mood: number): string {
    if (mood >= 70) return '😊';
    if (mood >= 40) return '🙂';
    if (mood >= 10) return '😐';
    if (mood >= -20) return '😔';
    if (mood >= -50) return '😞';
    return '😢';
  }
}