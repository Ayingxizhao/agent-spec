import { Pool } from 'pg';

/**
 * PostgreSQL database client using native pg library
 * More reliable for direct connections
 */

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    // Remove sslmode from connection string as we handle SSL in config
    const connectionString = process.env.DATABASE_URL?.replace(/\?sslmode=\w+/, '');
    
    const config = {
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    };
    console.log('Creating pool with config:', {
      hasConnectionString: !!config.connectionString,
      ssl: config.ssl
    });
    pool = new Pool(config);
  }
  return pool;
}

/**
 * SQL template tag for parameterized queries
 */
export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  const query = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? `$${i + 1}` : '');
  }, '');
  
  const result = await getPool().query(query, values);
  return result;
}

/**
 * Test database connection
 * @returns true if connected, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Initialize database schema
 * Creates tables if they don't exist
 */
export async function initializeSchema(): Promise<void> {
  try {
    // Enable pgvector extension
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
    
    // Create unified patterns table with vector support
    await sql`
      CREATE TABLE IF NOT EXISTS learned_patterns (
        id TEXT PRIMARY KEY,
        pattern_type TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        confidence FLOAT DEFAULT 0.33,
        observation_count INT DEFAULT 1,
        task_context TEXT,
        evidence TEXT,
        embedding vector(768),
        first_seen BIGINT NOT NULL,
        last_seen BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create task_history table
    await sql`
      CREATE TABLE IF NOT EXISTS task_history (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        task_description TEXT NOT NULL,
        task_timestamp BIGINT NOT NULL,
        suggestion_code TEXT NOT NULL,
        suggestion_language TEXT NOT NULL,
        suggestion_explanation TEXT,
        suggestion_applied_preferences TEXT,
        correction_feedback TEXT,
        correction_code TEXT,
        correction_type TEXT,
        accepted BOOLEAN NOT NULL,
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_learned_patterns_type ON learned_patterns(pattern_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_learned_patterns_metadata ON learned_patterns USING GIN(metadata)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_learned_patterns_embedding ON learned_patterns USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_history_task_id ON task_history(task_id)`;

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize schema:', error);
    throw error;
  }
}
