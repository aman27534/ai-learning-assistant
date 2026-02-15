import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { LearningServiceImpl } from './learning/learning-service';
import { AdaptiveLearningEngineImpl } from './learning/adaptive-engine';
import { LearningSessionManager } from './learning/session-manager';
import { AuthService, createAuthMiddleware } from './auth/auth-service';
import { initDb } from './db';

// ============================================================================
// APPLICATION SETUP
// ============================================================================

const app = express();
initDb();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// ============================================================================
// SERVICE INITIALIZATION
// ============================================================================

const adaptiveEngine = new AdaptiveLearningEngineImpl();
const sessionManager = new LearningSessionManager();
const authService = new AuthService();
const learningService = new LearningServiceImpl(adaptiveEngine, sessionManager, authService);

// Auth middleware
const authMiddleware = createAuthMiddleware(authService);

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'learning-service', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.registerUser(email, password);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

// Learning session routes
app.post('/sessions', authMiddleware, async (req: any, res) => {
  try {
    const { topic } = req.body;
    const session = await learningService.startLearningSession(req.user.userId, topic);
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/sessions/active', authMiddleware, async (req: any, res) => {
  try {
    const sessions = await learningService.getUserActiveSessions(req.user.userId);
    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/sessions/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    return res.json({ success: true, data: session });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/sessions/:sessionId/progress', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updateData = req.body;
    const session = await sessionManager.updateSession(sessionId, updateData);
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/sessions/:sessionId/complete', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await learningService.completeLearningSession(sessionId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/sessions/:sessionId/pause', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await learningService.pauseLearningSession(sessionId);
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/sessions/:sessionId/resume', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await learningService.resumeLearningSession(sessionId);
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Learning content routes
app.post('/explanations', authMiddleware, async (req: any, res) => {
  try {
    const request = req.body;
    const explanation = await learningService.getConceptExplanation(request);
    res.json({ success: true, data: explanation });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/progress', authMiddleware, async (req: any, res) => {
  try {
    const { concept, mastery } = req.body;
    await learningService.trackProgress(req.user.userId, concept, mastery);
    res.json({ success: true, message: 'Progress tracked successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Recommendations and insights
app.get('/recommendations', authMiddleware, async (req: any, res) => {
  try {
    const recommendations = await learningService.getPersonalizedRecommendations(req.user.userId);
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/insights', authMiddleware, async (req: any, res) => {
  try {
    const insights = await learningService.getLearningInsights(req.user.userId);
    res.json({ success: true, data: insights });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/assess', authMiddleware, async (req: any, res) => {
  try {
    const { concept } = req.body;
    const assessment = await learningService.assessUserKnowledge(req.user.userId, concept);
    res.json({ success: true, data: assessment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/chat', authMiddleware, async (req: any, res) => {
  try {
    const request = req.body;
    const response = await learningService.processChatMessage(req.user.userId, request);
    res.json({ success: true, data: response });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Only start server if this file is run directly (not imported for testing)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Learning Service running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
  });
}

export default app;