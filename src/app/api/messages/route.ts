import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message } = body;

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Conversation ID and message are required' },
        { status: 400 }
      );
    }

    const savedMessage = await DatabaseService.addMessage(conversationId, message);

    return NextResponse.json({
      success: true,
      data: savedMessage,
    });
  } catch (error) {
    console.error('Message API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}