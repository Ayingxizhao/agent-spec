/**
 * Security pattern extracted from code diffs
 */
export interface SecurityPattern {
  name: string;
  changeNarrative: string;
  threatMitigated: string;
  controlLayer: 'input-hardening' | 'credential-hygiene' | 'session-governance' | 
                'network-protection' | 'monitoring-and-alerting' | 'operational-guardrail';
  dependencies: string[];
  operationalNotes?: string;
  evidenceFromDiff: string;
}

/**
 * Unified pattern storage model
 */
export interface Pattern {
  id: string;
  patternType: 'security' | 'performance' | 'style' | 'testing' | 'accessibility' | 'other';
  name: string;
  description: string;
  
  // Flexible metadata per pattern type
  metadata: Record<string, any>;
  
  // Learning metrics
  confidence: number;
  observationCount: number;
  
  // Context
  taskContext?: string;
  evidence?: string;
  
  // Timestamps
  firstSeen: number;
  lastSeen: number;
}

/**
 * Pattern with similarity score from vector search
 */
export interface PatternSearchResult extends Pattern {
  similarity: number;
}
