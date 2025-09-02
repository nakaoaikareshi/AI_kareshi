import { NextRequest, NextResponse } from 'next/server';
import { MoodSystem } from '@/utils/moodSystem';
import { Character } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { character } = body;

    if (!character) {
      return NextResponse.json(
        { error: 'Character data is required' },
        { status: 400 }
      );
    }

    // 気分状態を計算
    const moodState = MoodSystem.calculateCurrentMood(character);

    return NextResponse.json({
      success: true,
      data: moodState,
    });

  } catch (error) {
    console.error('Mood API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}