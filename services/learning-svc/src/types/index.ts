// AI Learning Assistant - Local Types for Learning Service
// This is a local copy of shared types to avoid TypeScript rootDir issues

// ============================================================================
// ENUMS AND BASIC TYPES
// ============================================================================

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";
export interface ChatRequest {
  message: string;
  context?: {
    sessionId?: string;
    topic?: string;
    currentConcept?: string;
  };
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  relatedConcepts?: string[];
  action?: 'none' | 'explanation' | 'quiz' | 'next';
}

export type LearningStyle = "visual" | "auditory" | "kinesthetic" | "mixed";

// ============================================================================
// USER PROFILE MODELS
// ============================================================================

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sessionReminders: boolean;
  progressUpdates: boolean;
  weeklyReports: boolean;
}

export interface UserPreferences {
  learningStyle: LearningStyle;
  difficultyPreference: "adaptive" | "challenging" | "comfortable";
  sessionLength: number; // minutes
  notificationSettings: NotificationPreferences;
}

export interface SkillLevel {
  concept: string;
  mastery: number; // 0-1 scale
  confidence: number; // 0-1 scale
  lastAssessed: Date;
  assessmentCount: number;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetConcepts: string[];
  targetMastery: number;
  deadline?: Date;
  priority: "low" | "medium" | "high";
  status: "active" | "completed" | "paused";
}

export interface ProgressEntry {
  id: string;
  userId: string;
  concept: string;
  sessionId: string;
  timestamp: Date;
  activity: {
    type: "explanation_viewed" | "exercise_completed" | "assessment_taken";
    duration: number;
    success: boolean;
    attempts: number;
    hints_used: number;
  };
  performance: {
    accuracy: number;
    speed: number;
    confidence: number;
  };
  adaptations: {
    difficultyAdjusted: boolean;
    contentPersonalized: boolean;
    pacingModified: boolean;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  preferences: UserPreferences;
  skillLevels: Map<string, SkillLevel>;
  learningGoals: LearningGoal[];
  progressHistory: ProgressEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// LEARNING CONTENT MODELS
// ============================================================================

export interface CodeExample {
  language: string;
  code: string;
  explanation: string;
  runnable: boolean;
  expectedOutput?: string;
}

export interface DiagramData {
  type: "flowchart" | "architecture" | "sequence" | "class" | "network";
  data: string; // Mermaid or other diagram format
  title: string;
  description?: string;
}

export interface InteractiveElement {
  type: "quiz" | "coding_challenge" | "drag_drop" | "simulation";
  data: Record<string, any>;
  instructions: string;
  hints?: string[];
}

export interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  type: "explanation" | "exercise" | "example" | "assessment";
  difficulty: DifficultyLevel;
  concepts: string[];
  prerequisites: string[];
  content: {
    text?: string;
    code?: CodeExample[];
    diagrams?: DiagramData[];
    interactive?: InteractiveElement[];
  };
  metadata: {
    estimatedTime: number;
    language?: string;
    framework?: string;
    tags: string[];
  };
}

// ============================================================================
// KNOWLEDGE GRAPH MODELS
// ============================================================================

export interface ConceptNode {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  difficulty: DifficultyLevel;
  learningMaterials: LearningMaterial[];
}

export interface LearningPath {
  id: string;
  fromConcept: string;
  toConcept: string;
  steps: ConceptNode[];
  estimatedTime: number;
  difficulty: DifficultyLevel;
}

// ============================================================================
// LEARNING SESSION MODELS
// ============================================================================

export interface ProgressState {
  currentStep: number;
  totalSteps: number;
  completedConcepts: string[];
  strugglingConcepts: string[];
  masteredConcepts: string[];
  conceptsCovered: number;
}

export interface LearningSession {
  id: string;
  userId: string;
  topic: string;
  currentDifficulty: DifficultyLevel;
  learningPath: ConceptNode[];
  progress: ProgressState;
  startTime: Date;
  endTime?: Date;
  status: "active" | "paused" | "completed" | "abandoned";
}

export interface PerformanceMetrics {
  accuracy: number;
  speed: number;
  engagement: number;
  retention: number;
  timestamp: Date;
}

export interface SessionMetrics {
  duration: number;
  conceptsCovered: number;
  exercisesCompleted: number;
  hintsUsed: number;
  averageAccuracy: number;
  engagementScore: number;
}

// ============================================================================
// ADAPTIVE LEARNING MODELS
// ============================================================================

export interface PersonalizationModel {
  userId: string;
  learningStyle: LearningStyle;
  skillLevels: Map<string, number>;
  preferences: UserPreferences;
  performanceHistory: PerformanceMetrics[];
}

export interface PersonalizedContent {
  originalContent: LearningMaterial;
  adaptedContent: LearningMaterial;
  adaptationReasons: string[];
  personalizedFor: string; // userId
}

export interface PerformanceData {
  sessionId: string;
  concept: string;
  metrics: PerformanceMetrics;
  context: Record<string, any>;
}

export interface DifficultyAdjustment {
  fromLevel: DifficultyLevel;
  toLevel: DifficultyLevel;
  reason: string;
  confidence: number;
}

export interface LearningPrediction {
  concept: string;
  predictedMastery: number;
  timeToMastery: number; // hours
  confidence: number;
  recommendedPath: string[];
}

export interface PacingRecommendation {
  sessionLength: number;
  breakFrequency: number;
  contentDensity: number;
  reason: string;
}

// ============================================================================
// EXPLANATION MODELS
// ============================================================================

export interface Explanation {
  id: string;
  concept: string;
  targetLevel: DifficultyLevel;
  content: {
    summary: string;
    detailed: string;
    examples: CodeExample[];
    analogies: string[];
    stepByStep: string[];
    visualAids: DiagramData[];
  };
  prerequisites: string[];
  nextSteps: string[];
  estimatedReadTime: number;
}

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface LearningService {
  startLearningSession(userId: string, topic: string): Promise<LearningSession>;
  adaptDifficulty(sessionId: string, performance: PerformanceMetrics): Promise<void>;
  generateExplanation(concept: string, userLevel: SkillLevel): Promise<Explanation>;
  trackProgress(userId: string, concept: string, mastery: number): Promise<void>;
}

export interface AdaptiveLearningEngine {
  personalizeContent(userId: string, content: LearningMaterial): Promise<PersonalizedContent>;
  adjustDifficulty(userId: string, performance: PerformanceData): Promise<DifficultyAdjustment>;
  predictLearningOutcome(userId: string, concept: string): Promise<LearningPrediction>;
  optimizePacing(userId: string, sessionData: SessionMetrics): Promise<PacingRecommendation>;
}