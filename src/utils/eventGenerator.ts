import { DailyEvent } from '@/types';

// 季節判定
function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// 学生向けイベント
const studentEvents: Partial<DailyEvent>[] = [
  // 授業関連
  { type: 'school', description: '今日の数学の授業、すごく難しかった...😅', mood_impact: -10 },
  { type: 'school', description: '英語のテストで良い点取れた！やった〜！✨', mood_impact: 30 },
  { type: 'school', description: '体育の授業でバレーボールやったよ。楽しかった！', mood_impact: 20 },
  { type: 'school', description: '明日テストなのに全然勉強してない...どうしよう💦', mood_impact: -20 },
  { type: 'school', description: '友達にノート見せてもらった。助かった〜！', mood_impact: 15 },
  
  // 友達関連
  { type: 'friends', description: '放課後、友達とカフェに行ってきた☕️', mood_impact: 25 },
  { type: 'friends', description: 'クラスの子と喧嘩しちゃった...', mood_impact: -25 },
  { type: 'friends', description: '友達の誕生日パーティーに招待された！🎉', mood_impact: 30 },
  { type: 'friends', description: '学校の友達とゲームで遊んだ！', mood_impact: 20 },
  
  // 部活・サークル
  { type: 'hobby', description: '部活で先輩に褒められた！嬉しい😊', mood_impact: 25 },
  { type: 'hobby', description: '今日の練習、めっちゃキツかった...', mood_impact: -15 },
  { type: 'hobby', description: '文化祭の準備で忙しい〜！', mood_impact: 10 },
];

// 社会人向けイベント
const workingEvents: Partial<DailyEvent>[] = [
  // 仕事関連
  { type: 'work', description: '今日の会議、長すぎた...疲れた😓', mood_impact: -15 },
  { type: 'work', description: 'プロジェクトが無事に完了した！達成感〜！', mood_impact: 35 },
  { type: 'work', description: '上司に怒られちゃった...', mood_impact: -30 },
  { type: 'work', description: '同僚とランチに行ってきた。美味しかった！', mood_impact: 20 },
  { type: 'work', description: '残業続きで疲れてる...', mood_impact: -20 },
  { type: 'work', description: '給料日だ〜！何買おうかな✨', mood_impact: 40 },
  
  // 同僚関連
  { type: 'friends', description: '会社の飲み会があった。楽しかった！', mood_impact: 25 },
  { type: 'friends', description: '同期と愚痴を言い合った。スッキリした', mood_impact: 15 },
  { type: 'friends', description: '先輩が仕事を手伝ってくれた。優しい...', mood_impact: 20 },
];

// 共通イベント
const commonEvents: Partial<DailyEvent>[] = [
  // 日常生活
  { type: 'random', description: '今日は早起きできた！気持ちいい朝☀️', mood_impact: 15 },
  { type: 'random', description: '電車が遅延してて大変だった...', mood_impact: -15 },
  { type: 'random', description: '美味しいパン屋さん見つけた！🥐', mood_impact: 20 },
  { type: 'random', description: '財布忘れて家に戻った...', mood_impact: -10 },
  { type: 'random', description: 'コンビニで新作スイーツ買った！楽しみ〜', mood_impact: 15 },
  
  // 趣味
  { type: 'hobby', description: '新しいアニメ見始めた！面白い〜', mood_impact: 20 },
  { type: 'hobby', description: 'ゲームで連敗中...悔しい！', mood_impact: -15 },
  { type: 'hobby', description: '読みたかった本やっと買えた！📚', mood_impact: 25 },
  { type: 'hobby', description: 'カラオケ行ってきた！ストレス発散！🎤', mood_impact: 30 },
  
  // 家族
  { type: 'family', description: '家族で外食してきた。久しぶりで楽しかった', mood_impact: 25 },
  { type: 'family', description: '親に小言を言われた...', mood_impact: -20 },
  { type: 'family', description: 'ペットと遊んで癒された〜🐕', mood_impact: 30 },
];

// 季節イベント
const seasonalEvents: { [key: string]: Partial<DailyEvent>[] } = {
  spring: [
    { type: 'random', description: '桜が満開できれい！お花見したいな🌸', mood_impact: 30, season: 'spring' },
    { type: 'random', description: '花粉症がつらい...目がかゆい😭', mood_impact: -20, season: 'spring' },
    { type: 'school', description: '新学期始まった！新しいクラス楽しみ', mood_impact: 25, season: 'spring' },
  ],
  summer: [
    { type: 'random', description: '暑すぎる...エアコンから離れられない🥵', mood_impact: -15, season: 'summer' },
    { type: 'random', description: 'アイス食べた！美味しかった〜🍦', mood_impact: 20, season: 'summer' },
    { type: 'random', description: '花火大会行きたいな〜🎆', mood_impact: 15, season: 'summer' },
    { type: 'random', description: '海に行きたい気分！🏖️', mood_impact: 20, season: 'summer' },
  ],
  autumn: [
    { type: 'random', description: '紅葉がきれい！写真撮りに行きたい🍁', mood_impact: 25, season: 'autumn' },
    { type: 'random', description: '食欲の秋！美味しいもの食べたい🍰', mood_impact: 20, season: 'autumn' },
    { type: 'hobby', description: '読書の秋！本を読むのが楽しい', mood_impact: 20, season: 'autumn' },
  ],
  winter: [
    { type: 'random', description: '寒すぎる...布団から出たくない❄️', mood_impact: -10, season: 'winter' },
    { type: 'random', description: '温かい鍋が美味しい季節！🍲', mood_impact: 25, season: 'winter' },
    { type: 'random', description: 'クリスマス楽しみ〜！🎄', mood_impact: 30, season: 'winter' },
    { type: 'random', description: '初詣行きたいな⛩️', mood_impact: 20, season: 'winter' },
  ],
};

// イベント生成
export function generateDailyEvent(
  occupation: string,
  previousEvents: DailyEvent[] = []
): DailyEvent {
  const isStudent = occupation.includes('学生') || occupation.includes('生徒');
  const currentSeason = getCurrentSeason();
  
  // イベントプールを作成
  let eventPool: Partial<DailyEvent>[] = [...commonEvents];
  
  if (isStudent) {
    eventPool = [...eventPool, ...studentEvents];
  } else {
    eventPool = [...eventPool, ...workingEvents];
  }
  
  // 季節イベントを追加（確率30%）
  if (Math.random() < 0.3) {
    eventPool = [...eventPool, ...seasonalEvents[currentSeason]];
  }
  
  // 直近のイベントと重複しないように選択
  const recentDescriptions = previousEvents.slice(-5).map(e => e.description);
  const availableEvents = eventPool.filter(e => !recentDescriptions.includes(e.description!));
  
  // ランダムに選択
  const selectedEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
  
  // イベントIDを生成して返す
  return {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: selectedEvent.type || 'random',
    description: selectedEvent.description || '',
    mood_impact: selectedEvent.mood_impact || 0,
    season: selectedEvent.season,
    shareWithUser: true,
  } as DailyEvent;
}

// イベントのタイミング判定
export function shouldTriggerEvent(lastEventTime?: Date): boolean {
  if (!lastEventTime) return Math.random() < 0.3; // 初回は30%の確率
  
  const hoursSinceLastEvent = (Date.now() - lastEventTime.getTime()) / (1000 * 60 * 60);
  
  // 最低2時間は間隔を空ける
  if (hoursSinceLastEvent < 2) return false;
  
  // 時間経過に応じて確率を上げる
  const probability = Math.min(0.8, hoursSinceLastEvent * 0.1);
  return Math.random() < probability;
}

// イベントに対するキャラクターのメッセージ生成
export function generateEventMessage(event: DailyEvent, characterName: string): string {
  const prefix = [
    'ねえねえ、聞いて！',
    'あのね、',
    '今日ね、',
    'さっき、',
    'そういえば、',
  ];
  
  const selectedPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  return `${selectedPrefix}${event.description}`;
}

// イベントに対する返答候補
export function generateEventResponses(event: DailyEvent): string[] {
  const responses: string[] = [];
  
  if (event.mood_impact > 20) {
    responses.push(
      'よかったね！',
      'すごい！おめでとう！',
      'それは嬉しいね〜',
      '楽しそう！',
      'いいなぁ〜'
    );
  } else if (event.mood_impact < -20) {
    responses.push(
      '大丈夫？',
      'それは大変だったね...',
      '頑張ったね',
      'お疲れ様...',
      '心配だな...'
    );
  } else {
    responses.push(
      'そうなんだ！',
      'へぇ〜',
      'なるほどね',
      'それで？',
      'ふむふむ'
    );
  }
  
  return responses;
}