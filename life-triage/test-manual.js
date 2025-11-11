// Quick manual test script
// Usage: node test-manual.js

import dotenv from 'dotenv';
import { TriageEngine } from './src/triage-engine.js';
import { ObsidianWriter } from './src/obsidian-writer.js';

dotenv.config();

async function test() {
  console.log('🧪 Testing Life Triage System\n');

  // Check environment
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set in .env');
    return;
  }

  console.log('✅ Environment variables loaded');

  // Test triage engine
  const triageEngine = new TriageEngine();
  const obsidianWriter = new ObsidianWriter();

  console.log('\n🔍 Testing triage with sample content...\n');

  const testContent = {
    text: `Möte med Anna

Datum: 2025-11-15 kl 14:00
Plats: Kontoret

Vi ska diskutera det nya projektet för AI-assistenten.

TODO:
- Förbereda presentation
- Samla data om användarbehov
- Skapa budget (ca 50000 SEK)`,
    metadata: {
      source: 'test'
    }
  };

  try {
    const result = await triageEngine.process(testContent);

    console.log('📊 Triage Result:');
    console.log('  Type:', result.type);
    console.log('  Category:', result.category);
    console.log('  Priority:', result.priority);
    console.log('  Title:', result.title);
    console.log('  Tags:', result.tags.join(', '));

    if (result.extractedData.dates?.length > 0) {
      console.log('  Dates:', result.extractedData.dates.join(', '));
    }

    if (result.extractedData.people?.length > 0) {
      console.log('  People:', result.extractedData.people.join(', '));
    }

    if (result.extractedData.amounts?.length > 0) {
      console.log('  Amounts:', result.extractedData.amounts.map(a => `${a.value} ${a.currency}`).join(', '));
    }

    console.log('\n📝 Creating Obsidian note...\n');

    const notePath = await obsidianWriter.createNote(result);

    console.log('✅ Note created at:', notePath);
    console.log('\n🎉 Test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Check the obsidian-vault folder for the generated note');
    console.log('2. Setup .env with your credentials');
    console.log('3. Run: npm start');
    console.log('4. Send a test email to your triage address');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\nMake sure you have:');
    console.error('1. Set GEMINI_API_KEY in .env');
    console.error('2. Internet connection for Gemini API');
  }
}

test();
