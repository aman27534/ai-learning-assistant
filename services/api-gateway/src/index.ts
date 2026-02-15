import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';

// ============================================================================
// APPLICATION SETUP
// ============================================================================

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3100', 'http://localhost:3101'],
  credentials: true
}));
app.use(morgan('combined'));
// app.use(express.json()); // Moved to specific routes to avoid conflict with proxies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
// app.use(limiter);

// ============================================================================
// SERVICE CONFIGURATION
// ============================================================================

const services = {
  learning: process.env.LEARNING_SERVICE_URL || 'http://localhost:3001',
  productivity: process.env.PRODUCTIVITY_SERVICE_URL || 'http://localhost:3002',
  knowledgeGraph: process.env.KNOWLEDGE_GRAPH_SERVICE_URL || 'http://localhost:3003',
  content: process.env.CONTENT_SERVICE_URL || 'http://localhost:3004',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3005'
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: services
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: services
  });
});

// ============================================================================
// GENERAL TASK EXECUTION ENDPOINT
// ============================================================================

app.post('/general-task-execution', express.json(), async (req, res) => {
  try {
    const { task, service = 'learning', ...params } = req.body;

    if (!task) {
      return res.status(400).json({
        success: false,
        error: 'Task parameter is required'
      });
    }

    // Route to appropriate service based on task type
    let targetService = services.learning; // default

    switch (service) {
      case 'productivity':
        targetService = services.productivity;
        break;
      case 'knowledge':
        targetService = services.knowledgeGraph;
        break;
      case 'learning':
      default:
        targetService = services.learning;
        break;
    }

    // For now, return a success response with task details
    // In a real implementation, this would forward to the appropriate service
    return res.json({
      success: true,
      message: 'Task execution initiated',
      data: {
        task,
        service,
        targetService,
        params,
        status: 'queued',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

app.get('/general-task-execution', (req, res) => {
  res.json({
    success: true,
    message: 'General Task Execution Service',
    description: 'POST to this endpoint to execute tasks across services',
    usage: {
      method: 'POST',
      body: {
        task: 'string (required) - The task to execute',
        service: 'string (optional) - Target service: learning, productivity, knowledge',
        params: 'object (optional) - Additional parameters for the task'
      }
    },
    availableServices: Object.keys(services)
  });
});

// ============================================================================
// SERVICE PROXIES
// ============================================================================

// Learning Service Proxy
app.use('/api/learning', createProxyMiddleware({
  target: services.learning,
  changeOrigin: true,
  pathRewrite: {
    '^/api/learning': '', // remove /api/learning prefix
  },
  onError: (err, req, res) => {
    console.error('Learning service proxy error:', err);
    res.status(503).json({ error: 'Learning service unavailable' });
  }
}));

// Productivity Service Proxy (when implemented)
app.use('/api/productivity', createProxyMiddleware({
  target: services.productivity,
  changeOrigin: true,
  pathRewrite: {
    '^/api/productivity': '',
  },
  onError: (err, req, res) => {
    console.error('Productivity service proxy error:', err);
    res.status(503).json({ error: 'Productivity service unavailable' });
  }
}));

// Knowledge Graph Service Proxy (when implemented)
app.use('/api/knowledge', createProxyMiddleware({
  target: services.knowledgeGraph,
  changeOrigin: true,
  pathRewrite: {
    '^/api/knowledge': '',
  },
  onError: (err, req, res) => {
    console.error('Knowledge Graph service proxy error:', err);
    res.status(503).json({ error: 'Knowledge Graph service unavailable' });
  }
}));

// Content Service Proxy
app.use('/api/content', createProxyMiddleware({
  target: services.content,
  changeOrigin: true,
  pathRewrite: {
    '^/api/content': '',
  },
  onError: (err, req, res) => {
    console.error('Content service proxy error:', err);
    res.status(503).json({ error: 'Content service unavailable' });
  }
}));

// Analytics Service Proxy
app.use('/api/analytics', createProxyMiddleware({
  target: services.analytics,
  changeOrigin: true,
  pathRewrite: {
    '^/api/analytics': '',
  },
  onError: (err, req, res) => {
    console.error('Analytics service proxy error:', err);
    res.status(503).json({ error: 'Analytics service unavailable' });
  }
}));

// ============================================================================
// FALLBACK ROUTES
// ============================================================================

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    availableRoutes: [
      'GET /health',
      'GET /general-task-execution',
      'POST /general-task-execution',
      'ALL /api/learning/*',
      'ALL /api/productivity/*',
      'ALL /api/knowledge/*',
      'ALL /api/content/*',
      'ALL /api/analytics/*'
    ]
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: any, req: any, res: any, next: any) => {
  console.error('API Gateway Error:', err);
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
    console.log(`🚀 API Gateway running on port ${port}`);
    console.log(`📍 Health check: http://localhost:${port}/health`);
    console.log(`🔗 General Task Execution: http://localhost:${port}/general-task-execution`);
    console.log(`🔄 Service Proxies:`);
    console.log(`   Learning: ${services.learning}`);
    console.log(`   Productivity: ${services.productivity}`);
    console.log(`   Knowledge Graph: ${services.knowledgeGraph}`);
    console.log(`   Content: ${services.content}`);
    console.log(`   Analytics: ${services.analytics}`);
  });
}

export default app;