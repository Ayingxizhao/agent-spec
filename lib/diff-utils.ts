import * as Diff from 'diff';

export interface DiffResult {
  unifiedDiff: string;
  changes: Diff.Change[];
  addedLines: number;
  removedLines: number;
}

/**
 * Compute a unified diff between two code strings
 */
export function computeCodeDiff(
  oldCode: string,
  newCode: string,
  oldFileName: string = 'original.js',
  newFileName: string = 'modified.js'
): DiffResult {
  // Create unified diff
  const unifiedDiff = Diff.createTwoFilesPatch(
    oldFileName,
    newFileName,
    oldCode,
    newCode,
    'Original',
    'Modified'
  );

  // Get structured changes
  const changes = Diff.diffLines(oldCode, newCode);

  // Count added and removed lines
  let addedLines = 0;
  let removedLines = 0;

  changes.forEach(change => {
    if (change.added) {
      addedLines += change.count || 0;
    } else if (change.removed) {
      removedLines += change.count || 0;
    }
  });

  return {
    unifiedDiff,
    changes,
    addedLines,
    removedLines,
  };
}

/**
 * Format diff for display in UI
 */
export function formatDiffForDisplay(diff: DiffResult): string {
  return diff.unifiedDiff;
}
