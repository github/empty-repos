# Empty Repos Workflow

A GitHub Actions workflow that scans all repositories in your organization once a month (or on-demand) and files an issue listing:

- Repos that are completely **empty** (no files at root)  
- Repos that contain **only a README** at the root  

This helps you spot neglected or placeholder repositories and take action (archive, populate, delete, etc.).

## Features

- **Scheduled scan**: runs at 00:00 UTC on the 1st of every month  
- **Manual trigger**: invoke from the **Actions** tab or via `gh workflow run`  
- **Visibility filter**: choose to scan `all`, `public`, or `private` repos  
- **Auto-issue creation**: opens a new issue with a Markdown table of results  
- **Modular design**: scanner logic separated into reusable script with comprehensive tests
- **Zero dependencies**: uses `actions/github-script`, built-in scheduling and permissions  

## Installation

1. **Copy** the workflow files from this repo:
   - `.github/workflows/empty-repos.yml` (main workflow)
   - `scripts/empty-repos-scanner.js` (scanner logic)

2. **Update** the organization name to scan:
   ```yaml
   env:
     SCAN_ORG: my-org-name    # ← set this to your GitHub org
   ```

## Development

The scanner logic is separated into `scripts/empty-repos-scanner.js` for maintainability and testing.

### Setting up your environment

1. **Install dependencies**:
   ```bash
   npm install
   ```

### Running Tests

```bash
npm test
```

### Test Coverage

The test suite covers:
- Empty repository detection
- README-only repository detection
- Visibility filtering (public/private/all)
- Archived repository filtering
- Various README file name patterns
- Report generation
- GitHub issue creation

Tests run automatically on pull requests via the `.github/workflows/test.yml` workflow.

## License

[MIT](LICENSE)

## More OSPO Tools

Looking for more resources for your open source program office (OSPO)? Check out the [`github-ospo`](https://github.com/github/github-ospo) repository for a variety of tools designed to support your needs.
