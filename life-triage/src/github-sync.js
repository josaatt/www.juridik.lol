import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

export class GitHubSync {
  constructor() {
    this.vaultPath = process.env.OBSIDIAN_VAULT_PATH || './obsidian-vault';
    this.repoUrl = process.env.GITHUB_REPO_URL;
    this.branch = process.env.GITHUB_BRANCH || 'main';
    this.token = process.env.GITHUB_TOKEN;
    this.git = null;
    this.syncQueue = [];
    this.syncing = false;
  }

  async initialize() {
    console.log('🔧 Initializing GitHub sync...');

    // Ensure vault directory exists
    await fs.mkdir(this.vaultPath, { recursive: true });

    this.git = simpleGit(this.vaultPath);

    // Check if repo exists
    const isRepo = await this.git.checkIsRepo();

    if (!isRepo) {
      console.log('📥 Cloning repository...');

      // Clone with token authentication
      const authenticatedUrl = this.getAuthenticatedUrl();
      await simpleGit().clone(authenticatedUrl, this.vaultPath);

      this.git = simpleGit(this.vaultPath);
      console.log('✅ Repository cloned');
    } else {
      console.log('📦 Repository already exists, pulling latest...');

      try {
        await this.git.pull('origin', this.branch);
        console.log('✅ Pulled latest changes');
      } catch (err) {
        console.warn('⚠️  Pull failed, continuing anyway:', err.message);
      }
    }

    // Configure git
    await this.git.addConfig('user.name', 'Life Triage Bot');
    await this.git.addConfig('user.email', 'triage@fredrikivarsson.fi');

    console.log('✅ GitHub sync initialized');
  }

  async commitAndPush(notePath, triageResult) {
    // Add to queue
    this.syncQueue.push({ notePath, triageResult });

    // Process queue
    if (!this.syncing) {
      await this.processQueue();
    }
  }

  async processQueue() {
    if (this.syncQueue.length === 0 || this.syncing) {
      return;
    }

    this.syncing = true;

    try {
      // Pull latest changes first
      try {
        await this.git.pull('origin', this.branch);
      } catch (err) {
        console.warn('⚠️  Pull failed:', err.message);
      }

      // Process all queued items
      const items = [...this.syncQueue];
      this.syncQueue = [];

      // Stage all files
      await this.git.add('.');

      // Create commit message
      let commitMessage = '';
      if (items.length === 1) {
        const item = items[0];
        commitMessage = `Add triage: ${item.triageResult.title}\n\n`;
        commitMessage += `Type: ${item.triageResult.type}\n`;
        commitMessage += `Category: ${item.triageResult.category}\n`;
        commitMessage += `Priority: ${item.triageResult.priority}`;
      } else {
        commitMessage = `Add ${items.length} triage items\n\n`;
        items.forEach(item => {
          commitMessage += `- ${item.triageResult.title} (${item.triageResult.type})\n`;
        });
      }

      // Commit
      await this.git.commit(commitMessage);

      // Push with retry
      await this.pushWithRetry();

      console.log(`✅ Synced ${items.length} item(s) to GitHub`);

    } catch (error) {
      console.error('❌ GitHub sync error:', error);

      // Re-add failed items to queue
      this.syncQueue.unshift(...this.syncQueue);
    } finally {
      this.syncing = false;

      // Process any new items that were added during sync
      if (this.syncQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  async pushWithRetry(maxRetries = 4) {
    const delays = [2000, 4000, 8000, 16000];

    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.git.push('origin', this.branch);
        return; // Success
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error; // Final attempt failed
        }

        console.warn(`⚠️  Push failed (attempt ${i + 1}/${maxRetries}), retrying in ${delays[i]}ms...`);
        await this.sleep(delays[i]);
      }
    }
  }

  async finalSync() {
    console.log('🔄 Final sync before shutdown...');
    await this.processQueue();
  }

  getAuthenticatedUrl() {
    if (!this.repoUrl || !this.token) {
      throw new Error('GITHUB_REPO_URL and GITHUB_TOKEN must be set');
    }

    // Convert https://github.com/user/repo.git to https://token@github.com/user/repo.git
    const url = new URL(this.repoUrl);
    url.username = this.token;
    return url.toString();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
