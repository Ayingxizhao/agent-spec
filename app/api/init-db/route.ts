import { NextResponse } from 'next/server';
import { initializeSchema, testConnection } from '@/lib/db';

/**
 * GET /api/init-db - Initialize database schema
 * Creates tables and enables pgvector extension
 */
export async function GET() {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Initialize schema
    await initializeSchema();

    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
