import { NextResponse } from 'next/server';
import { testConnection, initializeSchema } from '@/lib/db';

/**
 * Database status and initialization endpoint
 * GET: Check database connection status
 * POST: Initialize database schema
 */

export async function GET() {
  try {
    const hasUrl = !!process.env.DATABASE_URL;
    const connected = hasUrl ? await testConnection() : false;

    return NextResponse.json({
      configured: hasUrl,
      connected,
      message: !hasUrl 
        ? 'DATABASE_URL not configured - using JSON fallback'
        : connected
        ? 'Database connected'
        : 'Database connection failed - using JSON fallback',
    });
  } catch (error) {
    return NextResponse.json({
      configured: !!process.env.DATABASE_URL,
      connected: false,
      message: 'Database connection error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function POST() {
  try {
    console.log('=== DATABASE DEBUG ===');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    console.log('=====================');
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 400 }
      );
    }

    await initializeSchema();

    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
    });
  } catch (error) {
    console.error('Schema initialization failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize schema',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
