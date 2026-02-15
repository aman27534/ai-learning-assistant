# Contributing to AI Learning Assistant

Thank you for your interest in contributing to the AI Learning Assistant! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git
- Basic knowledge of TypeScript and microservices

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/yourusername/ai-learning-assistant.git
   cd ai-learning-assistant
   ```

2. **Install dependencies**

   ```bash
   # Learning Service
   cd services/learning-svc
   npm install
   cd ../..

   # API Gateway
   cd services/api-gateway
   npm install
   cd ../..
   ```

3. **Start development environment**

   ```bash
   # Terminal 1: Learning Service
   cd services/learning-svc
   npm run dev

   # Terminal 2: API Gateway
   cd services/api-gateway
   npm run dev
   ```

4. **Run tests to ensure everything works**
   ```bash
   cd services/learning-svc
   npm test
   ```

## 🛠️ Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting and naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing

- Write unit tests for new functionality
- Ensure all tests pass before submitting PR
- Aim for high test coverage
- Include property-based tests for complex logic

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:

```
feat(learning): add adaptive difficulty adjustment
fix(auth): resolve JWT token expiration issue
docs(api): update authentication endpoints
```

### Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**

   ```bash
   npm test
   npm run build
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat(scope): your feature description"
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear, descriptive title
   - Provide detailed description of changes
   - Reference any related issues
   - Include screenshots if applicable

## 🐛 Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: OS, Node.js version, browser (if applicable)
- **Screenshots**: If applicable

Use the bug report template:

```markdown
## Bug Description

Brief description of the bug

## Steps to Reproduce

1. Step one
2. Step two
3. Step three

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- OS: [e.g., Windows 11, macOS 12, Ubuntu 20.04]
- Node.js: [e.g., 18.17.0]
- Browser: [e.g., Chrome 91, Firefox 89]

## Additional Context

Any other relevant information
```

## 💡 Feature Requests

For feature requests, please include:

- **Problem**: What problem does this solve?
- **Solution**: Proposed solution
- **Alternatives**: Alternative solutions considered
- **Use Cases**: Specific use cases
- **Priority**: How important is this feature?

## 🏗️ Architecture Guidelines

### Service Structure

Each service should follow this structure:

```
service-name/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── __tests__/       # Test files
├── package.json
├── tsconfig.json
└── Dockerfile
```

### API Design

- Use RESTful conventions
- Include proper HTTP status codes
- Provide consistent error responses
- Use JSON for request/response bodies
- Include API documentation

### Database Guidelines

- Use TypeScript interfaces for data models
- Include proper validation
- Use transactions for multi-step operations
- Optimize queries for performance

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions and methods
- Mock external dependencies
- Use descriptive test names
- Group related tests with `describe` blocks

### Integration Tests

- Test API endpoints end-to-end
- Use test databases
- Clean up test data after each test

### Property-Based Tests

- Use for complex business logic
- Test invariants and properties
- Generate diverse test inputs

Example test structure:

```typescript
describe("LearningService", () => {
  describe("startLearningSession", () => {
    it("should create session for valid user", async () => {
      // Test implementation
    });

    it("should throw error for invalid user", async () => {
      // Test implementation
    });
  });
});
```

## 📚 Documentation

### Code Documentation

- Use JSDoc for public APIs
- Include parameter and return type descriptions
- Provide usage examples

### API Documentation

- Document all endpoints
- Include request/response examples
- Specify authentication requirements

### README Updates

- Update README for new features
- Include setup instructions
- Add usage examples

## 🔒 Security Guidelines

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Use HTTPS in production
- Follow OWASP security guidelines

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check existing docs first

## 🎉 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to the AI Learning Assistant! 🚀
