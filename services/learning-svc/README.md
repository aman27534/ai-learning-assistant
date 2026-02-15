# Learning Service

The core learning service for the AI Learning Assistant platform. Provides personalized learning experiences, adaptive tutoring, and comprehensive progress tracking.

## Features

- **Personalized Learning Sessions**: Adaptive difficulty and content based on user skill levels
- **Intelligent Explanations**: Multi-layered concept explanations with examples and analogies
- **Progress Tracking**: Comprehensive skill level monitoring and learning analytics
- **Adaptive Engine**: Dynamic difficulty adjustment based on performance
- **Session Management**: Full lifecycle management of learning sessions
- **User Authentication**: Secure JWT-based authentication system

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Learning Sessions

- `POST /sessions` - Create learning session
- `GET /sessions/active` - Get active sessions
- `GET /sessions/:id` - Get session details
- `PUT /sessions/:id/progress` - Update session progress
- `POST /sessions/:id/complete` - Complete session
- `POST /sessions/:id/pause` - Pause session
- `POST /sessions/:id/resume` - Resume session

### Learning Content

- `POST /explanations` - Get concept explanations
- `POST /progress` - Track learning progress
- `GET /recommendations` - Get personalized recommendations
- `GET /insights` - Get learning insights and analytics
- `POST /assess` - Assess user knowledge

### Health Check

- `GET /health` - Service health status

## Development

### Prerequisites

- Node.js 18+
- TypeScript
- npm or yarn

### Setup

```bash
# Quick setup (Windows)
run.bat

# Or PowerShell
./run.ps1

# Or manual setup
node setup.js

# Install dependencies manually if needed
npm install

# Build and start
node build.js
node start.js
```

### Development

```bash
# Start development server
node dev.js

# Or use npm if available
npm run dev

# Build project
node build.js

# Start production server
node start.js
```

### Testing

```bash
# Run all tests
npm test

# Or use npx directly
npx jest

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix

# Type checking
npm run type-check
```

## Docker

### Build Image

```bash
docker build -t learning-service .
```

### Run Container

```bash
docker run -p 3001:3001 learning-service
```

### Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `DATABASE_URL` - Database connection string
- `REDIS_URL` - Redis connection string

## Architecture

### Core Components

1. **Learning Service** (`src/learning/learning-service.ts`)
   - Main service orchestrator
   - Handles learning sessions and content delivery
   - Integrates with adaptive engine and session manager

2. **Adaptive Engine** (`src/learning/adaptive-engine.ts`)
   - Personalization algorithms
   - Difficulty adjustment logic
   - Learning outcome predictions

3. **Session Manager** (`src/learning/session-manager.ts`)
   - Session lifecycle management
   - Progress tracking
   - Session analytics

4. **Auth Service** (`src/auth/auth-service.ts`)
   - User authentication and authorization
   - JWT token management
   - Session security

5. **User Profile Models** (`src/models/user-profile.ts`)
   - User data validation
   - Skill level management
   - Progress utilities

### Data Flow

```
Client Request → Auth Middleware → Learning Service → Adaptive Engine
                                        ↓
Session Manager ← Progress Tracking ← User Profile Models
```

## Testing Strategy

### Unit Tests

- Individual component testing
- Mock external dependencies
- Focus on business logic validation

### Integration Tests

- API endpoint testing
- End-to-end request/response validation
- Authentication flow testing

### Property-Based Tests

- Correctness property validation
- Edge case discovery
- Invariant testing

## Error Handling

The service implements comprehensive error handling:

- **Validation Errors**: Input validation with descriptive messages
- **Authentication Errors**: JWT validation and session management
- **Business Logic Errors**: Domain-specific error handling
- **System Errors**: Graceful degradation and logging

## Performance Considerations

- **Caching**: In-memory caching for frequently accessed data
- **Session Management**: Efficient session state tracking
- **Async Operations**: Non-blocking I/O operations
- **Resource Cleanup**: Automatic cleanup of expired sessions

## Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Configurable CORS policies
- **Helmet Security**: Security headers and protection

## Monitoring

- **Health Checks**: Built-in health monitoring endpoint
- **Logging**: Structured logging with Winston
- **Metrics**: Performance and business metrics
- **Error Tracking**: Comprehensive error logging

## Contributing

1. Follow TypeScript best practices
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Follow conventional commit messages
5. Ensure all tests pass before submitting PRs

## License

MIT License - see LICENSE file for details
