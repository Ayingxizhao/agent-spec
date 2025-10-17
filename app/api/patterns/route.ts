import { NextRequest, NextResponse } from 'next/server';
import { getAllPatterns, searchSimilarPatterns } from '@/lib/pattern-store';

/**
 * GET /api/patterns - Retrieve patterns with optional filtering and search
 * 
 * Query params:
 * - type: Filter by pattern type (security, performance, etc.)
 * - search: Semantic search query
 * - minConfidence: Minimum confidence threshold (0-1)
 * - limit: Max results to return
 */
export async function GET(req: NextRequest) {
  try {
    console.log('Patterns endpoint called');
    
    const { searchParams } = new URL(req.url);
    const patternType = searchParams.get('type') || undefined;
    const searchQuery = searchParams.get('search');
    const minConfidence = searchParams.get('minConfidence') 
      ? parseFloat(searchParams.get('minConfidence')!) 
      : 0;
    const minSimilarity = searchParams.get('minSimilarity')
      ? parseFloat(searchParams.get('minSimilarity')!)
      : 0.5;
    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!) 
      : 100;

    console.log('Query params:', { patternType, searchQuery, minConfidence, limit });

    let patterns;
    
    if (searchQuery) {
      // Semantic search
      console.log('Using semantic search');
      patterns = await searchSimilarPatterns(searchQuery, {
        patternType,
        limit,
        minSimilarity,
      });
    } else {
      // Get all patterns with filters
      console.log('Getting all patterns');
      patterns = await getAllPatterns({
        patternType,
        minConfidence,
        limit,
      });
    }
    
    console.log('Retrieved patterns:', patterns.length);

    return NextResponse.json({
      success: true,
      count: patterns.length,
      patterns,
    });
  } catch (error) {
    console.error('Error retrieving patterns:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve patterns',
        details: errorMessage,
        stack: errorStack,
      },
      { status: 500 }
    );
  }
}
