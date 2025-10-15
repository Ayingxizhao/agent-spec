import { sql } from './db';
import { LearnedPreference, TaskHistory } from '@/types/coding';

/**
 * Database storage layer for learned preferences and task history
 * Uses PostgreSQL for persistent storage
 */

export async function getLearnedPreferencesFromDB(): Promise<LearnedPreference[]> {
  try {
    const result = await sql`
      SELECT id, type, description, example, task_context, timestamp
      FROM patterns
      ORDER BY timestamp DESC
    `;

    return (result.rows || []).map((row: any) => ({
      id: row.id,
      type: row.type as LearnedPreference['type'],
      description: row.description,
      example: row.example || undefined,
      taskContext: row.task_context || undefined,
      timestamp: Number(row.timestamp),
    }));
  } catch (error) {
    console.error('Error reading preferences from DB:', error);
    throw error;
  }
}

export async function addLearnedPreferenceToDB(preference: LearnedPreference): Promise<void> {
  try {
    await sql`
      INSERT INTO patterns (id, type, description, example, task_context, timestamp)
      VALUES (
        ${preference.id},
        ${preference.type},
        ${preference.description},
        ${preference.example || null},
        ${preference.taskContext || null},
        ${preference.timestamp}
      )
    `;
  } catch (error) {
    console.error('Error adding preference to DB:', error);
    throw error;
  }
}

export async function getTaskHistoryFromDB(): Promise<TaskHistory[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        task_id,
        task_description,
        task_timestamp,
        suggestion_code,
        suggestion_language,
        suggestion_explanation,
        suggestion_applied_preferences,
        correction_feedback,
        correction_code,
        correction_type,
        accepted,
        timestamp
      FROM task_history
      ORDER BY timestamp DESC
    `;

    return (result.rows || []).map((row: any) => {
      const taskHistory: TaskHistory = {
        task: {
          id: row.task_id,
          description: row.task_description,
          timestamp: Number(row.task_timestamp),
        },
        suggestion: {
          taskId: row.task_id,
          code: row.suggestion_code,
          language: row.suggestion_language,
          explanation: row.suggestion_explanation || undefined,
          appliedPreferences: row.suggestion_applied_preferences 
            ? JSON.parse(row.suggestion_applied_preferences)
            : [],
        },
        accepted: row.accepted,
      };

      // Add correction if exists
      if (row.correction_feedback) {
        taskHistory.correction = {
          taskId: row.task_id,
          originalCode: row.suggestion_code,
          correctedCode: row.correction_code || undefined,
          feedback: row.correction_feedback,
          correctionType: row.correction_type as any,
        };
      }

      return taskHistory;
    });
  } catch (error) {
    console.error('Error reading history from DB:', error);
    throw error;
  }
}

export async function addTaskToHistoryDB(task: TaskHistory): Promise<void> {
  try {
    const id = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await sql`
      INSERT INTO task_history (
        id,
        task_id,
        task_description,
        task_timestamp,
        suggestion_code,
        suggestion_language,
        suggestion_explanation,
        suggestion_applied_preferences,
        correction_feedback,
        correction_code,
        correction_type,
        accepted,
        timestamp
      )
      VALUES (
        ${id},
        ${task.task.id},
        ${task.task.description},
        ${task.task.timestamp},
        ${task.suggestion.code},
        ${task.suggestion.language},
        ${task.suggestion.explanation || null},
        ${JSON.stringify(task.suggestion.appliedPreferences)},
        ${task.correction?.feedback || null},
        ${task.correction?.correctedCode || null},
        ${task.correction?.correctionType || null},
        ${task.accepted},
        ${Date.now()}
      )
    `;
  } catch (error) {
    console.error('Error adding to history in DB:', error);
    throw error;
  }
}
