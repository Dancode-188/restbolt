import * as Diff from 'diff';

export interface DiffResult {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  lineNumber?: number;
}

export interface ResponseComparison {
  leftLabel: string;
  rightLabel: string;
  leftData: any;
  rightData: any;
  diff: DiffResult[];
  summary: {
    additions: number;
    deletions: number;
    changes: number;
  };
}

class DiffService {
  /**
   * Compare two JSON objects and return a structured diff
   */
  compareResponses(
    left: { data: any; label?: string },
    right: { data: any; label?: string }
  ): ResponseComparison {
    // Format JSON for comparison
    const leftJson = this.formatJSON(left.data);
    const rightJson = this.formatJSON(right.data);

    // Calculate diff
    const diff = Diff.diffLines(leftJson, rightJson);

    // Process diff results
    const diffResults: DiffResult[] = [];
    let additions = 0;
    let deletions = 0;
    let lineNumber = 1;

    diff.forEach((part) => {
      const lines = part.value.split('\n').filter(line => line.length > 0);
      
      lines.forEach((line) => {
        if (part.added) {
          diffResults.push({
            type: 'added',
            value: line,
            lineNumber: lineNumber++,
          });
          additions++;
        } else if (part.removed) {
          diffResults.push({
            type: 'removed',
            value: line,
            lineNumber: lineNumber++,
          });
          deletions++;
        } else {
          diffResults.push({
            type: 'unchanged',
            value: line,
            lineNumber: lineNumber++,
          });
        }
      });
    });

    return {
      leftLabel: left.label || 'Response A',
      rightLabel: right.label || 'Response B',
      leftData: left.data,
      rightData: right.data,
      diff: diffResults,
      summary: {
        additions,
        deletions,
        changes: additions + deletions,
      },
    };
  }

  /**
   * Compare two responses side by side
   */
  compareSideBySide(
    left: { data: any; label?: string },
    right: { data: any; label?: string }
  ) {
    const leftJson = this.formatJSON(left.data);
    const rightJson = this.formatJSON(right.data);

    const diff = Diff.diffLines(leftJson, rightJson);

    const leftLines: DiffResult[] = [];
    const rightLines: DiffResult[] = [];

    diff.forEach((part) => {
      const lines = part.value.split('\n').filter(line => line.length > 0);

      if (part.added) {
        // Added lines only appear on the right
        lines.forEach(line => {
          rightLines.push({ type: 'added', value: line });
        });
      } else if (part.removed) {
        // Removed lines only appear on the left
        lines.forEach(line => {
          leftLines.push({ type: 'removed', value: line });
        });
      } else {
        // Unchanged lines appear on both sides
        lines.forEach(line => {
          leftLines.push({ type: 'unchanged', value: line });
          rightLines.push({ type: 'unchanged', value: line });
        });
      }
    });

    // Equalize line counts for proper side-by-side display
    const maxLength = Math.max(leftLines.length, rightLines.length);
    while (leftLines.length < maxLength) {
      leftLines.push({ type: 'unchanged', value: '' });
    }
    while (rightLines.length < maxLength) {
      rightLines.push({ type: 'unchanged', value: '' });
    }

    return {
      leftLabel: left.label || 'Response A',
      rightLabel: right.label || 'Response B',
      leftLines,
      rightLines,
      summary: {
        additions: rightLines.filter(l => l.type === 'added').length,
        deletions: leftLines.filter(l => l.type === 'removed').length,
        changes: rightLines.filter(l => l.type === 'added').length + 
                leftLines.filter(l => l.type === 'removed').length,
      },
    };
  }

  /**
   * Format data as pretty JSON string
   */
  private formatJSON(data: any): string {
    try {
      if (typeof data === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(data);
          return JSON.stringify(parsed, null, 2);
        } catch {
          return data;
        }
      }
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  /**
   * Get color for diff type (for UI)
   */
  getColorForType(type: DiffResult['type']): string {
    switch (type) {
      case 'added':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'removed':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      case 'unchanged':
        return 'text-gray-700 dark:text-gray-300';
    }
  }
}

export const diffService = new DiffService();
