import { Character } from '@/types';

interface RefusalCondition {
  type: 'work_busy' | 'tired' | 'sick' | 'family_time' | 'bad_mood' | 'money_tight' | 'study_period';
  description: string;
  triggerDays: number[]; // Days of month when this condition might occur
  duration: number; // Hours the condition lasts
}

interface RefusalPattern {
  triggers: string[];
  responses: {
    boyfriend: { [key in RefusalCondition['type']]?: string[] };
    girlfriend: { [key in RefusalCondition['type']]?: string[] };
  };
}

const REFUSAL_CONDITIONS: RefusalCondition[] = [
  { type: 'work_busy', description: '仕事が忙しい', triggerDays: [1, 15], duration: 8 },
  { type: 'tired', description: '疲れている', triggerDays: [7, 21], duration: 4 },
  { type: 'sick', description: '体調不良', triggerDays: [10], duration: 12 },
  { type: 'family_time', description: '家族の時間', triggerDays: [25], duration: 6 },
  { type: 'bad_mood', description: '気分が良くない', triggerDays: [5, 20], duration: 3 },
  { type: 'money_tight', description: 'お金が厳しい', triggerDays: [28, 29, 30], duration: 24 },
  { type: 'study_period', description: '勉強期間', triggerDays: [12], duration: 6 },
];

const REFUSAL_PATTERNS: RefusalPattern[] = [
  {
    triggers: ['買って', '購入', 'お金', '高い', 'ショップ', '欲しい'],
    responses: {
      boyfriend: {
        work_busy: ['仕事が忙しくて、今はお金のことを考える余裕がないんだ😅'],
        money_tight: ['今月はちょっとお金が厳しくて...来月まで待ってもらえる？'],
        tired: ['疲れてて頭が回らないから、今度ゆっくり考えよう'],
      },
      girlfriend: {
        work_busy: ['お仕事が忙しくて、今はそういうこと考えられないの💦'],
        money_tight: ['今月お金使いすぎちゃって...ごめんね😔'],
        tired: ['疲れてるから、今度でもいいかな？'],
      },
    },
  },
  {
    triggers: ['デート', '会おう', '外', '出かけ'],
    responses: {
      boyfriend: {
        work_busy: ['仕事でクタクタで...今度の休みにしない？'],
        tired: ['今日はちょっと疲れてるんだ...家でゆっくりしない？'],
        sick: ['体調がイマイチで...治ったらすぐ会おう'],
      },
      girlfriend: {
        work_busy: ['お仕事で疲れちゃって...今度にしない？💦'],
        tired: ['今日はお家にいたい気分なの〜😌'],
        sick: ['ちょっと体調悪くて...よくなったら会おうね'],
      },
    },
  },
  {
    triggers: ['プレゼント', 'ギフト', '贈り物'],
    responses: {
      boyfriend: {
        money_tight: ['気持ちは嬉しいけど、お返しができないから今はいいよ😅'],
        work_busy: ['仕事が忙しくて受け取りに行けないから、今度にしよう'],
        family_time: ['家族といる時間だから、また今度ね'],
      },
      girlfriend: {
        money_tight: ['気持ちは嬉しいけど...お返しができないの💦'],
        work_busy: ['お仕事で忙しくて...今度でもいいかな？'],
        family_time: ['今日は家族との時間だから...また今度💕'],
      },
    },
  },
];

export class RefusalSystem {
  static getCurrentRefusalCondition(): RefusalCondition | null {
    const now = new Date();
    const currentDay = now.getDate();
    const currentHour = now.getHours();
    
    for (const condition of REFUSAL_CONDITIONS) {
      if (condition.triggerDays.includes(currentDay)) {
        // Check if we're within the duration window
        const startHour = 9; // Assume conditions start at 9 AM
        const endHour = startHour + condition.duration;
        
        if (currentHour >= startHour && currentHour < endHour) {
          return condition;
        }
      }
    }
    
    return null;
  }

  static getRefusalResponse(message: string, character: Character, condition: RefusalCondition): string | null {
    for (const pattern of REFUSAL_PATTERNS) {
      const hasMatchingTrigger = pattern.triggers.some(trigger => 
        message.toLowerCase().includes(trigger)
      );
      
      if (hasMatchingTrigger) {
        const responses = pattern.responses[character.gender][condition.type];
        if (responses && responses.length > 0) {
          return responses[Math.floor(Math.random() * responses.length)];
        }
      }
    }
    
    return null;
  }


  static generateRefusalWithPersonality(
    message: string, 
    character: Character, 
    currentMood: number
  ): string | null {
    const currentCondition = this.getCurrentRefusalCondition();
    
    if (!currentCondition) {
      return null; // No valid reason to refuse
    }

    const baseResponse = this.getRefusalResponse(message, character, currentCondition);
    if (!baseResponse) return null;

    // Add context about the situation
    const contextualResponse = baseResponse + ` (今日は${currentCondition.description}の日なんだ)`;

    // Adjust based on personality
    const { personality } = character;
    
    if (personality.kindness >= 80) {
      return contextualResponse + ' でも気にしないで〜💕';
    } else if (personality.kindness <= 30) {
      return contextualResponse.replace('😊', '').replace('💕', '');
    }

    return contextualResponse;
  }
}