import express from 'express';
import dotenv from 'dotenv';
import { EmailReceiver } from './email-receiver.js';
import { TriageEngine } from './triage-engine.js';
import { ObsidianWriter } from './obsidian-writer.js';
import { GitHubSync } from './github-sync.js';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize components
const emailReceiver = new EmailReceiver();
const triageEngine = new TriageEngine();
const obsidianWriter = new ObsidianWriter();
const githubSync = new GitHubSync();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Life Triage System',
    timestamp: new Date().toISOString()
  });
});

// Manual trigger endpoint (for testing)
app.post('/api/triage', async (req, res) => {
  try {
    const { text, images, metadata } = req.body;

    console.log('📥 Manual triage request received');

    // Process with triage engine
    const triageResult = await triageEngine.process({
      text,
      images,
      metadata,
      source: 'api'
    });

    // Create Obsidian note
    const notePath = await obsidianWriter.createNote(triageResult);

    // Sync to GitHub
    await githubSync.commitAndPush(notePath, triageResult);

    res.json({
      success: true,
      triage: triageResult,
      notePath
    });
  } catch (error) {
    console.error('❌ Error processing triage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  const stats = await emailReceiver.getStats();
  res.json(stats);
});

// Start email monitoring
async function startEmailMonitoring() {
  console.log('📧 Starting email monitoring...');

  emailReceiver.on('email', async (email) => {
    try {
      console.log(`📨 New email received: "${email.subject}"`);

      // Process with triage engine
      const triageResult = await triageEngine.processEmail(email);

      console.log(`🤖 Triage complete:`, {
        type: triageResult.type,
        category: triageResult.category,
        priority: triageResult.priority
      });

      // Create Obsidian note
      const notePath = await obsidianWriter.createNote(triageResult);
      console.log(`📝 Note created: ${notePath}`);

      // Sync to GitHub
      await githubSync.commitAndPush(notePath, triageResult);
      console.log(`✅ Synced to GitHub`);

    } catch (error) {
      console.error('❌ Error processing email:', error);
    }
  });

  await emailReceiver.start();
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Life Triage System running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);

  // Initialize GitHub sync
  await githubSync.initialize();

  // Start email monitoring
  await startEmailMonitoring();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await emailReceiver.stop();
  await githubSync.finalSync();
  process.exit(0);
});
