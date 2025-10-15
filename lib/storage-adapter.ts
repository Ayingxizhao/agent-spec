import { LearnedPreference, TaskHistory } from '@/types/coding';
import { testConnection } from './db';
import {
  getLearnedPreferencesFromDB,
  addLearnedPreferenceToDB,
  getTaskHistoryFromDB,
  addTaskToHistoryDB,
} from './db-store';
import fs from 'fs/promises';
import path from 'path';

/**
 * Storage adapter with PostgreSQL primary and JSON fallback
 * Automatically switches to JSON if database is unavailable
 */

const DATA_PATH = path.join(process.cwd(), 'data', 'learned-preferences.json');

interface LearningData {
  preferences: LearnedPreference[];
  history: TaskHistory[];
}

let useDatabase: boolean | null = null;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 60000; // 1 minute

/**
 * Check if database should be used
 * Caches result for 1 minute to avoid repeated connection attempts
 */
async function shouldUseDatabase(): Promise<boolean> {
  const now = Date.now();
  
  // Return cached result if recent
  if (useDatabase !== null && now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return useDatabase;
  }

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not configured, using JSON fallback');
    useDatabase = false;
    lastConnectionCheck = now;
    return false;
  }

  // Test connection
  const connected = await testConnection();
  useDatabase = connected;
  lastConnectionCheck = now;

  if (!connected) {
    console.warn('Database connection failed, using JSON fallback');
  }

  return connected;
}

/**
 * Read from JSON file
 */
async function readJSONFile(): Promise<LearningData> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return { preferences: [], history: [] };
  }
}

/**
 * Write to JSON file
 */
async function writeJSONFile(data: LearningData): Promise<void> {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing JSON file:', error);
    throw error;
  }
}

/**
 * Get learned preferences (with fallback)
 */
export async function getLearnedPreferences(): Promise<LearnedPreference[]> {
  const useDatabaseStorage = await shouldUseDatabase();

  if (useDatabaseStorage) {
    try {
      return await getLearnedPreferencesFromDB();
    } catch (error) {
      console.error('Database read failed, falling back to JSON:', error);
      useDatabase = false; // Force fallback for subsequent calls
    }
  }

  // JSON fallback
  const data = await readJSONFile();
  return data.preferences;
}

/**
 * Add learned preference (with fallback)
 */
export async function addLearnedPreference(preference: LearnedPreference): Promise<void> {
  const useDatabaseStorage = await shouldUseDatabase();

  if (useDatabaseStorage) {
    try {
      await addLearnedPreferenceToDB(preference);
      return;
    } catch (error) {
      console.error('Database write failed, falling back to JSON:', error);
      useDatabase = false; // Force fallback for subsequent calls
    }
  }

  // JSON fallback
  const data = await readJSONFile();
  data.preferences.push(preference);
  await writeJSONFile(data);
}

/**
 * Get task history (with fallback)
 */
export async function getTaskHistory(): Promise<TaskHistory[]> {
  const useDatabaseStorage = await shouldUseDatabase();

  if (useDatabaseStorage) {
    try {
      return await getTaskHistoryFromDB();
    } catch (error) {
      console.error('Database read failed, falling back to JSON:', error);
      useDatabase = false;
    }
  }

  // JSON fallback
  const data = await readJSONFile();
  return data.history;
}

/**
 * Add task to history (with fallback)
 */
export async function addTaskToHistory(task: TaskHistory): Promise<void> {
  const useDatabaseStorage = await shouldUseDatabase();

  if (useDatabaseStorage) {
    try {
      await addTaskToHistoryDB(task);
      return;
    } catch (error) {
      console.error('Database write failed, falling back to JSON:', error);
      useDatabase = false;
    }
  }

  // JSON fallback
  const data = await readJSONFile();
  data.history.push(task);
  await writeJSONFile(data);
}

/**
 * Build context from preferences
 */
export async function buildContextFromPreferences(preferences: LearnedPreference[]): Promise<string> {
  if (preferences.length === 0) {
    return '';
  }

  const grouped = preferences.reduce((acc, pref) => {
    if (!acc[pref.type]) {
      acc[pref.type] = [];
    }
    acc[pref.type].push(pref);
    return acc;
  }, {} as Record<string, LearnedPreference[]>);

  let context = '\n\nLearned preferences from previous interactions:\n';

  Object.entries(grouped).forEach(([type, prefs]) => {
    context += `\n${type.toUpperCase()}:\n`;
    prefs.forEach(pref => {
      context += `- ${pref.description}\n`;
      if (pref.example) {
        context += `  Example: ${pref.example}\n`;
      }
    });
  });

  return context;
}
