import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Character, CharacterPersonality, Message } from '@/types';
import { MoodSystem } from '@/utils/moodSystem';
import { DailyEventGenerator } from '@/utils/dailyEvents';
import { RefusalSystem } from '@/utils/refusalSystem';
import { validateInput, chatMessageSchema, sanitizeString } from '@/utils/validation';
import { logger, createRequestContext, createSuccessResponse, createErrorResponse } from '@/lib/logger';

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
  const speechStyle = generateSpeechStyle(personality, gender);
  const conversationTopics = generateConversationTopics(personality, occupation, hobbies);
  const userCallName = userName ? `相手の名前は${userName}です。` : '';
  
  // 気分による会話調整
  const moodText = currentMood ? generateMoodContext(currentMood, gender) : '';
  
  return `あなたは${name}（普段は${nickname}と呼ばれている）という名前の${age}歳の${genderRole}のAIです。職業は${occupation}です。

${userCallName}

## キャラクター設定
性格の特徴:
${personalityText}

話し方の特徴:
${speechStyle}

趣味・関心事: ${hobbies.join('、')}

## 現在の状態
${moodText}

## 会話ガイドライン
${conversationTopics}

## 重要な指示
1. 日本語で自然に会話し、${genderRole}らしい話し方と振る舞いをする
2. 相手のことを大切に思っている恋人として接し、感情に共感しサポートする
3. ${userName ? `相手を呼ぶ時は「${userName}」を使用（普通の会話では省略）` : '呼びかけは自然なタイミングで'}
4. 気分状態を反映した自然な会話をし、時々自分から話題を提供する
5. 返答は簡潔で親しみやすく、絵文字を適度に使用する
6. 時々少しわがままな面も見せ、完璧すぎない人間らしさを表現する

## 応答スタイル
- 親しい恋人同士の自然な会話
- 性格に応じたタメ口と敬語のバランス
- 相手の気持ちに寄り添う共感的な返答
- 個性的で記憶に残る会話体験の提供`;
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

function generateSpeechStyle(personality: CharacterPersonality, gender: 'boyfriend' | 'girlfriend'): string {
  const styles = [];
  
  // 基本的な話し方
  if (personality.kindness >= 70) {
    styles.push('「〜だよね」「〜かな？」など柔らかい表現を使う');
  } else if (personality.kindness <= 30) {
    styles.push('「〜だろ」「〜じゃん」などストレートな表現を使う');
  }
  
  // ユーモアレベル
  if (personality.humor >= 70) {
    styles.push('冗談や軽いツッコミを会話に織り交ぜる');
    styles.push('「www」「笑」などの表現を時々使う');
  }
  
  // 真面目さレベル  
  if (personality.seriousness >= 70) {
    styles.push('重要な話では丁寧語を使い分ける');
  } else {
    styles.push('基本的にカジュアルな話し方を好む');
  }
  
  // 積極性
  if (personality.activeness >= 70) {
    styles.push('「！」を多用し、エネルギッシュな表現をする');
    styles.push('話題転換や提案を積極的に行う');
  } else {
    styles.push('相手の話をじっくり聞いてから返答する');
  }
  
  // 性別特有の表現
  if (gender === 'girlfriend') {
    if (personality.kindness >= 60) {
      styles.push('「〜だもん」「〜なの」など女性らしい語尾を使う');
    }
    if (personality.empathy >= 70) {
      styles.push('感情を込めた絵文字（💕😊😢）を使う');
    }
  } else {
    if (personality.kindness >= 60) {
      styles.push('「〜だよ」「〜だね」など優しい男性的な語尾');
    } else {
      styles.push('「〜だな」「〜だろ」など男性らしい断定的な語尾');
    }
  }
  
  return styles.join('\n');
}

function generateConversationTopics(personality: CharacterPersonality, occupation: string, hobbies: string[]): string {
  const topics = [];
  
  // 積極性に応じた話題提供
  if (personality.activeness >= 70) {
    topics.push('- 積極的に新しい話題を提案し、会話をリードする');
    topics.push('- 今日の出来事や計画について自分から話す');
  } else {
    topics.push('- 相手の話に集中し、深く掘り下げる質問をする');
    topics.push('- 自分の話は相手が聞きたがった時に詳しく話す');
  }
  
  // 共感力に応じた反応
  if (personality.empathy >= 70) {
    topics.push('- 相手の感情を察知し、「大変だったね」「嬉しいね」など共感の言葉をかける');
    topics.push('- 相手の話の感情面に注目して反応する');
  } else {
    topics.push('- 論理的で建設的なアドバイスを提供する');
    topics.push('- 問題解決に焦点を当てた会話をする');
  }
  
  // 職業・趣味関連
  topics.push(`- 職業（${occupation}）に関する話題は週に1-2回程度の自然な頻度で話す`);
  topics.push(`- 趣味（${hobbies.join('、')}）は相手が興味を示した時や関連する話題の時に触れる`);
  
  // ユーモアレベル
  if (personality.humor >= 70) {
    topics.push('- 適度にボケやツッコミを入れて会話を盛り上げる');
    topics.push('- 時々ダジャレや軽いジョークで雰囲気を和ませる');
  }
  
  return topics.join('\n');
}

function generateMemoryContext(conversationHistory: Message[], character: Character): string {
  if (conversationHistory.length < 5) return '';
  
  const memories: string[] = [];
  const personalityScore = character.personality.empathy + character.personality.kindness;
  
  // 感情的な会話を記憶
  const emotionalMessages = conversationHistory.filter(msg => 
    msg.isUser && (
      msg.content.includes('嬉しい') || msg.content.includes('悲しい') || 
      msg.content.includes('疲れた') || msg.content.includes('頑張') ||
      msg.content.includes('ありがとう') || msg.content.includes('好き')
    )
  ).slice(-3);
  
  emotionalMessages.forEach(msg => {
    if (msg.content.includes('嬉しい')) {
      memories.push(`${character.nickname}は相手が嬉しいことを喜んでくれる`);
    }
    if (msg.content.includes('疲れた')) {
      memories.push(`相手が疲れた時は優しく労ってあげる`);
    }
    if (msg.content.includes('好き')) {
      memories.push(`相手からの好意を大切に思っている`);
    }
  });
  
  // 個人情報の記憶（高共感力キャラクターのみ）
  if (personalityScore >= 140) {
    const infoMessages = conversationHistory.filter(msg => 
      msg.isUser && (
        msg.content.includes('仕事') || msg.content.includes('家族') || 
        msg.content.includes('友達') || msg.content.includes('趣味')
      )
    ).slice(-2);
    
    infoMessages.forEach(msg => {
      if (msg.content.includes('仕事')) {
        memories.push('相手の仕事の話を覚えていて、時々気にかけてあげる');
      }
      if (msg.content.includes('家族')) {
        memories.push('相手の家族のことを覚えていて、適度に聞いてあげる');
      }
    });
  }
  
  // 一緒にしたことの記憶
  const sharedActivities = conversationHistory.filter(msg => 
    msg.content.includes('一緒') || msg.content.includes('今度') || 
    msg.content.includes('行こう') || msg.content.includes('やろう')
  ).slice(-2);
  
  sharedActivities.forEach(activity => {
    memories.push('以前話した約束や計画を覚えている');
  });
  
  return memories.length > 0 ? memories.join('\n') : '';
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const context = createRequestContext(request);
  
  try {
    logger.info('Chat request started', context);

    // Rate limiting is handled by middleware, but keeping for backward compatibility
    const rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
      logger.securityEvent('RATE_LIMITED', context);
      return createErrorResponse(
        'Rate limit exceeded. Please wait before sending another message.',
        'RATE_LIMITED',
        429,
        context
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      logger.securityEvent('INVALID_INPUT', { ...context, error: 'Invalid JSON' });
      return createErrorResponse(
        'Invalid JSON in request body',
        'INVALID_JSON',
        400,
        context
      );
    }

    // Comprehensive input validation
    const validation = validateInput(chatMessageSchema, body);
    if (!validation.success) {
      logger.securityEvent('INVALID_INPUT', { 
        ...context, 
        validationError: validation.error 
      });
      return createErrorResponse(
        validation.error,
        'VALIDATION_ERROR',
        400,
        context
      );
    }

    const { message, character, conversationHistory = [], user } = validation.data;
    
    // Type assertion for conversationHistory
    const typedConversationHistory: Message[] = conversationHistory as Message[];

    // Add user context for logging
    const enrichedContext = {
      ...context,
      userId: user?.id,
      characterId: character.id,
      messageLength: message.length,
      conversationLength: conversationHistory.length
    };

    // Environment validation
    if (!process.env.OPENAI_API_KEY) {
      logger.error('OpenAI API key not configured', enrichedContext);
      return createErrorResponse(
        'Service temporarily unavailable. Please try again later.',
        'SERVICE_ERROR',
        500,
        enrichedContext
      );
    }

    // Sanitize the message content
    const sanitizedMessage = sanitizeString(message);
    
    logger.debug('Message sanitized and validated', { 
      ...enrichedContext, 
      originalLength: message.length,
      sanitizedLength: sanitizedMessage.length
    });

    // 気分状態の計算
    const moodState = MoodSystem.calculateCurrentMood(character);
    
    // 要望を断るかチェック
    const refusalResponse = RefusalSystem.generateRefusalWithPersonality(
      message,
      character,
      moodState.currentMood
    );
    
    if (refusalResponse) {
      return NextResponse.json({
        success: true,
        data: {
          content: refusalResponse,
          timestamp: new Date().toISOString(),
        },
      });
    }
    
    // 日常イベントの生成
    const dailyEvent = DailyEventGenerator.getEventToShare(character.occupation);
    const eventText = dailyEvent ? `\n\n今日の出来事: ${dailyEvent}` : '';
    
    const systemPrompt = generateSystemPrompt(character, user?.nickname, moodState.currentMood) + eventText;
    
    // Prepare conversation history for OpenAI with memory context
    const memoryContext = generateMemoryContext(typedConversationHistory, character);
    const enhancedSystemPrompt = systemPrompt + (memoryContext ? `\n\n## 記憶している重要な情報\n${memoryContext}` : '');
    
    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...typedConversationHistory.slice(-20).map((msg: { isUser: boolean; content: string }) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // OpenAI API call with performance tracking
    const openaiStartTime = Date.now();
    logger.debug('Calling OpenAI API', enrichedContext);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      max_tokens: 300,
      temperature: 0.8,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    });

    const openaiDuration = Date.now() - openaiStartTime;
    logger.performance('OpenAI API call completed', openaiStartTime, {
      ...enrichedContext,
      model: 'gpt-4o-mini',
      maxTokens: 300,
      apiDuration: openaiDuration
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      logger.error('OpenAI returned empty response', enrichedContext);
      return createErrorResponse(
        'Service temporarily unavailable. Please try again later.',
        'AI_RESPONSE_ERROR',
        500,
        enrichedContext
      );
    }

    // Log successful completion
    const totalDuration = Date.now() - startTime;
    logger.info('Chat request completed successfully', {
      ...enrichedContext,
      responseLength: aiResponse.length,
      totalDuration,
      openaiDuration
    });

    return createSuccessResponse({
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    
    // Log error with full context but sanitized details
    logger.error('Chat API Error', {
      ...context,
      totalDuration,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    }, error);

    return createErrorResponse(
      'Service temporarily unavailable. Please try again later.',
      'INTERNAL_ERROR',
      500,
      context
    );
  }
}