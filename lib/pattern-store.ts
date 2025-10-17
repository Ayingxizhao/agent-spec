import { sql } from './db';
import { Pattern, PatternSearchResult, SecurityPattern } from '@/types/pattern';
import { generateEmbedding, patternToEmbeddingText } from './embeddings';

/**
 * Save a security pattern to the database with embedding
 */
export async function saveSecurityPattern(
  pattern: SecurityPattern,
  taskContext?: string
): Promise<Pattern> {
  const now = Date.now();
  const id = `pattern_${now}_${Math.random().toString(36).substr(2, 9)}`;
  
  const patternRecord: Pattern = {
    id,
    patternType: 'security',
    name: pattern.name,
    description: pattern.changeNarrative,
    metadata: {
      threatMitigated: pattern.threatMitigated,
      controlLayer: pattern.controlLayer,
      dependencies: pattern.dependencies,
      operationalNotes: pattern.operationalNotes,
      changeNarrative: pattern.changeNarrative,
    },
    confidence: 0.33,
    observationCount: 1,
    taskContext,
    evidence: pattern.evidenceFromDiff,
    firstSeen: now,
    lastSeen: now,
  };
  
  // Generate embedding
  const embeddingText = patternToEmbeddingText(patternRecord);
  const embedding = await generateEmbedding(embeddingText);
  
  // Save to database
  await sql`
    INSERT INTO learned_patterns (
      id, pattern_type, name, description, metadata,
      confidence, observation_count, task_context, evidence,
      embedding, first_seen, last_seen
    )
    VALUES (
      ${id},
      ${patternRecord.patternType},
      ${patternRecord.name},
      ${patternRecord.description},
      ${JSON.stringify(patternRecord.metadata)},
      ${patternRecord.confidence},
      ${patternRecord.observationCount},
      ${patternRecord.taskContext || null},
      ${patternRecord.evidence || null},
      ${JSON.stringify(embedding)},
      ${patternRecord.firstSeen},
      ${patternRecord.lastSeen}
    )
  `;
  
  return patternRecord;
}

/**
 * Search for similar patterns using vector similarity
 */
export async function searchSimilarPatterns(
  query: string,
  options: {
    patternType?: string;
    limit?: number;
    minSimilarity?: number;
  } = {}
): Promise<PatternSearchResult[]> {
  const { patternType, limit = 10, minSimilarity = 0.7 } = options;
  
  console.log('searchSimilarPatterns called with:', { query, patternType, limit, minSimilarity });
  
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);
  console.log('Generated embedding, length:', queryEmbedding.length);
  
  // Convert embedding array to pgvector format: '[1,2,3,...]'
  const embeddingString = `[${queryEmbedding.join(',')}]`;
  
  // Build query with optional type filter
  let result;
  if (patternType) {
    result = await sql`
      SELECT 
        id, pattern_type, name, description, metadata,
        confidence, observation_count, task_context, evidence,
        first_seen, last_seen,
        1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM learned_patterns
      WHERE pattern_type = ${patternType}
        AND embedding IS NOT NULL
        AND 1 - (embedding <=> ${embeddingString}::vector) >= ${minSimilarity}
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT ${limit}
    `;
  } else {
    result = await sql`
      SELECT 
        id, pattern_type, name, description, metadata,
        confidence, observation_count, task_context, evidence,
        first_seen, last_seen,
        1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM learned_patterns
      WHERE embedding IS NOT NULL
        AND 1 - (embedding <=> ${embeddingString}::vector) >= ${minSimilarity}
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT ${limit}
    `;
  }
  
  console.log('Search returned rows:', result.rows?.length || 0);
  
  return (result.rows || []).map((row: any) => ({
    id: row.id,
    patternType: row.pattern_type,
    name: row.name,
    description: row.description,
    metadata: row.metadata,
    confidence: Number(row.confidence),
    observationCount: Number(row.observation_count),
    taskContext: row.task_context || undefined,
    evidence: row.evidence || undefined,
    firstSeen: Number(row.first_seen),
    lastSeen: Number(row.last_seen),
    similarity: Number(row.similarity),
  }));
}

/**
 * Get all patterns with optional filtering
 */
export async function getAllPatterns(options: {
  patternType?: string;
  minConfidence?: number;
  limit?: number;
} = {}): Promise<Pattern[]> {
  const { patternType, minConfidence = 0, limit = 100 } = options;
  
  console.log('getAllPatterns called with:', { patternType, minConfidence, limit });
  
  let result;
  if (patternType) {
    result = await sql`
      SELECT 
        id, pattern_type, name, description, metadata,
        confidence, observation_count, task_context, evidence,
        first_seen, last_seen
      FROM learned_patterns
      WHERE pattern_type = ${patternType}
        AND confidence >= ${minConfidence}
      ORDER BY confidence DESC, last_seen DESC
      LIMIT ${limit}
    `;
  } else {
    result = await sql`
      SELECT 
        id, pattern_type, name, description, metadata,
        confidence, observation_count, task_context, evidence,
        first_seen, last_seen
      FROM learned_patterns
      WHERE confidence >= ${minConfidence}
      ORDER BY confidence DESC, last_seen DESC
      LIMIT ${limit}
    `;
  }
  
  return (result.rows || []).map((row: any) => ({
    id: row.id,
    patternType: row.pattern_type,
    name: row.name,
    description: row.description,
    metadata: row.metadata,
    confidence: Number(row.confidence),
    observationCount: Number(row.observation_count),
    taskContext: row.task_context || undefined,
    evidence: row.evidence || undefined,
    firstSeen: Number(row.first_seen),
    lastSeen: Number(row.last_seen),
  }));
}

/**
 * Increment observation count and update confidence for a pattern
 */
export async function incrementPatternObservation(patternId: string): Promise<void> {
  const now = Date.now();
  
  await sql`
    UPDATE learned_patterns
    SET 
      observation_count = observation_count + 1,
      confidence = LEAST(1.0, confidence + 0.1),
      last_seen = ${now}
    WHERE id = ${patternId}
  `;
}
