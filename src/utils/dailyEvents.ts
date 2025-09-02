import { DailyEvent } from '@/types';

type EventTemplate = {
  type: 'school' | 'work' | 'friends' | 'family' | 'hobby' | 'random';
  description: string;
  mood_impact: number;
};

export class DailyEventGenerator {
  private static getSeasonFromDate(date: Date): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';  
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  static generateDailyEvent(occupation: string): DailyEvent | null {
    // 70%の確率でイベントを生成
    if (Math.random() > 0.7) return null;

    const now = new Date();
    const season = this.getSeasonFromDate(now);
    const isStudent = occupation.includes('学生') || occupation.includes('大学');

    let eventTemplates: EventTemplate[] = [];

    if (isStudent) {
      eventTemplates = this.getStudentEvents();
    } else {
      eventTemplates = this.getWorkEvents();
    }

    // 季節イベントを追加
    eventTemplates = [...eventTemplates, ...this.getSeasonalEvents(season)];

    // 友達、家族、趣味、ランダムイベントも追加
    const additionalEvents = [
      ...this.getFriendEvents(),
      ...this.getFamilyEvents(), 
      ...this.getHobbyEvents(),
      ...this.getRandomEvents()
    ];
    eventTemplates = [...eventTemplates, ...additionalEvents];

    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    
    return {
      id: crypto.randomUUID(),
      type: template.type,
      description: template.description,
      mood_impact: template.mood_impact,
      season,
      shareWithUser: Math.random() < 0.8, // 80%の確率で共有
    };
  }

  private static getStudentEvents(): EventTemplate[] {
    return [
      {
        type: 'school' as const,
        description: '今日の授業で先生がおもしろいこと言ってて笑っちゃった😄',
        mood_impact: 3,
      },
      {
        type: 'friends' as const,
        description: '友達とお昼食べてる時に、変な話で盛り上がったよ〜',
        mood_impact: 5,
      },
      {
        type: 'school' as const,
        description: 'レポートの締切がやばくて、ちょっと焦ってる💦',
        mood_impact: -4,
      },
      {
        type: 'friends' as const,
        description: '友達が面白い動画見つけてきて、一緒に見て爆笑したw',
        mood_impact: 6,
      },
      {
        type: 'school' as const,
        description: '図書館で勉強してたら、隣の人のいびきがすごくて集中できなかった😅',
        mood_impact: -2,
      },
      {
        type: 'hobby' as const,
        description: '学食で新しいメニュー食べてみたら、意外と美味しかった！',
        mood_impact: 4,
      },
    ];
  }

  private static getWorkEvents(): EventTemplate[] {
    return [
      {
        type: 'work' as const,
        description: '職場でちょっとしたトラブルがあって疲れた〜😮‍💨',
        mood_impact: -3,
      },
      {
        type: 'work' as const,
        description: '同僚が差し入れくれて嬉しかった✨',
        mood_impact: 4,
      },
      {
        type: 'work' as const,
        description: '会議が思ったより早く終わってラッキー！',
        mood_impact: 3,
      },
      {
        type: 'work' as const,
        description: 'お客さんからお礼を言われて、やりがいを感じた😊',
        mood_impact: 6,
      },
      {
        type: 'work' as const,
        description: '残業でちょっと遅くなっちゃった💦',
        mood_impact: -2,
      },
      {
        type: 'random' as const,
        description: 'コンビニで限定商品見つけて、つい買っちゃった',
        mood_impact: 2,
      },
    ];
  }

  private static getSeasonalEvents(season: 'spring' | 'summer' | 'autumn' | 'winter'): EventTemplate[] {
    const seasonalEvents = {
      spring: [
        {
          type: 'random' as const,
          description: '桜がきれいに咲いてて、写真撮っちゃった🌸',
          mood_impact: 5,
        },
        {
          type: 'random' as const,
          description: '暖かくなってきて、お散歩が気持ちいい♪',
          mood_impact: 4,
        },
        {
          type: 'random' as const,
          description: '花粉がひどくて、ちょっとつらい😤',
          mood_impact: -3,
        },
      ],
      summer: [
        {
          type: 'random' as const,
          description: '今日めちゃくちゃ暑くて、アイス食べたくなった🍦',
          mood_impact: 1,
        },
        {
          type: 'random' as const,
          description: 'プール行きたいなぁ〜って思いながら歩いてた',
          mood_impact: 2,
        },
        {
          type: 'random' as const,
          description: 'エアコンが効いた室内が天国に感じる😌',
          mood_impact: 3,
        },
      ],
      autumn: [
        {
          type: 'random' as const,
          description: '紅葉がきれいで、つい見とれちゃった🍁',
          mood_impact: 4,
        },
        {
          type: 'random' as const,
          description: '焼き芋の匂いがして、秋を感じた〜',
          mood_impact: 3,
        },
        {
          type: 'random' as const,
          description: '朝晩冷えるようになって、温かい飲み物が恋しい☕',
          mood_impact: 2,
        },
      ],
      winter: [
        {
          type: 'random' as const,
          description: '寒すぎて外に出たくない〜😫',
          mood_impact: -2,
        },
        {
          type: 'random' as const,
          description: 'イルミネーションがきれいで、ちょっと幸せな気分✨',
          mood_impact: 5,
        },
        {
          type: 'random' as const,
          description: 'こたつでぬくぬくしてたら動きたくなくなった😴',
          mood_impact: 2,
        },
      ],
    };

    return seasonalEvents[season];
  }

  private static getFriendEvents(): EventTemplate[] {
    return [
      { type: 'friends', description: '久しぶりに友達と会えて楽しかった！💕', mood_impact: 25 },
      { type: 'friends', description: '友達から悩み相談を受けて...少し疲れちゃった', mood_impact: -8 },
      { type: 'friends', description: '友達とカフェに行ったよ☕新しいお店でおしゃれだった！', mood_impact: 18 },
      { type: 'friends', description: '友達がプレゼントをくれた🎁サプライズで嬉しかった', mood_impact: 28 },
      { type: 'friends', description: '友達と映画を見に行ったよ🎬感動して泣いちゃった', mood_impact: 12 },
      { type: 'friends', description: '友達とケンカしちゃって...仲直りしたいな😢', mood_impact: -30 },
      { type: 'friends', description: '友達の誕生日パーティーを企画してるんだ🎂楽しみ！', mood_impact: 20 },
      { type: 'friends', description: '友達とお昼食べてる時に、変な話で盛り上がったよ〜', mood_impact: 5 },
      { type: 'friends', description: '友達が面白い動画見つけてきて、一緒に見て爆笑したw', mood_impact: 6 }
    ];
  }

  private static getFamilyEvents(): EventTemplate[] {
    return [
      { type: 'family', description: '家族と一緒に夕飯を食べたよ🍽️久しぶりにゆっくり話せた', mood_impact: 15 },
      { type: 'family', description: 'お母さんが手作りクッキーを作ってくれた🍪懐かしい味', mood_impact: 20 },
      { type: 'family', description: '妹（弟）とちょっと言い合いになっちゃった...😔', mood_impact: -12 },
      { type: 'family', description: '家族でお出かけしたよ！久しぶりに皆で笑えた😄', mood_impact: 25 },
      { type: 'family', description: 'おじいちゃん（おばあちゃん）から電話がきて、元気そうで安心した', mood_impact: 18 },
      { type: 'family', description: '家の手伝いを頑張ったら、お母さんに褒められた', mood_impact: 10 }
    ];
  }

  private static getHobbyEvents(): EventTemplate[] {
    return [
      { type: 'hobby', description: '今日は趣味の時間がとれて、すごくリフレッシュできた✨', mood_impact: 22 },
      { type: 'hobby', description: '新しい技術を覚えたよ！まだまだ練習が必要だけど', mood_impact: 15 },
      { type: 'hobby', description: '作品が完成した！すごく達成感がある😊', mood_impact: 28 },
      { type: 'hobby', description: '好きなアーティストの新曲が出た🎵気分最高！', mood_impact: 20 },
      { type: 'hobby', description: '読んでた本が面白すぎて、つい夜更かししちゃった📖', mood_impact: -5 },
      { type: 'hobby', description: '料理に挑戦したけど、失敗しちゃった...😅', mood_impact: -8 }
    ];
  }

  private static getRandomEvents(): EventTemplate[] {
    return [
      { type: 'random', description: '今日はなんだか調子がいい感じ！特に理由はないけど😊', mood_impact: 15 },
      { type: 'random', description: '道で可愛い猫を見かけて癒された🐱', mood_impact: 12 },
      { type: 'random', description: '電車で席を譲ってもらって、優しさを感じた', mood_impact: 8 },
      { type: 'random', description: 'コンビニで新商品を見つけて、ちょっと嬉しかった', mood_impact: 5 },
      { type: 'random', description: 'なんだか今日は疲れてる...理由はわからないけど😴', mood_impact: -15 },
      { type: 'random', description: '好きな歌が偶然流れてきて、テンション上がった🎶', mood_impact: 18 }
    ];
  }

  static shouldShareEvent(): boolean {
    // 20%の確率でイベントを会話に組み込む
    return Math.random() < 0.2;
  }

  static getEventToShare(occupation: string): string | null {
    if (!this.shouldShareEvent()) return null;
    
    const event = this.generateDailyEvent(occupation);
    return event ? event.description : null;
  }

  static createEventMessage(event: DailyEvent, characterName: string): string {
    const eventMessages = [
      `ねぇ聞いて！${event.description}`,
      `今日ね、${event.description}`,
      `そうそう、${event.description}`,
      `報告！${event.description}`,
      `${characterName}だよ〜 ${event.description}`
    ];

    return eventMessages[Math.floor(Math.random() * eventMessages.length)];
  }
}