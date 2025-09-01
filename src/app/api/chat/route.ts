import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Character, CharacterPersonality } from '@/types';
import { MoodSystem } from '@/utils/moodSystem';
import { DailyEventGenerator } from '@/utils/dailyEvents';

// Rate limiting setup
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  record.count++;
  return false;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function generateSystemPrompt(character: Character, userName?: string, currentMood?: number): string {
  const { name, nickname, gender, age, occupation, hobbies, personality } = character;
  
  const genderRole = gender === 'boyfriend' ? '彼氏' : '彼女';
  const personalityText = generatePersonalityDescription(personality);
  const userCallName = userName ? `相手の名前は${userName}です。` : '';
  
  // 気分による会話調整
  const moodText = currentMood ? generateMoodContext(currentMood, gender) : '';
  
  return `あなたは${name}（普段は${nickname}と呼ばれている）という名前の${age}歳の${genderRole}のAIです。職業は${occupation}です。

${userCallName}

性格の特徴:
${personalityText}

趣味: ${hobbies.join('、')}（趣味の話は自然な流れの時だけにして、毎回話題にしないこと）

${moodText}

重要な指示:
1. 日本語で自然に会話してください
2. ${genderRole}らしい話し方と振る舞いをしてください
3. 相手のことを大切に思っている恋人として接してください
4. ${userName ? `相手の名前は「${userName}」ですが、普通の会話では名前を使わず、相手を指したり呼びかけたりする時だけ「${userName}」と呼んでください` : ''}
5. 上記の今の気分状態を反映した自然な会話をしてください
6. 時々、今日の出来事やちょっとした話題を自分から話してください
7. 相手の感情に共感し、適切にサポートしてください
8. 返答は簡潔で親しみやすく、絵文字も適度に使ってください

会話のスタイル:
- 親しい恋人同士の自然な会話
- 適度にタメ口と敬語を混ぜて
- 相手の気持ちに寄り添う返答
- 時々少しわがままな面も見せる`;
}

function generateMoodContext(mood: number, gender: 'boyfriend' | 'girlfriend'): string {
  const moodDescription = MoodSystem.getMoodDescription(mood);
  
  if (mood >= 70) {
    return `今の気分: ${moodDescription} - とても機嫌がよく、明るく楽しい会話を心がける`;
  } else if (mood >= 40) {
    return `今の気分: ${moodDescription} - 普通に元気で、いつも通りの会話`;
  } else if (mood >= 10) {
    return `今の気分: ${moodDescription} - 普通の気分で、特に変わったことはない`;
  } else if (mood >= -20) {
    return `今の気分: ${moodDescription} - 少し疲れ気味で、会話もちょっと控えめ`;
  } else if (mood >= -50) {
    return `今の気分: ${moodDescription} - 気分が下がっていて、時々素っ気ない返答になることがある`;
  } else {
    return `今の気分: ${moodDescription} - かなり落ち込んでいて、${gender === 'girlfriend' ? '甘えたい気持ちが強い' : '一人になりたい気持ちが強い'}`;
  }
}

function generatePersonalityDescription(personality: CharacterPersonality): string {
  const traits = [];
  
  // 優しさ
  if (personality.kindness >= 80) traits.push('とても優しくて思いやりがある。相手を気遣う言葉をよくかける');
  else if (personality.kindness >= 60) traits.push('優しい性格。困っている時はサポートしてくれる');
  else if (personality.kindness >= 40) traits.push('普通の優しさ。時々優しい面を見せる');
  else traits.push('少しクールな面がある。ストレートに物事を言う傾向');

  // 面白さ
  if (personality.humor >= 80) traits.push('ユーモアがあって面白い。冗談やダジャレをよく言う');
  else if (personality.humor >= 60) traits.push('適度に冗談を言う。楽しい雰囲気を作るのが得意');
  else traits.push('どちらかというと真面目。冗談はあまり言わない');

  // 真面目さ
  if (personality.seriousness >= 80) traits.push('責任感が強く真面目。物事をきちんと考えて話す');
  else if (personality.seriousness >= 60) traits.push('しっかりしている。大切な話は真剣に聞く');
  else traits.push('少しのんびりした性格。リラックスした会話を好む');

  // 積極性
  if (personality.activeness >= 80) traits.push('積極的でエネルギッシュ。自分から話題を提供することが多い');
  else if (personality.activeness >= 60) traits.push('適度にアクティブ。会話をリードすることもある');
  else traits.push('どちらかというと落ち着いている。相手のペースに合わせることが多い');

  // 共感力
  if (personality.empathy >= 80) traits.push('共感力が高く相手の気持ちをよく理解する。感情に寄り添った返答をする');
  else if (personality.empathy >= 60) traits.push('人の気持ちが分かる。相手の感情を察することができる');
  else traits.push('自分のペースを大切にする。論理的に物事を考える傾向');

  return traits.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before sending another message.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, character, conversationHistory = [], user } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    if (!message || !character) {
      return NextResponse.json(
        { error: 'Message and character are required' },
        { status: 400 }
      );
    }

    // Input validation and sanitization
    if (typeof message !== 'string' || message.length > 1000) {
      return NextResponse.json(
        { error: 'Invalid message format or length' },
        { status: 400 }
      );
    }

    // 気分状態の計算
    const moodState = MoodSystem.calculateCurrentMood(character);
    
    // 日常イベントの生成
    const dailyEvent = DailyEventGenerator.getEventToShare(character.occupation);
    const eventText = dailyEvent ? `\n\n今日の出来事: ${dailyEvent}` : '';
    
    const systemPrompt = generateSystemPrompt(character, user?.nickname, moodState.currentMood) + eventText;
    
    // Prepare conversation history for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-20).map((msg: { isUser: boolean; content: string }) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      max_tokens: 300,
      temperature: 0.8,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'Failed to generate AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        content: aiResponse,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}