import { MoodState, MoodFactor, Character } from '@/types';

export class MoodSystem {
  static calculateCurrentMood(character: Character, lastMoodUpdate?: Date): MoodState {
    const now = new Date();
    const factors: MoodFactor[] = [];
    let currentMood = 50; // Base neutral mood

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
    }

    // 季節による影響
    const seasonMood = this.getSeasonalMood(now);
    currentMood += seasonMood.influence;
    factors.push(seasonMood);

    // 天気による影響（シンプルな確率ベース）
    const weatherMood = this.getRandomWeatherMood();
    currentMood += weatherMood.influence;
    factors.push(weatherMood);

    // ランダムな日常要因
    if (Math.random() < 0.3) { // 30%の確率でランダム要因
      const randomMood = this.getRandomMoodFactor();
      currentMood += randomMood.influence;
      factors.push(randomMood);
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

  private static getRandomMoodFactor(): MoodFactor {
    const randomFactors = [
      { description: '友達からの連絡', influence: 8 },
      { description: '好きな歌を聞いた', influence: 6 },
      { description: '美味しいものを食べた', influence: 7 },
      { description: '電車の遅延', influence: -6 },
      { description: 'ちょっとした失敗', influence: -4 },
      { description: '良いニュースを見た', influence: 5 },
      { description: '疲れがたまっている', influence: -8 },
      { description: '新しい発見があった', influence: 6 },
    ];
    
    const factor = randomFactors[Math.floor(Math.random() * randomFactors.length)];
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