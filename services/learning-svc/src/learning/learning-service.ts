import {
  LearningService,
  LearningSession,
  PerformanceMetrics,
  Explanation,
  SkillLevel,
  ConceptNode,
  DifficultyLevel,
  UserProfile,
  LearningGoal
} from '../types/index';

import { AdaptiveLearningEngineImpl } from './adaptive-engine';
import { LearningSessionManager, SessionCreationOptions } from './session-manager';
import { AuthService } from '../auth/auth-service';

import { UserProfileValidator, UserProfileUtils } from '../models/user-profile';
import { ContentGenerator } from './content-generator';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ExplanationRequest {
  concept: string;
  userLevel: SkillLevel;
  context?: string;
  preferredStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  includeExamples?: boolean;
  includeAnalogies?: boolean;
}

export interface LearningRecommendation {
  type: 'concept' | 'exercise' | 'review' | 'assessment';
  title: string;
  description: string;
  estimatedTime: number;
  difficulty: DifficultyLevel;
  priority: 'low' | 'medium' | 'high';
  reason: string;
}

export interface LearningInsights {
  overallProgress: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: LearningRecommendation[];
  learningVelocity: number;
  timeToNextMilestone: number;
  optimalStudySchedule: {
    bestTimeOfDay: string;
    recommendedSessionLength: number;
    suggestedFrequency: string;
  };
}

// ============================================================================
// LEARNING SERVICE IMPLEMENTATION
// ============================================================================

export class LearningServiceImpl implements LearningService {
  private adaptiveEngine: AdaptiveLearningEngineImpl;
  private sessionManager: LearningSessionManager;
  private authService: AuthService;
  private contentGenerator: ContentGenerator;

  // In-memory stores (replace with proper databases in production)
  private explanationCache: Map<string, Explanation> = new Map();
  private conceptLibrary: Map<string, ConceptNode> = new Map();

  constructor(
    adaptiveEngine?: AdaptiveLearningEngineImpl,
    sessionManager?: LearningSessionManager,
    authService?: AuthService
  ) {
    this.adaptiveEngine = adaptiveEngine || new AdaptiveLearningEngineImpl();
    this.sessionManager = sessionManager || new LearningSessionManager();
    this.authService = authService || new AuthService();
    this.contentGenerator = new ContentGenerator();

    // Initialize with sample data
    this.initializeSampleData();
  }

  // ============================================================================
  // CORE LEARNING SERVICE METHODS
  // ============================================================================

  async startLearningSession(userId: string, topic: string): Promise<LearningSession> {
    // Validate user exists
    const userProfile = await this.authService.getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }

    // Get user's skill level for the topic
    const userSkillLevel = userProfile.skillLevels.get(topic);
    const preferredDifficulty = this.determineDifficulty(userSkillLevel, userProfile.preferences.difficultyPreference);

    // Create session options
    const sessionOptions: SessionCreationOptions = {
      topic,
      preferredDifficulty,
      maxDuration: userProfile.preferences.sessionLength,
      learningGoals: userProfile.learningGoals
        .filter((goal: LearningGoal) => goal.targetConcepts.includes(topic))
        .map((goal: LearningGoal) => goal.id)
    };

    // Create the learning session
    const session = await this.sessionManager.createLearningSession(userId, sessionOptions);

    // Initialize adaptive learning for this session
    await this.adaptiveEngine.getPersonalizationModel(userId);

    return session;
  }

  async adaptDifficulty(sessionId: string, performance: PerformanceMetrics): Promise<void> {
    // Get the session
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Create performance data
    const performanceData = {
      sessionId,
      concept: session.learningPath[session.progress.currentStep]?.name || session.topic,
      metrics: performance,
      context: {
        currentDifficulty: session.currentDifficulty,
        sessionDuration: Date.now() - session.startTime.getTime(),
        hintsUsed: 0 // This would come from session metrics
      }
    };

    // Get difficulty adjustment from adaptive engine
    const adjustment = await this.adaptiveEngine.adjustDifficulty(session.userId, performanceData);

    // Update session difficulty if changed
    if (adjustment.toLevel !== session.currentDifficulty) {
      session.currentDifficulty = adjustment.toLevel;
      await this.sessionManager.updateSession(sessionId, {
        currentStep: session.progress.currentStep
      });
    }

    // Add performance data to adaptive engine
    await this.adaptiveEngine.addPerformanceData(session.userId, performance);

    // Update session metrics
    await this.sessionManager.updateSessionMetrics(sessionId, performance);
  }

  async generateExplanation(concept: string, userLevel: SkillLevel): Promise<Explanation> {
    // Check cache first
    const cacheKey = `${concept}-${userLevel.mastery}-${userLevel.confidence}`;
    const cached = this.explanationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get concept information
    const conceptNode = this.conceptLibrary.get(concept);
    if (!conceptNode) {
      throw new Error(`Concept not found: ${concept}`);
    }

    // Generate explanation based on user level
    const explanation = await this.createExplanation(concept, userLevel, conceptNode);

    // Cache the explanation
    this.explanationCache.set(cacheKey, explanation);

    return explanation;
  }

  async trackProgress(userId: string, concept: string, mastery: number): Promise<void> {
    // Validate inputs
    if (!UserProfileValidator.isValidMasteryLevel(mastery)) {
      throw new Error('Invalid mastery level');
    }

    // Get user profile
    const userProfile = await this.authService.getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }

    // Update skill level
    const confidence = this.calculateConfidence(mastery, userProfile.skillLevels.get(concept));
    const updatedSkillLevels = UserProfileUtils.updateSkillLevel(
      userProfile.skillLevels,
      concept,
      mastery,
      confidence
    );

    // Update user profile
    await this.authService.updateUserProfile(userId, {
      skillLevels: updatedSkillLevels,
      updatedAt: new Date()
    });

    // Update personalization model
    await this.adaptiveEngine.updatePersonalizationModel(userId, {
      skillLevels: new Map(Array.from(updatedSkillLevels.entries()).map(([k, v]) => [k, v.mastery]))
    });
  }

  // ============================================================================
  // EXTENDED LEARNING SERVICE METHODS
  // ============================================================================

  async getPersonalizedRecommendations(userId: string): Promise<LearningRecommendation[]> {
    const userProfile = await this.authService.getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }

    const recommendations: LearningRecommendation[] = [];

    // Get weak concepts that need review
    const weakConcepts = UserProfileUtils.getWeakestConcepts(userProfile.skillLevels, 3);
    weakConcepts.forEach(concept => {
      recommendations.push({
        type: 'review',
        title: `Review ${concept}`,
        description: `Strengthen your understanding of ${concept} concepts`,
        estimatedTime: 20,
        difficulty: 'beginner',
        priority: 'high',
        reason: 'Low mastery level detected'
      });
    });

    // Get concepts ready for advancement
    const strongConcepts = UserProfileUtils.getStrongestConcepts(userProfile.skillLevels, 2);
    strongConcepts.forEach(concept => {
      const conceptNode = this.conceptLibrary.get(concept);
      if (conceptNode) {
        recommendations.push({
          type: 'concept',
          title: `Advanced ${concept}`,
          description: `Explore advanced topics in ${concept}`,
          estimatedTime: 30,
          difficulty: 'advanced',
          priority: 'medium',
          reason: 'Strong foundation - ready for advanced material'
        });
      }
    });

    // Add goal-based recommendations
    userProfile.learningGoals
      .filter((goal: LearningGoal) => goal.status === 'active')
      .forEach((goal: LearningGoal) => {
        recommendations.push({
          type: 'concept',
          title: goal.title,
          description: goal.description,
          estimatedTime: 45,
          difficulty: 'intermediate',
          priority: goal.priority,
          reason: 'Active learning goal'
        });
      });

    // Sort by priority and return top 5
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5);
  }

  async getLearningInsights(userId: string): Promise<LearningInsights> {
    const userProfile = await this.authService.getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }

    // Get insights from adaptive engine
    const engineInsights = await this.adaptiveEngine.getLearningInsights(userId);

    // Calculate overall progress
    const overallProgress = UserProfileUtils.calculateOverallMastery(userProfile.skillLevels);

    // Get learning patterns
    const patterns = UserProfileUtils.identifyLearningPatterns(userProfile.progressHistory);

    // Get recommendations
    const recommendations = await this.getPersonalizedRecommendations(userId);

    // Calculate time to next milestone
    const timeToNextMilestone = this.calculateTimeToMilestone(userProfile, engineInsights.learningVelocity);

    return {
      overallProgress,
      strengths: engineInsights.strengths,
      weaknesses: engineInsights.weaknesses,
      recommendations,
      learningVelocity: engineInsights.learningVelocity,
      timeToNextMilestone,
      optimalStudySchedule: {
        bestTimeOfDay: engineInsights.optimalStudyTime,
        recommendedSessionLength: patterns.averageSessionLength,
        suggestedFrequency: this.calculateOptimalFrequency(engineInsights.learningVelocity)
      }
    };
  }

  async getConceptExplanation(request: ExplanationRequest): Promise<Explanation> {
    // Enhanced explanation generation with more options
    const explanation = await this.generateExplanation(request.concept, request.userLevel);

    // Customize based on request preferences
    if (request.preferredStyle) {
      explanation.content = await this.adaptExplanationForStyle(explanation.content, request.preferredStyle);
    }

    if (!request.includeExamples) {
      explanation.content.examples = [];
    }

    if (!request.includeAnalogies) {
      explanation.content.analogies = [];
    }

    return explanation;
  }

  async assessUserKnowledge(userId: string, concept: string): Promise<{
    currentLevel: SkillLevel;
    suggestedActions: string[];
    readinessForAdvancement: boolean;
  }> {
    const userProfile = await this.authService.getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }

    const currentLevel = userProfile.skillLevels.get(concept) || UserProfileUtils.createInitialSkillLevel(concept);
    const suggestedActions: string[] = [];
    let readinessForAdvancement = false;

    // Analyze current level and provide suggestions
    if (currentLevel.mastery < 0.3) {
      suggestedActions.push('Start with basic concepts and fundamentals');
      suggestedActions.push('Practice with guided exercises');
    } else if (currentLevel.mastery < 0.7) {
      suggestedActions.push('Continue practicing intermediate concepts');
      suggestedActions.push('Try applying knowledge to real-world scenarios');
    } else {
      suggestedActions.push('Ready for advanced topics');
      suggestedActions.push('Consider teaching others to reinforce learning');
      readinessForAdvancement = true;
    }

    // Check confidence level
    if (currentLevel.confidence < currentLevel.mastery - 0.2) {
      suggestedActions.push('Build confidence through additional practice');
    }

    return {
      currentLevel,
      suggestedActions,
      readinessForAdvancement
    };
  }

  // ============================================================================
  // SESSION MANAGEMENT METHODS
  // ============================================================================

  async pauseLearningSession(sessionId: string): Promise<LearningSession> {
    return await this.sessionManager.pauseSession(sessionId);
  }

  async resumeLearningSession(sessionId: string): Promise<LearningSession> {
    return await this.sessionManager.resumeSession(sessionId);
  }

  async completeLearningSession(sessionId: string): Promise<{
    summary: any;
    achievements: string[];
    nextRecommendations: LearningRecommendation[];
  }> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Complete the session
    const summary = await this.sessionManager.completeSession(sessionId);

    // Calculate achievements
    const achievements = this.calculateAchievements(session, summary);

    // Get next recommendations
    const nextRecommendations = await this.getPersonalizedRecommendations(session.userId);

    return {
      summary,
      achievements,
      nextRecommendations
    };
  }

  async getUserActiveSessions(userId: string): Promise<LearningSession[]> {
    return await this.sessionManager.getUserActiveSessions(userId);
  }

  async getSessionProgress(sessionId: string): Promise<{
    progress: any;
    timeRemaining: number;
    nextConcept: string | null;
  }> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const progress = await this.sessionManager.getSessionProgress(sessionId);

    // Calculate time remaining
    const sessionDuration = Date.now() - session.startTime.getTime();
    const averageTimePerConcept = sessionDuration / (session.progress.currentStep + 1);
    const remainingConcepts = session.progress.totalSteps - session.progress.currentStep - 1;
    const timeRemaining = remainingConcepts * averageTimePerConcept;

    // Get next concept
    const nextConcept = session.progress.currentStep + 1 < session.learningPath.length
      ? session.learningPath[session.progress.currentStep + 1].name
      : null;

    return {
      progress,
      timeRemaining,
      nextConcept
    };
  }

  // ============================================================================
  // CHAT / AI TUTOR METHODS
  // ============================================================================

  async processChatMessage(userId: string, request: any): Promise<{ message: string; suggestions?: string[] }> {
    const { message, context } = request;

    // Simple heuristic response generation (Mock AI)
    // In production, this would call an LLM service

    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      return {
        message: "Hello! I'm your AI Tutor. I can help you with your learning path, explain concepts, or review your progress. What would you like to do?",
        suggestions: ["Explain a concept", "Review my progress", "Start a quiz"]
      };
    }

    if (lowerMsg.includes('explain') || lowerMsg.includes('what is')) {
      // Extract potential concept
      const term = lowerMsg.replace('explain', '').replace('what is', '').trim();
      if (term) {
        try {
          // Fuzzy match logic
          const conceptId = this.findConcept(term);

          if (conceptId) {
            const userProfile = await this.authService.getUserProfile(userId);
            const level = userProfile?.skillLevels.get(conceptId) || { concept: conceptId, mastery: 0, confidence: 0, lastAssessed: new Date(), assessmentCount: 0 };
            const explanation = await this.generateExplanation(conceptId, level);
            return {
              message: explanation.content.summary + "\n\nWould you like a more detailed explanation or an example?",
              suggestions: ["Detailed explanation", "Show example", "Compare with..."]
            };
          } else {
            // Fallback if no concept found
            return {
              message: `I'm not sure about "${term}". I can explain topics like "React", "TypeScript", "Node.js", or "Databases".`,
              suggestions: ["What is React?", "Explain TypeScript"]
            };
          }
        } catch (e) {
          // Error handling
          return {
            message: `I encountered an error looking up "${term}". Please try again.`,
            suggestions: ["What is React?", "Explain TypeScript"]
          };
        }
      }
      return {
        message: `I can explain many concepts. Try asking about specific topics like "React", "TypeScript", or "Databases".`,
        suggestions: ["What is React?", "Explain TypeScript interfaces"]
      };
    }

    if (lowerMsg.includes('progress') || lowerMsg.includes('how am i doing')) {
      const insights = await this.getLearningInsights(userId);
      return {
        message: `You're making good progress! Your learning velocity is ${insights.learningVelocity > 0 ? 'steady' : 'getting started'}. You are strong in ${insights.strengths.join(', ') || 'basics'} but could focus more on ${insights.weaknesses.join(', ') || 'advanced topics'}.`,
        suggestions: ["View full detailed report", "Practice weak areas"]
      };
    }

    if (lowerMsg.includes('help')) {
      return {
        message: "I can help you learn new concepts, practice skills, and track your progress. Try asking 'What is TypeScript?' or 'Start a quiz'.",
        suggestions: ["Start a new session", "Explain a concept"]
      };
    }

    return {
      message: "I understand. That's an interesting point about " + (context?.topic || "learning") + ". Could you elaborate or ask a specific question?",
      suggestions: ["Tell me more", "Give an example", "Next topic"]
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private findConcept(term: string): string | null {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const termNorm = normalize(term);

    for (const [id, node] of this.conceptLibrary.entries()) {
      // Direct match
      if (id === term || node.name.toLowerCase() === term.toLowerCase()) {
        return id;
      }

      // Normalized match
      const idNorm = normalize(id);
      const nameNorm = normalize(node.name);

      if (idNorm.includes(termNorm) || nameNorm.includes(termNorm) || termNorm.includes(idNorm)) {
        return id;
      }
    }
    return null;
  }

  private determineDifficulty(
    userSkillLevel: SkillLevel | undefined,
    preference: 'adaptive' | 'challenging' | 'comfortable'
  ): DifficultyLevel {
    if (!userSkillLevel) {
      return 'beginner';
    }

    const mastery = userSkillLevel.mastery;

    switch (preference) {
      case 'challenging':
        if (mastery < 0.3) return 'intermediate';
        if (mastery < 0.6) return 'advanced';
        return 'expert';

      case 'comfortable':
        if (mastery < 0.5) return 'beginner';
        if (mastery < 0.8) return 'intermediate';
        return 'advanced';

      case 'adaptive':
      default:
        if (mastery < 0.4) return 'beginner';
        if (mastery < 0.7) return 'intermediate';
        if (mastery < 0.9) return 'advanced';
        return 'expert';
    }
  }

  private async createExplanation(
    concept: string,
    userLevel: SkillLevel,
    conceptNode: ConceptNode
  ): Promise<Explanation> {
    // Generate explanation content based on user level
    const complexity = this.determineComplexityLevel(userLevel.mastery);

    return {
      id: `explanation-${concept}-${Date.now()}`,
      concept,
      targetLevel: complexity,
      content: {
        summary: this.contentGenerator.generateSummary(concept, complexity),
        detailed: `Detailed explanation of ${concept} at ${complexity} level generated dynamically.`,
        examples: [this.contentGenerator.generateExample(concept, complexity)],
        analogies: [this.contentGenerator.generateAnalogy(concept, complexity)],
        stepByStep: this.generateStepByStep(concept, complexity),
        visualAids: [this.contentGenerator.generateDiagram(concept, complexity)]
      },
      prerequisites: conceptNode.prerequisites,
      nextSteps: this.generateNextSteps(concept, userLevel.mastery),
      estimatedReadTime: this.calculateReadTime(concept, complexity)
    };
  }

  private determineComplexityLevel(mastery: number): DifficultyLevel {
    if (mastery < 0.3) return 'beginner';
    if (mastery < 0.6) return 'intermediate';
    if (mastery < 0.8) return 'advanced';
    return 'expert';
  }

  // Removed placeholders: generateSummary, generateDetailedExplanation, generateExamples, generateAnalogies, generateVisualAids

  private generateStepByStep(concept: string, _level: DifficultyLevel): string[] {
    // Placeholder for step-by-step generation
    return [
      `Step 1: Understand the basics of ${concept}`,
      `Step 2: Practice with simple examples`,
      `Step 3: Apply to real-world scenarios`
    ];
  }
  private generateNextSteps(concept: string, mastery: number): string[] {
    if (mastery < 0.5) {
      return [`Practice more ${concept} exercises`, `Review prerequisite concepts`];
    } else if (mastery < 0.8) {
      return [`Explore advanced ${concept} topics`, `Apply ${concept} to projects`];
    } else {
      return [`Teach ${concept} to others`, `Contribute to ${concept} community`];
    }
  }

  private calculateReadTime(_concept: string, level: DifficultyLevel): number {
    const baseTimes: Record<DifficultyLevel, number> = {
      beginner: 5,
      intermediate: 8,
      advanced: 12,
      expert: 15
    };
    return baseTimes[level];
  }

  private calculateConfidence(mastery: number, existingSkill?: SkillLevel): number {
    // Calculate confidence based on mastery and assessment count
    const baseConfidence = mastery * 0.8; // Start with 80% of mastery

    if (existingSkill) {
      // Increase confidence with more assessments
      const assessmentBonus = Math.min(0.2, existingSkill.assessmentCount * 0.02);
      return Math.min(1.0, baseConfidence + assessmentBonus);
    }

    return baseConfidence;
  }

  private async adaptExplanationForStyle(content: any, style: string): Promise<any> {
    // Adapt explanation content based on learning style
    const adapted = { ...content };

    switch (style) {
      case 'visual':
        // Enhance visual elements
        adapted.detailed = `📊 Visual learner focus: ${adapted.detailed}`;
        break;
      case 'auditory':
        // Enhance verbal descriptions
        adapted.detailed = `🎧 Listen carefully: ${adapted.detailed}`;
        break;
      case 'kinesthetic':
        // Enhance hands-on elements
        adapted.detailed = `✋ Hands-on approach: ${adapted.detailed}`;
        break;
    }

    return adapted;
  }

  private calculateTimeToMilestone(userProfile: UserProfile, velocity: number): number {
    // Calculate time to reach next learning milestone
    const activeGoals = userProfile.learningGoals.filter((goal: LearningGoal) => goal.status === 'active');
    if (activeGoals.length === 0) return 0;

    // Find the closest goal
    const closestGoal = activeGoals.reduce((closest: LearningGoal, goal: LearningGoal) => {
      const currentMastery = goal.targetConcepts.reduce((avg: number, concept: string) => {
        const skill = userProfile.skillLevels.get(concept);
        return avg + (skill ? skill.mastery : 0);
      }, 0) / goal.targetConcepts.length;

      const timeToGoal = (goal.targetMastery - currentMastery) / velocity;
      const closestMastery = closest.targetConcepts.reduce((avg: number, concept: string) => {
        const skill = userProfile.skillLevels.get(concept);
        return avg + (skill ? skill.mastery : 0);
      }, 0) / closest.targetConcepts.length;
      const closestTime = (closest.targetMastery - closestMastery) / velocity;

      return timeToGoal < closestTime ? goal : closest;
    });

    const currentMastery = closestGoal.targetConcepts.reduce((avg: number, concept: string) => {
      const skill = userProfile.skillLevels.get(concept);
      return avg + (skill ? skill.mastery : 0);
    }, 0) / closestGoal.targetConcepts.length;

    return Math.max(0, (closestGoal.targetMastery - currentMastery) / velocity);
  }

  private calculateOptimalFrequency(velocity: number): string {
    if (velocity > 0.1) return 'Daily';
    if (velocity > 0.05) return '3-4 times per week';
    if (velocity > 0.02) return '2-3 times per week';
    return 'Weekly';
  }

  private calculateAchievements(_session: LearningSession, summary: any): string[] {
    const achievements: string[] = [];

    if (summary.overallAccuracy > 0.9) {
      achievements.push('🏆 Excellent Performance - 90%+ accuracy!');
    } else if (summary.overallAccuracy > 0.8) {
      achievements.push('🎯 Great Job - 80%+ accuracy!');
    }

    if (summary.masteredConcepts.length > 0) {
      achievements.push(`🧠 Mastered ${summary.masteredConcepts.length} new concept(s)!`);
    }

    if (summary.duration > 30 * 60 * 1000) { // 30 minutes
      achievements.push('⏰ Dedicated Learner - 30+ minute session!');
    }

    return achievements;
  }

  private initializeSampleData(): void {
    // Initialize with sample concepts and materials
    const sampleConcepts = [
      'javascript-basics',
      'react-fundamentals',
      'typescript-intro',
      'node-js-basics',
      'database-design'
    ];

    sampleConcepts.forEach(concept => {
      this.conceptLibrary.set(concept, {
        id: concept,
        name: concept.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `Learn about ${concept}`,
        prerequisites: [],
        difficulty: 'intermediate',
        learningMaterials: []
      });
    });
  }
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class LearningServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'LearningServiceError';
  }
}

export class ConceptNotFoundError extends LearningServiceError {
  constructor(concept: string) {
    super(`Concept not found: ${concept}`, 'CONCEPT_NOT_FOUND');
    this.name = 'ConceptNotFoundError';
  }
}

export class InvalidSessionError extends LearningServiceError {
  constructor(sessionId: string) {
    super(`Invalid or expired session: ${sessionId}`, 'INVALID_SESSION');
    this.name = 'InvalidSessionError';
  }
}