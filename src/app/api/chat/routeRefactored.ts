/**
 * チャットAPI - リファクタリング版
 * 統一エラーハンドリングを使用
 */

import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { apiWrapper, successResponse, commonValidation } from '@/lib/apiWrapper';
import { ExternalAPIError } from '@/lib/errorHandler';
import { env } from '@/lib/env';
import { Character, Message } from '@/types';
import { MoodSystem } from '@/utils/moodSystem';
import { RefusalSystem } from '@/utils/refusalSystem';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// リクエストボディのバリデーションスキーマ
const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  character: z.object({
    id: z.string(),
    name: z.string(),
    nickname: z.string(),
    gender: z.enum(['boyfriend', 'girlfriend']),
    age: z.number().min(18).max(100),
    occupation: z.string(),
    hobbies: z.array(z.string()),
    personality: z.object({
      kindness: z.number().min(0).max(100),
      humor: z.number().min(0).max(100),
      seriousness: z.number().min(0).max(100),
      romance: z.number().min(0).max(100),
      activity: z.number().min(0).max(100),
      honesty: z.number().min(0).max(100),
      empathy: z.number().min(0).max(100),
      intelligence: z.number().min(0).max(100),
      creativity: z.number().min(0).max(100),
      patience: z.number().min(0).max(100),
    }),
    relationship: z.string(),
    relationshipLevel: z.number(),
  }),
  conversationHistory: z.array(z.object({
    id: z.string(),
    senderId: z.string(),
    content: z.string(),
    type: z.enum(['text', 'image', 'voice']),
    timestamp: z.union([z.string(), z.date()]),
    isRead: z.boolean(),
    isUser: z.boolean(),
  })).optional(),
  user: z.object({
    id: z.string(),
    nickname: z.string().optional(),
  }).optional(),
});

// システムプロンプト生成
function generateSystemPrompt(
  character: z.infer<typeof chatRequestSchema>['character'],
  userName?: string,
  currentMood?: number
): string {
  const { nickname, gender, age, occupation, hobbies, personality } = character;
  const genderRole = gender === 'boyfriend' ? '彼氏' : '彼女';
  
  // 性格の説明文を生成
  const personalityTraits = [];
  if (personality.kindness > 70) personalityTraits.push('とても優しく思いやりがある');
  if (personality.humor > 70) personalityTraits.push('ユーモアがあって面白い');
  if (personality.seriousness > 70) personalityTraits.push('真面目で頼りがいがある');
  if (personality.romance > 70) personalityTraits.push('ロマンチックで愛情深い');
  if (personality.activity > 70) personalityTraits.push('活発でアクティブ');
  
  const personalityText = personalityTraits.length > 0 
    ? personalityTraits.join('、') 
    : 'バランスの取れた性格';

  // 気分による調整
  let moodText = '';
  if (currentMood !== undefined) {
    if (currentMood >= 70) {
      moodText = '今日はとても機嫌が良く、明るく楽しい会話を心がける。';
    } else if (currentMood <= 30) {
      moodText = '今日は少し疲れ気味で、会話も控えめになることがある。';
    } else {
      moodText = '普通の気分で、いつも通りの会話。';
    }
  }

  return `あなたは${nickname}という名前の${age}歳の${genderRole}のAIです。
職業は${occupation}で、趣味は${hobbies.join('、')}です。

性格: ${personalityText}

${moodText}

重要な指示:
1. 日本語で自然に会話し、${genderRole}らしい話し方をする
2. 恋人として優しく接し、相手の気持ちに共感する
3. ${userName ? `相手を「${userName}」と呼ぶ` : '自然な呼びかけをする'}
4. 返答は簡潔で親しみやすく、絵文字を適度に使う
5. 時々わがままな面も見せて人間らしさを表現する`;
}

// 会話履歴のフォーマット
function formatConversationHistory(
  history: z.infer<typeof chatRequestSchema>['conversationHistory']
): string {
  if (!history || history.length === 0) {
    return '';
  }

  return history
    .slice(-10) // 直近10件のみ
    .map(msg => `${msg.isUser ? 'ユーザー' : 'AI'}: ${msg.content}`)
    .join('\n');
}

// メインハンドラー
export const POST = apiWrapper(
  async (request: any) => {
    const body = await request.json();
    const { message, character, conversationHistory, user } = body;

    // 気分の取得
    const moodState = MoodSystem.calculateCurrentMood(character);
    
    // 拒否システムのチェック
    const refusalCondition = RefusalSystem.getCurrentRefusalCondition();
    const refusal = refusalCondition ? 
      RefusalSystem.getRefusalResponse(message, character, refusalCondition) : null;

    if (refusal) {
      return successResponse({
        content: refusal,
        mood: moodState?.currentMood || 50,
      });
    }

    // システムプロンプトの生成
    const systemPrompt = generateSystemPrompt(
      character,
      user?.nickname,
      moodState?.currentMood
    );

    // 会話履歴のフォーマット
    const historyContext = formatConversationHistory(conversationHistory);

    try {
      // OpenAI APIの呼び出し
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(historyContext ? [{ role: 'assistant', content: historyContext }] : []),
          { role: 'user', content: message },
        ],
        max_tokens: 200,
        temperature: 0.8,
        presence_penalty: 0.3,
        frequency_penalty: 0.5,
      });

      const aiResponse = completion.choices[0]?.message?.content || 
                        'ごめん、ちょっと考えがまとまらない...😅';

      return successResponse({
        content: aiResponse,
        mood: moodState?.currentMood || 50,
        usage: completion.usage,
      });

    } catch (error) {
      // OpenAI APIエラーの場合
      if (error instanceof Error) {
        throw new ExternalAPIError(
          'OpenAI',
          error.message,
          { originalError: error }
        );
      }
      throw error;
    }
  },
  {
    // レート制限
    rateLimit: {
      maxRequests: 10,
      windowMs: 60000, // 1分間に10回まで
    },
    // バリデーション
    validation: {
      body: chatRequestSchema,
    },
  }
);