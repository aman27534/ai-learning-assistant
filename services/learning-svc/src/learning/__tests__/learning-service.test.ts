import { LearningServiceImpl } from '../learning-service';
import { AdaptiveLearningEngineImpl } from '../adaptive-engine';
import { LearningSessionManager } from '../session-manager';
import { AuthService } from '../../auth/auth-service';

describe('LearningService', () => {
  let learningService: LearningServiceImpl;
  let adaptiveEngine: AdaptiveLearningEngineImpl;
  let sessionManager: LearningSessionManager;
  let authService: AuthService;

  beforeEach(() => {
    adaptiveEngine = new AdaptiveLearningEngineImpl();
    sessionManager = new LearningSessionManager();
    authService = new AuthService();
    learningService = new LearningServiceImpl(adaptiveEngine, sessionManager, authService);
  });

  describe('startLearningSession', () => {
    it('should throw error for non-existent user', async () => {
      const userId = 'non-existent-user';
      const topic = 'javascript-basics';

      await expect(learningService.startLearningSession(userId, topic))
        .rejects.toThrow('User not found');
    });

    it('should create session for valid user', async () => {
      // First register a user
      const { user } = await authService.registerUser('test@example.com', 'Password123!');
      
      const session = await learningService.startLearningSession(user.id, 'javascript-basics');
      
      expect(session).toBeDefined();
      expect(session.userId).toBe(user.id);
      expect(session.topic).toBe('javascript-basics');
      expect(session.status).toBe('active');
    });
  });

  describe('trackProgress', () => {
    it('should throw error for invalid mastery level', async () => {
      const userId = 'test-user';
      const concept = 'javascript-basics';
      const invalidMastery = 1.5; // Invalid: > 1

      await expect(learningService.trackProgress(userId, concept, invalidMastery))
        .rejects.toThrow('Invalid mastery level');
    });

    it('should throw error for non-existent user', async () => {
      const userId = 'non-existent-user';
      const concept = 'javascript-basics';
      const mastery = 0.8;

      await expect(learningService.trackProgress(userId, concept, mastery))
        .rejects.toThrow('User not found');
    });
  });

  describe('generateExplanation', () => {
    it('should throw error for non-existent concept', async () => {
      const concept = 'non-existent-concept';
      const userLevel = {
        concept: 'test',
        mastery: 0.5,
        confidence: 0.5,
        lastAssessed: new Date(),
        assessmentCount: 1
      };

      await expect(learningService.generateExplanation(concept, userLevel))
        .rejects.toThrow('Concept not found');
    });

    it('should generate explanation for valid concept', async () => {
      const concept = 'javascript-basics';
      const userLevel = {
        concept: 'javascript-basics',
        mastery: 0.5,
        confidence: 0.5,
        lastAssessed: new Date(),
        assessmentCount: 1
      };

      const explanation = await learningService.generateExplanation(concept, userLevel);
      
      expect(explanation).toBeDefined();
      expect(explanation.concept).toBe(concept);
      expect(explanation.content).toBeDefined();
      expect(explanation.content.summary).toBeDefined();
    });
  });

  describe('getPersonalizedRecommendations', () => {
    it('should throw error for non-existent user', async () => {
      const userId = 'non-existent-user';

      await expect(learningService.getPersonalizedRecommendations(userId))
        .rejects.toThrow('User not found');
    });

    it('should return recommendations for valid user', async () => {
      // Register a user
      const { user } = await authService.registerUser('test2@example.com', 'Password123!');
      
      const recommendations = await learningService.getPersonalizedRecommendations(user.id);
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });
});