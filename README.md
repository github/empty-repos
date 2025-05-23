# Empty-Repos Action

A GitHub Actions workflow that scans all repositories in your organization once a month (or on-demand) and files an issue listing:

- Repos that are completely **empty** (no files at root)  
- Repos that contain **only a README** at the root  

This helps you spot neglected or placeholder repositories and take action (archive, populate, delete, etc.).

## Features

- **Scheduled scan**: runs at 00:00 UTC on the 1st of every month  
- **Manual trigger**: invoke from the **Actions** tab or via `gh workflow run`  
- **Visibility filter**: choose to scan `all`, `public`, or `private` repos  
- **Auto-issue creation**: opens a new issue with a Markdown table of results  
- **Zero dependencies**: uses `actions/github-script`, built-in scheduling and permissions  

## Installation

1. **Copy** the workflow in this repo, at  
   `.github/workflows/empty-repo.yml`

2. **Update** the organization name to scan:
   ```yaml
   env:
     SCAN_ORG: my-org-name    # ← set this to your GitHub org
