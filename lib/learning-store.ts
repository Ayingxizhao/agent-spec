import fs from 'fs/promises';
import path from 'path';
import { LearnedPreference, TaskHistory } from '@/types/coding';

const DATA_PATH = path.join(process.cwd(), 'data', 'learned-preferences.json');

interface LearningData {
  preferences: LearnedPreference[];
  history: TaskHistory[];
}

export async function getLearnedPreferences(): Promise<LearnedPreference[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed: LearningData = JSON.parse(data);
    return parsed.preferences;
  } catch (error) {
    console.error('Error reading preferences:', error);
    return [];
  }
}

export async function addLearnedPreference(preference: LearnedPreference): Promise<void> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed: LearningData = JSON.parse(data);

    parsed.preferences.push(preference);

    await fs.writeFile(DATA_PATH, JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.error('Error adding preference:', error);
    throw error;
  }
}

export async function getTaskHistory(): Promise<TaskHistory[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed: LearningData = JSON.parse(data);
    return parsed.history;
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
}

export async function addTaskToHistory(task: TaskHistory): Promise<void> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed: LearningData = JSON.parse(data);

    parsed.history.push(task);

    await fs.writeFile(DATA_PATH, JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.error('Error adding to history:', error);
    throw error;
  }
}

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
