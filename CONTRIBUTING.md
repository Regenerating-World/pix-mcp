# Contributing to Pix MCP Server

Thank you for your interest in contributing to the Pix MCP Server! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Efí (Gerencianet) sandbox account for testing

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/pix-mcp-server.git
   cd pix-mcp-server
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy environment template:
   ```bash
   cp .env.example .env
   ```

5. Configure your test credentials in `.env`

6. Build and test:
   ```bash
   npm run build
   npm test
   npx tsx examples/test-server.ts
   ```

## 🏗️ Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Add tests for new functionality

4. Run the test suite:
   ```bash
   npm test
   npm run lint
   npm run build
   ```

5. Commit with descriptive messages:
   ```bash
   git commit -m "feat: add support for Cielo provider"
   ```

6. Push and create a pull request

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or modifications
- `chore:` Build process or auxiliary tool changes

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- Unit tests: `src/**/*.test.ts`
- Integration tests: `src/test/integration/`
- Mock providers for testing: `src/test/mocks/`

### Writing Tests

- Write tests for all new functionality
- Maintain high test coverage (>80%)
- Use descriptive test names
- Mock external dependencies

## 📝 Code Style

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper error handling with typed errors
- Document public APIs with JSDoc comments

### Formatting

We use Prettier and ESLint:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Code Organization

```
src/
├── index.ts              # Main server entry point
├── services/             # Business logic
├── providers/            # Payment provider implementations
├── types/               # Type definitions
├── utils/               # Utility functions
└── test/                # Test files
```

## 🔌 Adding New Providers

To add a new Pix provider (Phase 2):

1. Create provider class implementing `PixProvider` interface:
   ```typescript
   // src/providers/NewProvider.ts
   export class NewProvider implements PixProvider {
     name = 'New Provider';
     
     async createPixCharge(request: PixChargeRequest): Promise<PixChargeResponse> {
       // Implementation
     }
   }
   ```

2. Add provider configuration types to `PixTypes.ts`

3. Add provider to the service initialization

4. Write comprehensive tests

5. Update documentation

## 🐛 Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)
- Relevant logs or error messages

Use our bug report template in GitHub Issues.

## 💡 Feature Requests

For new features:

- Check existing issues and roadmap
- Describe the use case and benefits
- Consider implementation complexity
- Discuss with maintainers before starting work

## 📋 Pull Request Process

1. Ensure your PR addresses a specific issue
2. Update documentation if needed
3. Add tests for new functionality
4. Ensure all checks pass
5. Request review from maintainers
6. Address feedback promptly

### PR Checklist

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No breaking changes (or properly documented)
- [ ] Security considerations addressed

## 🔒 Security

- Never commit sensitive credentials
- Use environment variables for configuration
- Follow secure coding practices
- Report security issues privately to maintainers

## 📞 Getting Help

- GitHub Discussions for questions
- GitHub Issues for bugs and features
- Email maintainers for security issues

## 🎯 Roadmap Priorities

Current focus areas:

1. **Phase 2**: Multi-provider support (Cielo, Adyen)
2. **Phase 3**: MCP registry integration
3. **Phase 4**: Additional tools (status, cancel)

See our [project roadmap](README.md#roadmap) for details.

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Pix MCP Server! 🚀
