# Contributing to RestBolt

Thank you for your interest in contributing to RestBolt! 🎉

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- A GitHub account

### Setup Development Environment

1. **Fork the repository**
   - Click "Fork" button on GitHub
   - Clone your fork: `git clone https://github.com/YOUR_USERNAME/restbolt.git`

2. **Install dependencies**
   ```bash
   cd restbolt
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Run tests**
   ```bash
   # Run all tests
   npm test
   
   # Run tests in UI mode (recommended for development)
   npm run test:ui
   
   # Run tests with coverage
   npm run test:coverage
   
   # Run tests in watch mode
   npm run test:watch
   ```

## How to Contribute

### 1. Pick an Issue
- Browse [open issues](https://github.com/Dancode-188/restbolt/issues)
- Look for issues labeled `good first issue` for beginner-friendly tasks
- Comment on the issue to let us know you're working on it

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Your Changes
- Write clean, readable code
- Follow existing code style and patterns
- Add tests for new features
- Update documentation if needed

### 4. Test Your Changes
```bash
# Run tests
npm test

# Check test coverage
npm run test:coverage

# Run the app to test manually
npm run dev
```

### 5. Commit Your Changes
Use conventional commit messages:
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in http client"
git commit -m "test: add tests for chain service"
git commit -m "docs: update README with examples"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `style`: Code style changes (formatting)
- `chore`: Maintenance tasks

### 6. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title describing the change
- Description of what you changed and why
- Reference to related issue (e.g., "Closes #3")
- Screenshots/GIFs if relevant (for UI changes)

## Testing Guidelines

### Unit Tests
- **Location:** `src/lib/__tests__/` or `src/components/__tests__/`
- **Pattern:** Arrange-Act-Assert
- **Naming:** `should do X when Y happens`
- **Mocking:** Mock external dependencies (axios, localStorage, etc.)

**Example:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should return correct value when given valid input', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

### Component Tests
- Use `@testing-library/react`
- Test user interactions, not implementation details
- Use accessible queries (getByRole, getByLabelText, etc.)

**Example:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should update value on button click', () => {
    render(<MyComponent />);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    
    expect(screen.getByText('Updated!')).toBeInTheDocument();
  });
});
```

### Test Coverage Goals
- **Critical paths:** 80%+ coverage
- **Services:** 70%+ coverage
- **Components:** 60%+ coverage
- **Overall:** Aiming for 60-80%

## Code Style

- **TypeScript:** Use TypeScript for all new code
- **Formatting:** We follow the project's ESLint configuration
- **Naming:**
  - camelCase for variables and functions
  - PascalCase for components and classes
  - UPPERCASE for constants
- **Comments:** Write clear comments for complex logic

## Pull Request Review Process

1. **Automated Checks:** Tests and linting must pass
2. **Code Review:** Maintainer will review your code
3. **Feedback:** Address any requested changes
4. **Merge:** Once approved, your PR will be merged!

**Review Timeline:**
- Initial response: Within 48 hours
- Full review: Within 1 week

## Project Structure

```
restbolt/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   │   └── __tests__/    # Component tests
│   ├── lib/              # Core services and utilities
│   │   └── __tests__/    # Service tests
│   ├── tests/            # Test setup and utilities
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── vitest.config.ts      # Test configuration
```

## Key Services to Know

- **http-client.ts:** Handles HTTP requests
- **chain-service.ts:** Manages request chains
- **db.ts:** IndexedDB operations for offline storage
- **code-gen.ts:** Code generation for different languages
- **diff-service.ts:** Response diffing functionality

## Need Help?

- **Questions about code:** Comment on the issue or PR
- **General questions:** Open a [discussion](https://github.com/Dancode-188/restbolt/discussions)
- **Found a bug:** Open an [issue](https://github.com/Dancode-188/restbolt/issues/new)

## Recognition

All contributors will be:
- Listed in README.md
- Mentioned in release notes
- Forever grateful for making RestBolt better! 🙏

## Code of Conduct

- Be respectful and professional
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

---

Thank you for contributing to RestBolt! Your help makes this project better for everyone. 🚀
