// Simple UUID generator to avoid external dependency
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
import {
  LearningSession,
  ProgressState,
  ConceptNode,
  DifficultyLevel,
  PerformanceMetrics,
  SessionMetrics
} from '../types/index';
import db from '../db';

// ============================================================================
// INTERFACES
// ============================================================================

export interface SessionCreationOptions {
  topic: string;
  preferredDifficulty?: DifficultyLevel;
  maxDuration?: number; // minutes
  learningGoals?: string[];
}

export interface SessionUpdateData {
  currentStep?: number;
  performance?: PerformanceMetrics;
  timeSpent?: number;
  hintsUsed?: number;
}

export interface SessionSummary {
  sessionId: string;
  topic: string;
  duration: number;
  conceptsCovered: string[];
  masteredConcepts: string[];
  strugglingConcepts: string[];
  overallAccuracy: number;
  recommendedNextSteps: string[];
}

// ============================================================================
// LEARNING SESSION MANAGER
// ============================================================================

export class LearningSessionManager {
  // Dependencies on db imported from ../db

  // ============================================================================
  // SESSION CREATION AND MANAGEMENT
  // ============================================================================

  async createLearningSession(
    userId: string,
    options: SessionCreationOptions
  ): Promise<LearningSession> {
    const sessionId = generateUUID();
    const now = new Date(); // object for returning, string for DB

    // Generate learning path for the topic
    const learningPath = await this.generateLearningPath(options.topic, options.preferredDifficulty);

    // Initialize progress state
    const progressState: ProgressState = {
      currentStep: 0,
      totalSteps: learningPath.length,
      completedConcepts: [],
      strugglingConcepts: [],
      masteredConcepts: [],
      conceptsCovered: 0
    };

    const session: LearningSession = {
      id: sessionId,
      userId,
      topic: options.topic,
      currentDifficulty: options.preferredDifficulty || 'intermediate',
      learningPath,
      progress: progressState,
      startTime: now,
      status: 'active'
    };

    // Transaction to insert session and initial metrics
    const createSessionTransaction = db.transaction(() => {
      db.prepare(`
            INSERT INTO sessions (id, user_id, topic, status, current_difficulty, learning_path, progress, start_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
        sessionId,
        userId,
        options.topic,
        'active',
        options.preferredDifficulty || 'intermediate',
        JSON.stringify(learningPath),
        JSON.stringify(progressState),
        now.toISOString()
      );

      db.prepare(`
            INSERT INTO session_metrics (session_id, duration, concepts_covered, exercises_completed, hints_used, average_accuracy, engagement_score)
            VALUES (?, 0, 0, 0, 0, 0, 1.0)
        `).run(sessionId);
    });

    createSessionTransaction();

    return session;
  }

  async getSession(sessionId: string): Promise<LearningSession | null> {
    const row: any = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      topic: row.topic,
      currentDifficulty: row.current_difficulty,
      learningPath: JSON.parse(row.learning_path),
      progress: JSON.parse(row.progress),
      startTime: new Date(row.start_time),
      status: row.status as any,
      endTime: row.end_time ? new Date(row.end_time) : undefined
    };
  }

  async getUserActiveSessions(userId: string): Promise<LearningSession[]> {
    const rows = db.prepare("SELECT * FROM sessions WHERE user_id = ? AND status = 'active'").all(userId);

    return rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      topic: row.topic,
      currentDifficulty: row.current_difficulty,
      learningPath: JSON.parse(row.learning_path),
      progress: JSON.parse(row.progress),
      startTime: new Date(row.start_time),
      status: row.status as any
    }));
  }

  async updateSession(sessionId: string, updateData: SessionUpdateData): Promise<LearningSession> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Update progress if provided
    if (updateData.currentStep !== undefined) {
      session.progress.currentStep = updateData.currentStep;

      // Update concepts based on progress
      if (updateData.currentStep < session.learningPath.length) {
        const currentConcept = session.learningPath[updateData.currentStep];
        if (!session.progress.completedConcepts.includes(currentConcept.name)) {
          session.progress.completedConcepts.push(currentConcept.name);
          session.progress.conceptsCovered++;
        }
      }
    }

    // Update performance metrics
    if (updateData.performance) {
      await this.updateSessionMetrics(sessionId, updateData.performance);

      // Analyze performance to update struggling/mastered concepts
      this.analyzePerformance(session, updateData.performance);
    }

    // Update session metrics
    if (updateData.timeSpent || updateData.hintsUsed) {
      const metrics = await this.getSessionMetrics(sessionId) || { duration: 0, hintsUsed: 0 };
      const newDuration = (metrics.duration || 0) + (updateData.timeSpent || 0);
      const newHints = (metrics.hintsUsed || 0) + (updateData.hintsUsed || 0);

      db.prepare(`
            UPDATE session_metrics 
            SET duration = ?, hints_used = ?
            WHERE session_id = ?
        `).run(newDuration, newHints, sessionId);
    }

    // Persist session updates
    db.prepare(`
        UPDATE sessions 
        SET progress = ?
        WHERE id = ?
    `).run(JSON.stringify(session.progress), sessionId);

    return session;
  }

  async pauseSession(sessionId: string): Promise<LearningSession> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'paused';
    db.prepare("UPDATE sessions SET status = 'paused' WHERE id = ?").run(sessionId);

    return session;
  }

  async resumeSession(sessionId: string): Promise<LearningSession> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'paused') {
      throw new Error('Session is not paused');
    }

    session.status = 'active';
    db.prepare("UPDATE sessions SET status = 'active' WHERE id = ?").run(sessionId);

    return session;
  }

  async completeSession(sessionId: string): Promise<SessionSummary> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Mark session as completed
    session.status = 'completed';
    session.endTime = new Date();

    db.prepare("UPDATE sessions SET status = 'completed', end_time = ? WHERE id = ?")
      .run(session.endTime.toISOString(), sessionId);

    // Generate session summary
    const summary = await this.generateSessionSummary(session);

    return summary;
  }

  async abandonSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    db.prepare("UPDATE sessions SET status = 'abandoned', end_time = ? WHERE id = ?")
      .run(new Date().toISOString(), sessionId);
  }

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  async trackProgress(sessionId: string, concept: string, mastery: number): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Update concept mastery
    if (mastery >= 0.8) {
      if (!session.progress.masteredConcepts.includes(concept)) {
        session.progress.masteredConcepts.push(concept);
        // Remove from struggling if it was there
        session.progress.strugglingConcepts = session.progress.strugglingConcepts
          .filter(c => c !== concept);
      }
    } else if (mastery < 0.4) {
      if (!session.progress.strugglingConcepts.includes(concept)) {
        session.progress.strugglingConcepts.push(concept);
      }
    }

    // Update completed concepts
    if (!session.progress.completedConcepts.includes(concept)) {
      session.progress.completedConcepts.push(concept);
    }

    // Persist
    db.prepare("UPDATE sessions SET progress = ? WHERE id = ?")
      .run(JSON.stringify(session.progress), sessionId);
  }

  async getSessionProgress(sessionId: string): Promise<ProgressState | null> {
    const session = await this.getSession(sessionId);
    return session ? session.progress : null;
  }

  async getProgressPercentage(sessionId: string): Promise<number> {
    const session = await this.getSession(sessionId);
    if (!session) return 0;

    return (session.progress.currentStep / session.progress.totalSteps) * 100;
  }

  // ============================================================================
  // SESSION METRICS AND ANALYTICS
  // ============================================================================

  async updateSessionMetrics(sessionId: string, performance: PerformanceMetrics): Promise<void> {
    const metrics = await this.getSessionMetrics(sessionId);
    if (!metrics) return;

    // Update average accuracy
    const currentAccuracy = metrics.averageAccuracy;
    const exerciseCount = metrics.exercisesCompleted;

    // Calculate new average
    const newAverage = (currentAccuracy * exerciseCount + performance.accuracy) / (exerciseCount + 1);

    // Update engagement score based on performance trends
    let engagementScore = metrics.engagementScore;
    if (performance.accuracy > 0.8) {
      engagementScore = Math.min(1.0, engagementScore + 0.1);
    } else if (performance.accuracy < 0.4) {
      engagementScore = Math.max(0.1, engagementScore - 0.1);
    }

    db.prepare(`
        UPDATE session_metrics 
        SET average_accuracy = ?, exercises_completed = exercises_completed + 1, engagement_score = ?
        WHERE session_id = ?
    `).run(newAverage, engagementScore, sessionId);
  }

  async getSessionMetrics(sessionId: string): Promise<SessionMetrics | null> {
    const row: any = db.prepare('SELECT * FROM session_metrics WHERE session_id = ?').get(sessionId);
    if (!row) return null;

    return {
      duration: row.duration,
      conceptsCovered: row.concepts_covered,
      exercisesCompleted: row.exercises_completed,
      hintsUsed: row.hints_used,
      averageAccuracy: row.average_accuracy,
      engagementScore: row.engagement_score
    };
  }

  async getUserSessionHistory(userId: string, limit?: number): Promise<LearningSession[]> {
    let query = "SELECT * FROM sessions WHERE user_id = ? AND status != 'active' ORDER BY end_time DESC";
    if (limit) query += ` LIMIT ${limit}`;

    const rows = db.prepare(query).all(userId);

    return rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      topic: row.topic,
      currentDifficulty: row.current_difficulty,
      learningPath: JSON.parse(row.learning_path),
      progress: JSON.parse(row.progress),
      startTime: new Date(row.start_time),
      status: row.status as any,
      endTime: row.end_time ? new Date(row.end_time) : undefined
    }));
  }

  async getUserSessionStats(userId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    totalStudyTime: number; // minutes
    averageSessionLength: number; // minutes
    conceptsMastered: number;
    averageAccuracy: number;
  }> {
    const sessions = db.prepare('SELECT * FROM sessions WHERE user_id = ?').all(userId) as any[];

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        totalStudyTime: 0,
        averageSessionLength: 0,
        conceptsMastered: 0,
        averageAccuracy: 0
      };
    }

    const completedSessions = sessions.filter(s => s.status === 'completed').length;

    // Get metrics for all user sessions
    const metrics: any[] = db.prepare(`
        SELECT m.* FROM session_metrics m
        JOIN sessions s ON m.session_id = s.id
        WHERE s.user_id = ?
    `).all(userId);

    const totalStudyTime = metrics.reduce((acc, m) => acc + (m.duration || 0), 0);
    const averageSessionLength = totalStudyTime / sessions.length;

    const allMasteredConcepts = new Set<string>();
    sessions.forEach(session => {
      const progress = JSON.parse(session.progress);
      progress.masteredConcepts.forEach((concept: string) => allMasteredConcepts.add(concept));
    });

    const totalAccuracy = metrics.reduce((acc, m) => acc + (m.average_accuracy || 0), 0);
    const averageAccuracy = totalAccuracy / metrics.length || 0;

    return {
      totalSessions: sessions.length,
      completedSessions,
      totalStudyTime,
      averageSessionLength,
      conceptsMastered: allMasteredConcepts.size,
      averageAccuracy
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async generateLearningPath(topic: string, difficulty?: DifficultyLevel): Promise<ConceptNode[]> {
    // In a real implementation, this would query the knowledge graph
    // For now, we'll create a simple mock learning path
    const concepts: ConceptNode[] = [
      {
        id: `${topic}-basics`,
        name: `${topic} Basics`,
        description: `Introduction to ${topic}`,
        prerequisites: [],
        difficulty: 'beginner',
        learningMaterials: []
      },
      {
        id: `${topic}-intermediate`,
        name: `${topic} Intermediate`,
        description: `Intermediate concepts in ${topic}`,
        prerequisites: [`${topic}-basics`],
        difficulty: 'intermediate',
        learningMaterials: []
      },
      {
        id: `${topic}-advanced`,
        name: `${topic} Advanced`,
        description: `Advanced topics in ${topic}`,
        prerequisites: [`${topic}-intermediate`],
        difficulty: 'advanced',
        learningMaterials: []
      }
    ];

    // Filter based on preferred difficulty
    if (difficulty === 'beginner') {
      return concepts.slice(0, 1);
    } else if (difficulty === 'intermediate') {
      return concepts.slice(0, 2);
    }

    return concepts;
  }

  private analyzePerformance(session: LearningSession, performance: PerformanceMetrics): void {
    const currentConcept = session.learningPath[session.progress.currentStep]?.name;
    if (!currentConcept) return;

    // Determine if user is struggling or mastering the concept
    if (performance.accuracy < 0.4) {
      if (!session.progress.strugglingConcepts.includes(currentConcept)) {
        session.progress.strugglingConcepts.push(currentConcept);
      }
    } else if (performance.accuracy >= 0.8) {
      if (!session.progress.masteredConcepts.includes(currentConcept)) {
        session.progress.masteredConcepts.push(currentConcept);
      }
      // Remove from struggling if it was there
      session.progress.strugglingConcepts = session.progress.strugglingConcepts
        .filter(c => c !== currentConcept);
    }
  }

  private async generateSessionSummary(session: LearningSession): Promise<SessionSummary> {
    const metrics = await this.getSessionMetrics(session.id);
    const duration = metrics?.duration || 0;

    // Generate recommendations based on performance
    const recommendedNextSteps: string[] = [];

    if (session.progress.strugglingConcepts.length > 0) {
      recommendedNextSteps.push(`Review struggling concepts: ${session.progress.strugglingConcepts.join(', ')}`);
    }

    if (session.progress.masteredConcepts.length > 0) {
      recommendedNextSteps.push('Continue to more advanced topics');
    }

    if (metrics && metrics.averageAccuracy < 0.6) {
      recommendedNextSteps.push('Consider reviewing prerequisite concepts');
    } else if (metrics && metrics.averageAccuracy > 0.8) {
      recommendedNextSteps.push('Ready for challenging material');
    }

    return {
      sessionId: session.id,
      topic: session.topic,
      duration,
      conceptsCovered: session.progress.completedConcepts,
      masteredConcepts: session.progress.masteredConcepts,
      strugglingConcepts: session.progress.strugglingConcepts,
      overallAccuracy: metrics?.averageAccuracy || 0,
      recommendedNextSteps
    };
  }

  // ============================================================================
  // SESSION CLEANUP AND MAINTENANCE
  // ============================================================================

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = new Date(now.getTime() - maxSessionAge).toISOString();

    // Auto-abandon old sessions
    db.prepare("UPDATE sessions SET status = 'abandoned', end_time = ? WHERE status = 'active' AND start_time < ?")
      .run(new Date().toISOString(), cutoff);
  }

  async getActiveSessionsCount(): Promise<number> {
    const result: any = db.prepare("SELECT COUNT(*) as count FROM sessions WHERE status = 'active'").get();
    return result.count;
  }

  async getAllActiveSessions(): Promise<LearningSession[]> {
    const rows = db.prepare("SELECT * FROM sessions WHERE status = 'active'").all();

    return rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      topic: row.topic,
      currentDifficulty: row.current_difficulty,
      learningPath: JSON.parse(row.learning_path),
      progress: JSON.parse(row.progress),
      startTime: new Date(row.start_time),
      status: row.status as any
    }));
  }
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class SessionError extends Error {
  constructor(message: string, public sessionId?: string) {
    super(message);
    this.name = 'SessionError';
  }
}

export class SessionNotFoundError extends SessionError {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`, sessionId);
    this.name = 'SessionNotFoundError';
  }
}

export class InvalidSessionStateError extends SessionError {
  constructor(message: string, sessionId?: string) {
    super(message, sessionId);
    this.name = 'InvalidSessionStateError';
  }
}