/**
 * Simple test runner for empty-repos-scanner
 * No external dependencies - uses Node.js built-in assert module
 */

const assert = require('assert');
const EmptyReposScanner = require('../scripts/empty-repos-scanner.js');

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🧪 Running Empty Repos Scanner Tests\n');

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// Mock GitHub API for testing
class MockGitHub {
  constructor(mockRepos = [], mockContents = {}) {
    this.mockRepos = mockRepos;
    this.mockContents = mockContents;
    this.createdIssues = [];
  }

  async paginate(fn, params) {
    return this.mockRepos;
  }

  rest = {
    repos: {
      listForOrg: async (params) => {
        return { data: this.mockRepos };
      },
      getContent: async ({ owner, repo, path }) => {
        const key = `${owner}/${repo}`;
        if (this.mockContents[key] === undefined) {
          const error = new Error('Not Found');
          error.status = 409;
          throw error;
        }
        return { data: this.mockContents[key] };
      }
    },
    issues: {
      create: async (params) => {
        const issue = { id: Date.now(), ...params };
        this.createdIssues.push(issue);
        return { data: issue };
      }
    }
  };
}

const mockContext = {
  repo: {
    owner: 'test-org',
    repo: 'test-repo'
  }
};

const runner = new TestRunner();

// Test: Scanner initialization
runner.test('Scanner initializes correctly', () => {
  const mockGithub = new MockGitHub();
  const scanner = new EmptyReposScanner(mockGithub, mockContext);
  assert(scanner instanceof EmptyReposScanner);
});

// Test: Empty repository detection
runner.test('Detects empty repositories', async () => {
  const mockRepos = [
    { full_name: 'test-org/empty-repo', name: 'empty-repo', private: false, archived: false }
  ];
  const mockGithub = new MockGitHub(mockRepos, {});
  const scanner = new EmptyReposScanner(mockGithub, mockContext);
  
  const result = await scanner.scanRepositories('test-org');
  assert.deepEqual(result.empty, ['test-org/empty-repo']);
  assert.deepEqual(result.readmeOnly, []);
});

// Test: README-only repository detection
runner.test('Detects README-only repositories', async () => {
  const mockRepos = [
    { full_name: 'test-org/readme-repo', name: 'readme-repo', private: false, archived: false }
  ];
  const mockContents = {
    'test-org/readme-repo': [{ name: 'README.md', type: 'file' }]
  };
  const mockGithub = new MockGitHub(mockRepos, mockContents);
  const scanner = new EmptyReposScanner(mockGithub, mockContext);
  
  const result = await scanner.scanRepositories('test-org');
  assert.deepEqual(result.empty, []);
  assert.deepEqual(result.readmeOnly, ['test-org/readme-repo']);
});

// Test: Populated repository filtering
runner.test('Filters out populated repositories', async () => {
  const mockRepos = [
    { full_name: 'test-org/populated-repo', name: 'populated-repo', private: false, archived: false }
  ];
  const mockContents = {
    'test-org/populated-repo': [
      { name: 'README.md', type: 'file' },
      { name: 'src', type: 'dir' }
    ]
  };
  const mockGithub = new MockGitHub(mockRepos, mockContents);
  const scanner = new EmptyReposScanner(mockGithub, mockContext);
  
  const result = await scanner.scanRepositories('test-org');
  assert.deepEqual(result.empty, []);
  assert.deepEqual(result.readmeOnly, []);
});

// Test: Visibility filtering
runner.test('Filters repositories by visibility', async () => {
  const mockRepos = [
    { full_name: 'test-org/public-repo', name: 'public-repo', private: false, archived: false },
    { full_name: 'test-org/private-repo', name: 'private-repo', private: true, archived: false }
  ];
  const mockGithub = new MockGitHub(mockRepos, {});
  const scanner = new EmptyReposScanner(mockGithub, mockContext);
  
  const publicResult = await scanner.scanRepositories('test-org', 'public');
  assert.deepEqual(publicResult.empty, ['test-org/public-repo']);
  
  const privateResult = await scanner.scanRepositories('test-org', 'private');
  assert.deepEqual(privateResult.empty, ['test-org/private-repo']);
});

// Test: Archived repository filtering
runner.test('Filters out archived repositories', async () => {
  const mockRepos = [
    { full_name: 'test-org/archived-repo', name: 'archived-repo', private: false, archived: true }
  ];
  const mockGithub = new MockGitHub(mockRepos, {});
  const scanner = new EmptyReposScanner(mockGithub, mockContext);
  
  const result = await scanner.scanRepositories('test-org');
  assert.deepEqual(result.empty, []);
  assert.deepEqual(result.readmeOnly, []);
});

// Test: Report body generation
runner.test('Generates correct report body', () => {
  const mockGithub = new MockGitHub();
  const scanner = new EmptyReposScanner(mockGithub, mockContext);
  
  const body = scanner.generateReportBody('test-org', 'all', ['org/empty'], ['org/readme']);
  assert(body.includes('Empty Repo Report for `test-org`'));
  assert(body.includes('**Visibility:** all'));
  assert(body.includes('| org/empty | empty |'));
  assert(body.includes('| org/readme | README-only |'));
});

// Test: Issue creation
runner.test('Creates GitHub issue with report', async () => {
  const mockGithub = new MockGitHub();
  const scanner = new EmptyReposScanner(mockGithub, mockContext);
  
  await scanner.createReportIssue('test-org', 'all', ['org/empty'], []);
  assert.equal(mockGithub.createdIssues.length, 1);
  assert(mockGithub.createdIssues[0].title.includes('Monthly Repo Health: test-org'));
});

// Test: README variations detection
runner.test('Detects various README file variations', async () => {
  const testCases = [
    { name: 'README', shouldMatch: true },
    { name: 'README.md', shouldMatch: true },
    { name: 'README.txt', shouldMatch: true },
    { name: 'readme.md', shouldMatch: true },
    { name: 'ReadMe.rst', shouldMatch: true },
    { name: 'NOTREADME.md', shouldMatch: false },
    { name: 'README-old.md', shouldMatch: false }
  ];

  for (const testCase of testCases) {
    const mockRepos = [
      { full_name: 'test-org/test-repo', name: 'test-repo', private: false, archived: false }
    ];
    const mockContents = {
      'test-org/test-repo': [{ name: testCase.name, type: 'file' }]
    };
    const mockGithub = new MockGitHub(mockRepos, mockContents);
    const scanner = new EmptyReposScanner(mockGithub, mockContext);
    
    const status = await scanner.analyzeRepository('test-org', 'test-repo');
    if (testCase.shouldMatch) {
      assert.equal(status, 'readme-only', `${testCase.name} should be detected as README`);
    } else {
      assert.equal(status, 'populated', `${testCase.name} should not be detected as README-only`);
    }
  }
});

// Run all tests
runner.run().catch(console.error);