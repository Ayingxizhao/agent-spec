import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate embeddings using Gemini text-embedding-004 model
 * Returns 768-dimensional vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    
    return embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embedding text from pattern for semantic search
 */
export function patternToEmbeddingText(pattern: {
  name: string;
  description: string;
  metadata?: Record<string, any>;
}): string {
  const parts = [
    pattern.name,
    pattern.description,
  ];
  
  // Add relevant metadata fields
  if (pattern.metadata) {
    if (pattern.metadata.threatMitigated) {
      parts.push(`Mitigates: ${pattern.metadata.threatMitigated}`);
    }
    if (pattern.metadata.controlLayer) {
      parts.push(`Layer: ${pattern.metadata.controlLayer}`);
    }
    if (pattern.metadata.changeNarrative) {
      parts.push(pattern.metadata.changeNarrative);
    }
  }
  
  return parts.join(' | ');
}
