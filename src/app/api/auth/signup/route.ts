import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { validateInput, signupSchema } from '@/utils/validation';

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON in request body' 
        },
        { status: 400 }
      );
    }

    // Comprehensive input validation
    const validation = validateInput(signupSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: validation.error,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const { email, password, name, nickname } = validation.data;

    try {
      const user = await DatabaseService.createUser({
        email,
        password,
        name,
        nickname,
      });

      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
        },
        message: 'User created successfully'
      });
    } catch (error: unknown) {
      // Handle specific database errors
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json(
          { 
            success: false,
            error: 'An account with this email already exists',
            code: 'EMAIL_EXISTS'
          },
          { status: 409 }
        );
      }
      
      // Log error without exposing sensitive information
      console.error('User creation failed:', {
        email,
        error: error.message,
        code: error.code
      });
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create user account. Please try again later.',
          code: 'CREATE_USER_ERROR'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Signup API Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { 
        success: false,
        error: 'Service temporarily unavailable. Please try again later.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}