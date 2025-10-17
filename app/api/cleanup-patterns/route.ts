import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * DELETE /api/cleanup-patterns - Remove patterns without embeddings
 * This cleans up patterns that were created before embedding generation was added
 */
export async function DELETE() {
  try {
    // Count patterns without embeddings
    const countResult = await sql`
      SELECT COUNT(*) as count 
      FROM learned_patterns 
      WHERE embedding IS NULL
    `;
    const countToDelete = parseInt(countResult.rows[0]?.count || '0');

    // Delete patterns without embeddings
    const deleteResult = await sql`
      DELETE FROM learned_patterns 
      WHERE embedding IS NULL
    `;

    // Get remaining count
    const remainingResult = await sql`
      SELECT COUNT(*) as count FROM learned_patterns
    `;
    const remainingCount = parseInt(remainingResult.rows[0]?.count || '0');

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      deletedCount: countToDelete,
      remainingCount,
    });
  } catch (error) {
    console.error('Error cleaning up patterns:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cleanup patterns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
