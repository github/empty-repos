/**
 * Empty Repos Scanner
 * Scans repositories in a GitHub organization to find empty repos or README-only repos
 */

class EmptyReposScanner {
  constructor(github, context) {
    this.github = github;
    this.context = context;
  }

  /**
   * Scan repositories for empty or README-only repos
   * @param {string} org - Organization name
   * @param {string} visibility - Repository visibility filter: 'all', 'public', or 'private'
   * @returns {Object} Scan results with empty and readmeOnly arrays
   */
  async scanRepositories(org, visibility = 'all') {
    const repos = await this.github.paginate(
      this.github.rest.repos.listForOrg,
      { org, per_page: 100 }
    );

    const empty = [];
    const readmeOnly = [];

    for (const repo of repos) {
      // Skip by visibility
      if (visibility === 'public' && repo.private) continue;
      if (visibility === 'private' && !repo.private) continue;

      // Skip archived repos
      if (repo.archived) continue;

      const repoStatus = await this.analyzeRepository(org, repo.name);
      
      if (repoStatus === 'empty') {
        empty.push(repo.full_name);
      } else if (repoStatus === 'readme-only') {
        readmeOnly.push(repo.full_name);
      }
    }

    return { empty, readmeOnly };
  }

  /**
   * Analyze a single repository to determine its status
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {string} 'empty', 'readme-only', or 'populated'
   */
  async analyzeRepository(owner, repo) {
    let contents;
    try {
      const res = await this.github.rest.repos.getContent({
        owner,
        repo,
        path: ""
      });
      contents = Array.isArray(res.data) ? res.data : [res.data];
    } catch (e) {
      if (e.status === 409) {
        contents = [];  // empty repo
      } else {
        throw e;
      }
    }

    if (contents.length === 0) {
      return 'empty';
    }

    const nonReadmes = contents.filter(file =>
      !/^README(\.[a-z]+)?$/i.test(file.name)
    );

    if (nonReadmes.length === 0) {
      return 'readme-only';
    }

    return 'populated';
  }

  /**
   * Generate a report body for the GitHub issue
   * @param {string} org - Organization name
   * @param {string} visibility - Visibility filter used
   * @param {Array} empty - Array of empty repository names
   * @param {Array} readmeOnly - Array of README-only repository names
   * @returns {string} Formatted report body
   */
  generateReportBody(org, visibility, empty, readmeOnly) {
    const today = new Date().toISOString().slice(0, 10);
    let body = `# Empty Repo Report for \`${org}\` (${today})\n\n`;
    body += `**Visibility:** ${visibility}\n\n`;
    body += "| Repository | Status |\n| --- | --- |\n";
    
    for (const repo of empty) {
      body += `| ${repo} | empty |\n`;
    }
    for (const repo of readmeOnly) {
      body += `| ${repo} | README-only |\n`;
    }
    
    body += "\n_Automatically generated on the 1st of each month._";
    return body;
  }

  /**
   * Create a GitHub issue with the scan results
   * @param {string} org - Organization name
   * @param {string} visibility - Visibility filter used
   * @param {Array} empty - Array of empty repository names
   * @param {Array} readmeOnly - Array of README-only repository names
   * @returns {Object} Created issue data
   */
  async createReportIssue(org, visibility, empty, readmeOnly) {
    const today = new Date().toISOString().slice(0, 10);
    const body = this.generateReportBody(org, visibility, empty, readmeOnly);

    return await this.github.rest.issues.create({
      owner: this.context.repo.owner,
      repo: this.context.repo.repo,
      title: `Monthly Repo Health: ${org} (${today})`,
      body
    });
  }

  /**
   * Main execution function - performs full scan and creates issue if needed
   * @param {string} org - Organization name
   * @param {string} visibility - Visibility filter
   * @returns {Object} Scan results and metadata
   */
  async run(org, visibility = 'all') {
    const { empty, readmeOnly } = await this.scanRepositories(org, visibility);

    if (empty.length + readmeOnly.length === 0) {
      console.log("✔ No matching repos found. Skipping issue.");
      return { empty, readmeOnly, issueCreated: false };
    }

    await this.createReportIssue(org, visibility, empty, readmeOnly);
    
    const today = new Date().toISOString().slice(0, 10);
    const report = { org, visibility, date: today, empty, readmeOnly };
    
    console.log(`::set-output name=report-json::${JSON.stringify(report)}`);
    
    return { ...report, issueCreated: true };
  }
}

// Export for use in GitHub Actions and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmptyReposScanner;
}

// Also make available globally for GitHub Actions context
if (typeof global !== 'undefined') {
  global.EmptyReposScanner = EmptyReposScanner;
}