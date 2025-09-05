export interface DateSpot {
  id: string;
  name: string;
  type: 'restaurant' | 'cafe' | 'park' | 'movie' | 'shopping' | 'aquarium' | 'museum' | 'amusement' | 'beach' | 'home';
  emoji: string;
  description: string;
  cost: number; // 費用（円）
  duration: number; // 所要時間（分）
  moodBoost: number; // 気分上昇値
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'any';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface DatePlan {
  id: string;
  spots: DateSpot[];
  totalCost: number;
  totalDuration: number;
  startTime: Date;
  status: 'planning' | 'ongoing' | 'completed' | 'cancelled';
  memories: DateMemory[];
}

export interface DateMemory {
  spotId: string;
  timestamp: Date;
  description: string;
  emotion: 'happy' | 'excited' | 'romantic' | 'fun' | 'relaxed';
  photo?: string; // Base64画像データ
}

// デートスポットのデータベース
export const dateSpots: DateSpot[] = [
  // レストラン
  {
    id: 'italian_restaurant',
    name: 'イタリアンレストラン',
    type: 'restaurant',
    emoji: '🍝',
    description: 'おしゃれなイタリアンでディナー',
    cost: 6000,
    duration: 90,
    moodBoost: 25,
    timeOfDay: 'evening'
  },
  {
    id: 'ramen_shop',
    name: 'ラーメン屋',
    type: 'restaurant',
    emoji: '🍜',
    description: '美味しいラーメンを食べに行く',
    cost: 2000,
    duration: 60,
    moodBoost: 15,
  },
  {
    id: 'sushi_restaurant',
    name: '回転寿司',
    type: 'restaurant',
    emoji: '🍣',
    description: '回転寿司でお腹いっぱい',
    cost: 3000,
    duration: 60,
    moodBoost: 20,
  },
  
  // カフェ
  {
    id: 'stylish_cafe',
    name: 'おしゃれカフェ',
    type: 'cafe',
    emoji: '☕',
    description: '静かなカフェでまったり',
    cost: 1500,
    duration: 60,
    moodBoost: 15,
    timeOfDay: 'afternoon'
  },
  {
    id: 'cat_cafe',
    name: '猫カフェ',
    type: 'cafe',
    emoji: '🐱',
    description: '猫に癒される時間',
    cost: 2000,
    duration: 90,
    moodBoost: 30,
  },
  
  // 公園・自然
  {
    id: 'park_walk',
    name: '公園散歩',
    type: 'park',
    emoji: '🌳',
    description: '公園でのんびり散歩',
    cost: 0,
    duration: 60,
    moodBoost: 20,
    weather: 'sunny'
  },
  {
    id: 'cherry_blossom',
    name: 'お花見',
    type: 'park',
    emoji: '🌸',
    description: '桜を見ながらピクニック',
    cost: 1000,
    duration: 120,
    moodBoost: 35,
    season: 'spring',
    weather: 'sunny'
  },
  
  // エンタメ
  {
    id: 'movie_theater',
    name: '映画館',
    type: 'movie',
    emoji: '🎬',
    description: '話題の映画を観る',
    cost: 3600,
    duration: 150,
    moodBoost: 25,
  },
  {
    id: 'aquarium',
    name: '水族館',
    type: 'aquarium',
    emoji: '🐠',
    description: '幻想的な水族館デート',
    cost: 4000,
    duration: 180,
    moodBoost: 35,
  },
  {
    id: 'museum',
    name: '美術館',
    type: 'museum',
    emoji: '🎨',
    description: 'アート鑑賞でゆったり',
    cost: 3000,
    duration: 120,
    moodBoost: 20,
  },
  {
    id: 'amusement_park',
    name: '遊園地',
    type: 'amusement',
    emoji: '🎢',
    description: 'スリル満点の一日',
    cost: 8000,
    duration: 360,
    moodBoost: 45,
    weather: 'sunny'
  },
  
  // ショッピング
  {
    id: 'shopping_mall',
    name: 'ショッピング',
    type: 'shopping',
    emoji: '🛍️',
    description: '一緒に買い物',
    cost: 5000,
    duration: 180,
    moodBoost: 25,
  },
  
  // 季節限定
  {
    id: 'beach',
    name: '海水浴',
    type: 'beach',
    emoji: '🏖️',
    description: '夏の海を満喫',
    cost: 3000,
    duration: 240,
    moodBoost: 40,
    season: 'summer',
    weather: 'sunny'
  },
  {
    id: 'illumination',
    name: 'イルミネーション',
    type: 'park',
    emoji: '✨',
    description: 'キラキラのイルミネーション',
    cost: 0,
    duration: 90,
    moodBoost: 30,
    season: 'winter',
    timeOfDay: 'night'
  },
  
  // おうちデート
  {
    id: 'home_movie',
    name: 'おうち映画',
    type: 'home',
    emoji: '🏠',
    description: '家で映画鑑賞',
    cost: 500,
    duration: 150,
    moodBoost: 20,
    weather: 'rainy'
  },
  {
    id: 'cooking_together',
    name: '一緒に料理',
    type: 'home',
    emoji: '👨‍🍳',
    description: '二人で料理を作る',
    cost: 2000,
    duration: 120,
    moodBoost: 30,
  },
];

// 季節を取得
function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// 時間帯を取得
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// おすすめデートスポットを提案
export function suggestDateSpots(
  budget?: number,
  preferredType?: string,
  weather?: string
): DateSpot[] {
  const season = getCurrentSeason();
  const timeOfDay = getTimeOfDay();
  
  let availableSpots = [...dateSpots];
  
  // 季節でフィルター
  availableSpots = availableSpots.filter(spot => 
    !spot.season || spot.season === 'all' || spot.season === season
  );
  
  // 時間帯でフィルター
  availableSpots = availableSpots.filter(spot =>
    !spot.timeOfDay || spot.timeOfDay === timeOfDay
  );
  
  // 天気でフィルター
  if (weather) {
    availableSpots = availableSpots.filter(spot =>
      !spot.weather || spot.weather === 'any' || spot.weather === weather
    );
  }
  
  // 予算でフィルター
  if (budget) {
    availableSpots = availableSpots.filter(spot => spot.cost <= budget);
  }
  
  // タイプでフィルター
  if (preferredType) {
    availableSpots = availableSpots.filter(spot => spot.type === preferredType);
  }
  
  // ランダムに3つ選択
  const shuffled = availableSpots.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// デートプランを作成
export function createDatePlan(spots: DateSpot[]): DatePlan {
  const totalCost = spots.reduce((sum, spot) => sum + spot.cost, 0);
  const totalDuration = spots.reduce((sum, spot) => sum + spot.duration, 0);
  
  return {
    id: `date_${Date.now()}`,
    spots,
    totalCost,
    totalDuration,
    startTime: new Date(),
    status: 'planning',
    memories: []
  };
}

// デート中のメッセージを生成
export function generateDateMessage(
  spot: DateSpot,
  characterName: string,
  emotion: string
): string {
  const messages: { [key: string]: string[] } = {
    restaurant: [
      `${spot.emoji} ${characterName}「すごく美味しそう！何食べる？」`,
      `${spot.emoji} ${characterName}「ここの料理、前から気になってたんだ〜」`,
      `${spot.emoji} ${characterName}「一緒に食べるとより美味しいね💕」`
    ],
    cafe: [
      `${spot.emoji} ${characterName}「落ち着く雰囲気だね〜」`,
      `${spot.emoji} ${characterName}「このコーヒー、すごく香りがいい！」`,
      `${spot.emoji} ${characterName}「ゆっくりお話しできて嬉しい💕」`
    ],
    park: [
      `${spot.emoji} ${characterName}「天気も良くて気持ちいいね！」`,
      `${spot.emoji} ${characterName}「自然の中って癒されるね〜」`,
      `${spot.emoji} ${characterName}「二人で歩くの楽しい💕」`
    ],
    movie: [
      `${spot.emoji} ${characterName}「どの映画観る？楽しみ！」`,
      `${spot.emoji} ${characterName}「ポップコーン買おうか？」`,
      `${spot.emoji} ${characterName}「隣にいてくれて嬉しい💕」`
    ],
    aquarium: [
      `${spot.emoji} ${characterName}「わぁ！魚がキラキラしてきれい！」`,
      `${spot.emoji} ${characterName}「クラゲの水槽、幻想的だね〜」`,
      `${spot.emoji} ${characterName}「一緒に見れて楽しい💕」`
    ],
    amusement: [
      `${spot.emoji} ${characterName}「どのアトラクション乗る？ワクワク！」`,
      `${spot.emoji} ${characterName}「絶叫系大丈夫？一緒なら平気かな💕」`,
      `${spot.emoji} ${characterName}「今日は思いっきり楽しもうね！」`
    ],
    home: [
      `${spot.emoji} ${characterName}「おうちでまったり、いいよね〜」`,
      `${spot.emoji} ${characterName}「二人きりで過ごせて嬉しい💕」`,
      `${spot.emoji} ${characterName}「リラックスできるね」`
    ]
  };
  
  const defaultMessages = [
    `${spot.emoji} ${characterName}「${spot.name}楽しみ！」`,
    `${spot.emoji} ${characterName}「一緒にいられて嬉しい💕」`,
    `${spot.emoji} ${characterName}「今日は楽しもうね！」`
  ];
  
  const typeMessages = messages[spot.type] || defaultMessages;
  return typeMessages[Math.floor(Math.random() * typeMessages.length)];
}

// デートの思い出を作成
export function createDateMemory(
  spot: DateSpot,
  emotion: 'happy' | 'excited' | 'romantic' | 'fun' | 'relaxed'
): DateMemory {
  const descriptions: { [key: string]: string[] } = {
    happy: [
      `${spot.name}で楽しい時間を過ごした`,
      `笑顔がいっぱいの時間だった`,
      `幸せな気持ちになった`
    ],
    excited: [
      `${spot.name}でドキドキした`,
      `ワクワクが止まらなかった`,
      `興奮する体験だった`
    ],
    romantic: [
      `${spot.name}でロマンチックな時間`,
      `二人の距離が縮まった`,
      `特別な思い出になった`
    ],
    fun: [
      `${spot.name}で思いっきり楽しんだ`,
      `たくさん笑った`,
      `最高に楽しかった`
    ],
    relaxed: [
      `${spot.name}でゆったり過ごした`,
      `リラックスできた`,
      `穏やかな時間だった`
    ]
  };
  
  return {
    spotId: spot.id,
    timestamp: new Date(),
    description: descriptions[emotion][Math.floor(Math.random() * descriptions[emotion].length)],
    emotion
  };
}