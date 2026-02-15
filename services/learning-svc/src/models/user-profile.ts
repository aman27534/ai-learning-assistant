import {
  UserProfile,
  SkillLevel,
  LearningGoal,
  ProgressEntry,
  UserPreferences,
  LearningStyle
} from '../types/index';

// Simple validation functions to replace zod
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export class UserProfileValidator {
  static validateUserProfile(data: any): UserProfile {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid user profile data');
    }
    
    if (!data.id || typeof data.id !== 'string') {
      throw new ValidationError('Invalid user ID');
    }
    
    if (!data.email || typeof data.email !== 'string' || !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email');
    }
    
    return data as UserProfile;
  }

  static validateSkillLevel(data: any): SkillLevel {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid skill level data');
    }
    
    if (!data.concept || typeof data.concept !== 'string') {
      throw new ValidationError('Invalid concept');
    }
    
    if (typeof data.mastery !== 'number' || data.mastery < 0 || data.mastery > 1) {
      throw new ValidationError('Invalid mastery level');
    }
    
    return data as SkillLevel;
  }

  static validateLearningGoal(data: any): LearningGoal {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid learning goal data');
    }
    
    return data as LearningGoal;
  }

  static validateProgressEntry(data: any): ProgressEntry {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid progress entry data');
    }
    
    return data as ProgressEntry;
  }

  static validateUserPreferences(data: any): UserPreferences {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid user preferences data');
    }
    
    return data as UserPreferences;
  }

  static validatePartialUserProfile(data: any): Partial<UserProfile> {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid partial user profile data');
    }
    
    return data as Partial<UserProfile>;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidLearningStyle(style: string): style is LearningStyle {
    return ['visual', 'auditory', 'kinesthetic', 'mixed'].includes(style);
  }

  static isValidMasteryLevel(level: number): boolean {
    return level >= 0 && level <= 1;
  }

  static isValidSessionLength(minutes: number): boolean {
    return minutes >= 5 && minutes <= 180;
  }
}

// ============================================================================
// USER PROFILE UTILITIES
// ============================================================================

export class UserProfileUtils {
  static createDefaultPreferences(): UserPreferences {
    return {
      learningStyle: 'mixed',
      difficultyPreference: 'adaptive',
      sessionLength: 30,
      notificationSettings: {
        email: true,
        push: true,
        sessionReminders: true,
        progressUpdates: true,
        weeklyReports: false
      }
    };
  }

  static createInitialSkillLevel(concept: string): SkillLevel {
    return {
      concept,
      mastery: 0,
      confidence: 0,
      lastAssessed: new Date(),
      assessmentCount: 0
    };
  }

  static calculateOverallMastery(skillLevels: Map<string, SkillLevel>): number {
    if (skillLevels.size === 0) return 0;
    
    const totalMastery = Array.from(skillLevels.values())
      .reduce((sum, skill) => sum + skill.mastery, 0);
    
    return totalMastery / skillLevels.size;
  }

  static getWeakestConcepts(skillLevels: Map<string, SkillLevel>, limit: number = 5): string[] {
    return Array.from(skillLevels.entries())
      .sort(([, a], [, b]) => a.mastery - b.mastery)
      .slice(0, limit)
      .map(([concept]) => concept);
  }

  static getStrongestConcepts(skillLevels: Map<string, SkillLevel>, limit: number = 5): string[] {
    return Array.from(skillLevels.entries())
      .sort(([, a], [, b]) => b.mastery - a.mastery)
      .slice(0, limit)
      .map(([concept]) => concept);
  }

  static updateSkillLevel(
    skillLevels: Map<string, SkillLevel>,
    concept: string,
    newMastery: number,
    confidence: number
  ): Map<string, SkillLevel> {
    const updated = new Map(skillLevels);
    const existing = updated.get(concept);
    
    if (existing) {
      updated.set(concept, {
        ...existing,
        mastery: Math.max(0, Math.min(1, newMastery)),
        confidence: Math.max(0, Math.min(1, confidence)),
        lastAssessed: new Date(),
        assessmentCount: existing.assessmentCount + 1
      });
    } else {
      updated.set(concept, {
        concept,
        mastery: Math.max(0, Math.min(1, newMastery)),
        confidence: Math.max(0, Math.min(1, confidence)),
        lastAssessed: new Date(),
        assessmentCount: 1
      });
    }
    
    return updated;
  }

  static getRecentProgress(
    progressHistory: ProgressEntry[],
    days: number = 7
  ): ProgressEntry[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return progressHistory.filter(entry => entry.timestamp >= cutoffDate);
  }

  static calculateLearningVelocity(progressHistory: ProgressEntry[]): number {
    if (progressHistory.length < 2) return 0;
    
    const recentProgress = this.getRecentProgress(progressHistory, 7);
    const conceptsLearned = new Set(recentProgress.map(p => p.concept)).size;
    
    return conceptsLearned / 7; // concepts per day
  }

  static identifyLearningPatterns(progressHistory: ProgressEntry[]): {
    bestTimeOfDay: string;
    averageSessionLength: number;
    preferredActivityType: string;
  } {
    if (progressHistory.length === 0) {
      return {
        bestTimeOfDay: 'morning',
        averageSessionLength: 30,
        preferredActivityType: 'explanation_viewed'
      };
    }

    // Analyze time of day performance
    const hourlyPerformance = new Map<number, number[]>();
    progressHistory.forEach(entry => {
      const hour = entry.timestamp.getHours();
      if (!hourlyPerformance.has(hour)) {
        hourlyPerformance.set(hour, []);
      }
      hourlyPerformance.get(hour)!.push(entry.performance.accuracy);
    });

    let bestHour = 9; // default to 9 AM
    let bestPerformance = 0;
    hourlyPerformance.forEach((accuracies, hour) => {
      const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
      if (avgAccuracy > bestPerformance) {
        bestPerformance = avgAccuracy;
        bestHour = hour;
      }
    });

    const bestTimeOfDay = bestHour < 12 ? 'morning' : bestHour < 17 ? 'afternoon' : 'evening';

    // Calculate average session length
    const totalDuration = progressHistory.reduce((sum, entry) => sum + entry.activity.duration, 0);
    const averageSessionLength = Math.round(totalDuration / progressHistory.length / 60); // convert to minutes

    // Find preferred activity type
    const activityCounts = new Map<string, number>();
    progressHistory.forEach(entry => {
      const type = entry.activity.type;
      activityCounts.set(type, (activityCounts.get(type) || 0) + 1);
    });

    const preferredActivityType = Array.from(activityCounts.entries())
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'explanation_viewed';

    return {
      bestTimeOfDay,
      averageSessionLength,
      preferredActivityType
    };
  }
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class UserProfileValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'UserProfileValidationError';
  }
}

export class SkillLevelError extends Error {
  constructor(message: string, public concept?: string) {
    super(message);
    this.name = 'SkillLevelError';
  }
}