/**
 * Learning store - now delegates to storage adapter
 * Maintains backward compatibility while using PostgreSQL with JSON fallback
 */

export {
  getLearnedPreferences,
  addLearnedPreference,
  getTaskHistory,
  addTaskToHistory,
  buildContextFromPreferences,
} from './storage-adapter';
