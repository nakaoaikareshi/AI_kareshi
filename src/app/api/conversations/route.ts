import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, characterId } = body;

    if (!userId || !characterId) {
      return NextResponse.json(
        { error: 'User ID and Character ID are required' },
        { status: 400 }
      );
    }

    const conversation = await DatabaseService.getOrCreateConversation(userId, characterId);

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Conversation API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}