import { NextResponse } from 'next/server';
import { sql, testConnection } from '@/lib/db';

/**
 * GET /api/debug-db - Debug database connection and schema
 */
export async function GET() {
  try {
    // Test connection
    const connected = await testConnection();
    
    if (!connected) {
      return NextResponse.json({
        error: 'Database connection failed',
        connected: false,
      }, { status: 500 });
    }

    // Check if learned_patterns table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'learned_patterns'
      )
    `;
    
    const tableExists = tableCheck.rows[0]?.exists || false;

    // Count patterns if table exists
    let patternCount = 0;
    let patternsWithEmbeddings = 0;
    let samplePatterns = [];
    
    if (tableExists) {
      const countResult = await sql`
        SELECT COUNT(*) as count FROM learned_patterns
      `;
      patternCount = parseInt(countResult.rows[0]?.count || '0');
      
      // Count patterns with embeddings
      const embeddingCountResult = await sql`
        SELECT COUNT(*) as count FROM learned_patterns WHERE embedding IS NOT NULL
      `;
      patternsWithEmbeddings = parseInt(embeddingCountResult.rows[0]?.count || '0');
      
      // Get sample patterns
      const sampleResult = await sql`
        SELECT id, pattern_type, name, confidence, observation_count,
               CASE WHEN embedding IS NOT NULL THEN true ELSE false END as has_embedding
        FROM learned_patterns
        LIMIT 5
      `;
      samplePatterns = sampleResult.rows;
    }

    // Check if pgvector extension is enabled
    const extensionCheck = await sql`
      SELECT EXISTS (
        SELECT FROM pg_extension WHERE extname = 'vector'
      )
    `;
    const vectorEnabled = extensionCheck.rows[0]?.exists || false;

    return NextResponse.json({
      success: true,
      connected: true,
      tableExists,
      vectorEnabled,
      patternCount,
      patternsWithEmbeddings: tableExists ? patternsWithEmbeddings : 0,
      samplePatterns,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
