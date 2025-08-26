# Empty Repos Workflow

The Empty Repos Workflow is a GitHub Actions workflow that scans organizations for empty repositories and README-only repositories, generating monthly reports as GitHub issues.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Repository Structure
- **`.github/workflows/empty-repos.yml`** - The main GitHub Actions workflow file
- **Documentation files** - README.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, SUPPORT.md
- **Configuration files** - CODEOWNERS, LICENSE
- **No application code** - This is a pure GitHub Actions workflow repository

### Prerequisites and Setup
- Install required tools:
  - Node.js v20+ is available: `node --version` 
  - npm 10+ is available: `npm --version`
  - GitHub CLI 2.76+ is available: `gh --version`
  - yamllint is available: `yamllint --version`

### Validation Commands
- **Validate workflow YAML syntax**: `yamllint .github/workflows/empty-repos.yml`
  - **TIMING**: Takes 2-3 seconds. NEVER CANCEL.
  - **Expected warnings**: Document start missing, line length warnings are normal
- **Test workflow JavaScript logic**: Create test script and run with `node /tmp/test-workflow-logic.js`
  - **TIMING**: Takes 1-2 seconds. NEVER CANCEL.
- **Check repository status**: `git status && git log --oneline -5`
  - **TIMING**: Takes 1-2 seconds. NEVER CANCEL.

### Working with the Workflow
- **Core workflow file**: `.github/workflows/empty-repos.yml`
- **Key components**:
  - Scheduled execution: `cron: '0 0 1 * *'` (1st of every month)
  - Manual trigger with visibility options: all, public, private
  - GitHub API scanning logic using `actions/github-script@v6`
  - Issue creation with markdown table reports

### Testing and Validation
- **CRITICAL**: Always test JavaScript logic changes by creating a test script in `/tmp/` before modifying the workflow
- **Validation scenario**: Create mock repository data and test filtering logic for empty/README-only detection
- **Required test cases**:
  1. Empty repositories (no contents)
  2. README-only repositories (only README files)
  3. Normal repositories (multiple files)
  4. Visibility filtering (all/public/private)
  5. Archived repository exclusion

### Common Tasks

#### Modifying the Workflow
1. **Before changes**: Run `yamllint .github/workflows/empty-repos.yml` to check current syntax
2. **Test logic changes**: Create test script in `/tmp/` using Node.js to validate JavaScript modifications
3. **After changes**: Re-run yamllint to ensure valid YAML syntax
4. **Validation**: Test with different mock data scenarios

#### Testing the JavaScript Logic
```bash
# Create test script (example provided in validation)
node /tmp/test-workflow-logic.js
```
- **TIMING**: 1-2 seconds execution. NEVER CANCEL.
- **Expected output**: Mock repository categorization and report generation

#### Repository Operations
- **Check workflow syntax**: `yamllint .github/workflows/empty-repos.yml`
- **View workflow structure**: `cat .github/workflows/empty-repos.yml`
- **Git operations**: Standard git commands work normally
- **No build process**: This repository contains only configuration and documentation

## Validation

- **ALWAYS** validate YAML syntax with yamllint before committing workflow changes
- **ALWAYS** test JavaScript logic modifications with a local test script before deployment
- **CRITICAL**: Test complete workflow scenarios including:
  1. Empty repository detection logic
  2. README-only repository filtering 
  3. Visibility-based repository filtering
  4. Report generation and formatting
- **NO UI testing required**: This is a GitHub Actions workflow with no user interface
- **Manual validation**: Review generated mock reports to ensure proper markdown formatting
- **Git validation**: Ensure only intended files are committed (exclude `/tmp/` test files)

## Common Issues and Solutions

### Workflow Validation
- **yamllint warnings**: Document start and line length warnings are acceptable
- **YAML syntax errors**: Check indentation and special characters in workflow file
- **JavaScript errors**: Test logic modifications in isolation before workflow integration

### GitHub Actions Context
- **Organization scanning**: Requires appropriate GitHub token permissions
- **API rate limits**: Built-in pagination handles large organization scans
- **Manual triggers**: Use GitHub Actions UI or `gh workflow run` (requires authentication)

## Timing Expectations

- **yamllint validation**: 2-3 seconds - NEVER CANCEL
- **JavaScript logic testing**: 1-2 seconds - NEVER CANCEL  
- **Git operations**: 1-5 seconds - NEVER CANCEL
- **File editing**: Instantaneous - NEVER CANCEL
- **Workflow execution** (when run in GitHub): 30 seconds to 5 minutes depending on organization size - NEVER CANCEL

## File Locations

### Repository Root
```
.
├── .github/
│   └── workflows/
│       └── empty-repos.yml    # Main workflow file
├── CODEOWNERS                 # Code ownership definitions
├── CODE_OF_CONDUCT.md        # Community guidelines
├── CONTRIBUTING.md           # Contribution instructions
├── LICENSE                   # MIT license
├── README.md                 # Repository documentation
├── SECURITY.md               # Security policy
└── SUPPORT.md                # Support information
```

### Key Files to Monitor
- **Primary**: `.github/workflows/empty-repos.yml` - All workflow logic
- **Documentation**: README.md - Usage instructions and examples
- **Configuration**: CODEOWNERS - Maintainer assignments

### Available Tools Output
```bash
node --version    # v20.19.4
npm --version     # 10.8.2
gh --version      # gh version 2.76.2
yamllint --version # yamllint 1.x
```

## Troubleshooting

### Workflow Issues
- **Syntax errors**: Run `yamllint .github/workflows/empty-repos.yml` for validation
- **Logic errors**: Test JavaScript modifications with mock data in `/tmp/` scripts
- **GitHub API errors**: Check organization permissions and token scopes

### Development Workflow
- **No builds required**: This repository contains only configuration files
- **No tests to run**: Create validation scripts in `/tmp/` for testing logic changes
- **No dependencies**: Workflow uses built-in GitHub Actions and `actions/github-script`

Remember: This is a GitHub Actions workflow repository. Focus on workflow syntax validation and JavaScript logic testing rather than traditional application development processes.