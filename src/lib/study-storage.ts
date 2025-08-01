import { v4 as uuidv4 } from 'uuid';

export interface StudyBlock {
  id: string;
  subject: string;
  description?: string;
  start: string; // ISO datetime string
  end: string;   // ISO datetime string
  priority: 'normal' | 'high';
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConflictError {
  message: string;
  conflictingBlock: StudyBlock;
}

const STORAGE_KEY = 'studyTimetable';

// Subject color mapping - consistent color assignment per subject
const SUBJECT_COLORS = [
  'subject-blue', 'subject-green', 'subject-purple', 'subject-orange',
  'subject-pink', 'subject-teal', 'subject-indigo', 'subject-cyan',
  'subject-red', 'subject-yellow'
];

class StudyStorageManager {
  private colorAssignments: Map<string, string> = new Map();

  // Load all study blocks from localStorage
  loadBlocks(): StudyBlock[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const data = JSON.parse(stored);
      const blocks = Array.isArray(data) ? data : [];
      
      // Rebuild color assignments
      this.rebuildColorAssignments(blocks);
      
      return blocks;
    } catch (error) {
      console.error('Failed to load study blocks:', error);
      return [];
    }
  }

  // Save all blocks to localStorage
  saveBlocks(blocks: StudyBlock[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    } catch (error) {
      console.error('Failed to save study blocks:', error);
      throw new Error('Failed to save data. Please try again.');
    }
  }

  // Create a new study block
  createBlock(data: Omit<StudyBlock, 'id' | 'color' | 'createdAt' | 'updatedAt'>): StudyBlock {
    const now = new Date().toISOString();
    const color = this.getSubjectColor(data.subject);
    
    const block: StudyBlock = {
      ...data,
      id: uuidv4(),
      color,
      createdAt: now,
      updatedAt: now,
    };

    return block;
  }

  // Update an existing block
  updateBlock(blocks: StudyBlock[], id: string, updates: Partial<StudyBlock>): StudyBlock {
    const blockIndex = blocks.findIndex(b => b.id === id);
    if (blockIndex === -1) {
      throw new Error('Study block not found');
    }

    const currentBlock = blocks[blockIndex];
    const updatedBlock = {
      ...currentBlock,
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    // Update color if subject changed
    if (updates.subject && updates.subject !== currentBlock.subject) {
      updatedBlock.color = this.getSubjectColor(updates.subject);
    }

    return updatedBlock;
  }

  // Validate block times and check for conflicts
  validateBlock(block: StudyBlock, existingBlocks: StudyBlock[], excludeId?: string): ConflictError | null {
    const start = new Date(block.start);
    const end = new Date(block.end);

    // Check if end is after start
    if (end <= start) {
      return {
        message: 'End time must be after start time',
        conflictingBlock: block
      };
    }

    // Check for overlaps with existing blocks
    const conflictingBlock = existingBlocks.find(existing => {
      if (existing.id === excludeId) return false; // Skip self when updating
      
      const existingStart = new Date(existing.start);
      const existingEnd = new Date(existing.end);
      
      // Check if blocks overlap
      return (start < existingEnd && end > existingStart);
    });

    if (conflictingBlock) {
      const conflictStart = new Date(conflictingBlock.start);
      const conflictEnd = new Date(conflictingBlock.end);
      
      return {
        message: `This block overlaps with your ${conflictingBlock.subject} session from ${this.formatTime(conflictStart)} to ${this.formatTime(conflictEnd)}`,
        conflictingBlock
      };
    }

    return null;
  }

  // Get or assign color for a subject
  private getSubjectColor(subject: string): string {
    const normalizedSubject = subject.toLowerCase().trim();
    
    if (this.colorAssignments.has(normalizedSubject)) {
      return this.colorAssignments.get(normalizedSubject)!;
    }

    // Assign new color
    const usedColors = new Set(this.colorAssignments.values());
    const availableColor = SUBJECT_COLORS.find(color => !usedColors.has(color)) || SUBJECT_COLORS[0];
    
    this.colorAssignments.set(normalizedSubject, availableColor);
    return availableColor;
  }

  // Rebuild color assignments from existing blocks
  private rebuildColorAssignments(blocks: StudyBlock[]): void {
    this.colorAssignments.clear();
    
    blocks.forEach(block => {
      const normalizedSubject = block.subject.toLowerCase().trim();
      if (!this.colorAssignments.has(normalizedSubject)) {
        this.colorAssignments.set(normalizedSubject, block.color);
      }
    });
  }

  // Format time for display
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Get total study time per subject for a date range
  getSubjectStats(blocks: StudyBlock[], startDate: Date, endDate: Date): Map<string, number> {
    const stats = new Map<string, number>();
    
    blocks.forEach(block => {
      const blockStart = new Date(block.start);
      if (blockStart >= startDate && blockStart <= endDate) {
        const duration = new Date(block.end).getTime() - new Date(block.start).getTime();
        const hours = duration / (1000 * 60 * 60);
        
        const current = stats.get(block.subject) || 0;
        stats.set(block.subject, current + hours);
      }
    });
    
    return stats;
  }

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.colorAssignments.clear();
  }
}

export const studyStorage = new StudyStorageManager();