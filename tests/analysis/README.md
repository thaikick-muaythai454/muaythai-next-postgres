# Cleanup Tool Test Suite

This directory contains comprehensive tests for the unused file cleanup tool analysis functionality.

## Test Structure

### Test Files

- **`test-utilities.ts`** - Core testing utilities and mock file system
- **`test-fixtures.ts`** - Predefined test project structures
- **`dependency-scanner.test.ts`** - Unit tests for dependency analysis
- **`cleanup-integration.test.ts`** - Integration tests for cleanup workflows
- **`safety-scenarios.test.ts`** - Edge cases and safety scenario tests
- **`run-tests.js`** - Test runner script

### Test Categories

#### 1. Unit Tests (`dependency-scanner.test.ts`)
- Dependency graph building
- Import/export parsing
- Path resolution
- Performance testing
- Error handling

#### 2. Integration Tests (`cleanup-integration.test.ts`)
- End-to-end cleanup workflows
- Asset cleanup integration
- Test file cleanup integration
- Component cleanup integration
- Configuration and safety integration
- Performance integration tests
- Error recovery

#### 3. Safety Tests (`safety-scenarios.test.ts`)
- Critical file protection
- Circular dependency handling
- Framework-specific edge cases
- Build tool integration
- File system edge cases
- Memory and performance limits
- Validation safety checks

## Test Utilities

### MockFileSystemManager
Provides a mock file system for testing without touching real files:

```typescript
const mockFs = new MockFileSystemManager('/test-project');
mockFs.createFile('src/index.ts', 'console.log("test");', FileType.TYPESCRIPT);
mockFs.createDirectory('src/components');
```

### TestFixtureGenerator
Generates predefined project structures for testing:

```typescript
const reactProject = TestFixtureGenerator.generateReactProject();
const complexProject = TestFixtureGenerator.generateComplexProject();
const largeProject = TestFixtureGenerator.generateLargeProject(1000);
```

### DependencyGraphValidator
Validates dependency graph correctness:

```typescript
const validation = DependencyGraphValidator.validateGraph(graph);
expect(validation.isValid).toBe(true);
```

### CleanupTestAssertions
Provides specialized assertions for cleanup operations:

```typescript
CleanupTestAssertions.assertUnusedFiles(actual, expected, 'Test Name');
CleanupTestAssertions.assertValidDependencyGraph(graph, 'Test Name');
CleanupTestAssertions.assertCleanupSafety(files, safe, unsafe, 'Test Name');
```

### PerformanceTestUtils
Utilities for performance testing:

```typescript
const { result, executionTime } = await PerformanceTestUtils.measureExecutionTime(
  () => analyzer.analyzeProject(),
  'Project Analysis'
);
```

## Test Fixtures

### Available Fixtures
- **Minimal Project** - Basic structure with few files
- **React Project** - Typical React application structure
- **Next.js Project** - Next.js with pages and components
- **Dynamic Import Project** - Project with dynamic imports and string references
- **Test Heavy Project** - Project with extensive test coverage
- **Config Heavy Project** - Project with many configuration files

### Using Fixtures
```typescript
const fixture = TestFixtures.getNextJsProject();
for (const file of fixture.files) {
  mockFs.createFile(file.path, file.content, file.type);
}
```

## Running Tests

### Using the Test Runner

```bash
# Run all tests
node tests/analysis/run-tests.js

# Run tests in parallel
node tests/analysis/run-tests.js parallel

# Run specific category
node tests/analysis/run-tests.js dependency
node tests/analysis/run-tests.js integration
node tests/analysis/run-tests.js safety
```

### Manual Test Execution

```bash
# Run individual test files
npx ts-node tests/analysis/dependency-scanner.test.ts
npx ts-node tests/analysis/cleanup-integration.test.ts
npx ts-node tests/analysis/safety-scenarios.test.ts
```

### Using npm Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "test:cleanup": "node tests/analysis/run-tests.js",
    "test:cleanup:parallel": "node tests/analysis/run-tests.js parallel",
    "test:cleanup:unit": "node tests/analysis/run-tests.js dependency",
    "test:cleanup:integration": "node tests/analysis/run-tests.js integration",
    "test:cleanup:safety": "node tests/analysis/run-tests.js safety"
  }
}
```

## Test Coverage

The test suite covers:

### Core Functionality
- ✅ Dependency graph construction
- ✅ Import/export parsing (ES6, CommonJS, dynamic)
- ✅ Asset reference detection
- ✅ Unused file identification
- ✅ Circular dependency detection
- ✅ Configuration file protection

### Framework Support
- ✅ React components and hooks
- ✅ Next.js pages and API routes
- ✅ Dynamic routing
- ✅ CSS modules and styled-components
- ✅ Webpack and Vite integration

### Safety Features
- ✅ Entry point protection
- ✅ Configuration file preservation
- ✅ Dynamic reference detection
- ✅ String literal reference detection
- ✅ Build validation
- ✅ Backup and rollback

### Edge Cases
- ✅ Circular dependencies
- ✅ Large projects (1000+ files)
- ✅ Complex file structures
- ✅ Malformed files
- ✅ Missing dependencies
- ✅ Case-sensitive file systems
- ✅ Long file paths

### Performance
- ✅ Large project handling
- ✅ Memory usage optimization
- ✅ Concurrent operation safety
- ✅ Execution time limits

## Writing New Tests

### Test Structure
```typescript
describe('Feature Name', () => {
  let mockFs: MockFileSystemManager;
  let analyzer: FileAnalyzer;

  beforeEach(() => {
    mockFs = new MockFileSystemManager('/test-project');
    analyzer = new FileAnalyzer('/test-project');
  });

  afterEach(() => {
    mockFs.clear();
  });

  test('should do something', async () => {
    // Arrange
    mockFs.createFile('src/test.ts', 'content', FileType.TYPESCRIPT);

    // Act
    const result = await analyzer.someMethod();

    // Assert
    expect(result).toBeDefined();
  });
});
```

### Best Practices
1. Use descriptive test names
2. Follow Arrange-Act-Assert pattern
3. Clean up mock file system after each test
4. Use appropriate test fixtures
5. Test both success and error cases
6. Include performance assertions for large operations
7. Use specialized assertions from CleanupTestAssertions

### Adding New Fixtures
```typescript
// In test-fixtures.ts
static getMyCustomProject(): TestProjectStructure {
  return {
    name: 'my-custom-project',
    description: 'Description of the project structure',
    files: [
      {
        path: 'src/index.ts',
        content: 'export default "test";',
        type: FileType.TYPESCRIPT
      }
    ],
    expectedUnused: ['src/unused.ts'],
    expectedUsed: ['src/index.ts'],
    entryPoints: ['src/index.ts']
  };
}
```

## Debugging Tests

### Verbose Output
Set environment variable for detailed logging:
```bash
DEBUG=cleanup:* node tests/analysis/run-tests.js
```

### Individual Test Debugging
```bash
# Run single test with full output
npx ts-node --inspect tests/analysis/dependency-scanner.test.ts
```

### Mock File System Inspection
```typescript
// In your test
console.log('Mock FS state:', mockFs.getState());
console.log('All files:', mockFs.getAllFiles());
```

## Contributing

When adding new functionality to the cleanup tool:

1. Add corresponding unit tests
2. Add integration tests for workflows
3. Add safety tests for edge cases
4. Update test fixtures if needed
5. Run full test suite before submitting
6. Update this README if adding new test categories

## Requirements

- Node.js 16+
- TypeScript 4.5+
- ts-node for running TypeScript tests
- All dependencies from main project