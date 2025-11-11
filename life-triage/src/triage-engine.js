import { GeminiProcessor } from './gemini-processor.js';

export class TriageEngine {
  constructor() {
    this.gemini = new GeminiProcessor();
    this.stats = {
      processed: 0,
      byType: {},
      byCategory: {}
    };
  }

  async processEmail(email) {
    console.log(`🔍 Processing email: "${email.subject}"`);

    // Prepare content for analysis
    const content = {
      text: this.prepareEmailText(email),
      images: [],
      attachments: email.attachments || []
    };

    // Process image attachments
    for (const attachment of email.attachments) {
      if (attachment.contentType.startsWith('image/')) {
        console.log(`🖼️  Processing image: ${attachment.filename}`);

        const imageAnalysis = await this.gemini.analyzeImage(
          attachment.content,
          attachment.contentType
        );

        content.images.push({
          filename: attachment.filename,
          analysis: imageAnalysis,
          data: attachment.content,
          mimeType: attachment.contentType
        });

        // Add extracted text to main content
        if (imageAnalysis.extractedText) {
          content.text += `\n\n[From image: ${attachment.filename}]\n${imageAnalysis.extractedText}`;
        }
      }
    }

    // Analyze with Gemini
    const analysis = await this.gemini.analyzeContent(content);

    // Build triage result
    const triageResult = {
      ...analysis,
      source: {
        type: 'email',
        from: email.from,
        subject: email.subject,
        date: email.date
      },
      originalContent: {
        text: email.text,
        html: email.html
      },
      images: content.images,
      attachments: email.attachments.filter(a => !a.contentType.startsWith('image/')),
      processedAt: new Date().toISOString(),
      id: this.generateId()
    };

    // Update stats
    this.updateStats(triageResult);

    return triageResult;
  }

  async process(data) {
    console.log(`🔍 Processing manual input`);

    const content = {
      text: data.text || '',
      images: data.images || [],
      attachments: []
    };

    const analysis = await this.gemini.analyzeContent(content);

    const triageResult = {
      ...analysis,
      source: {
        type: data.metadata?.source || 'api',
        ...data.metadata
      },
      originalContent: {
        text: data.text
      },
      images: data.images || [],
      processedAt: new Date().toISOString(),
      id: this.generateId()
    };

    this.updateStats(triageResult);

    return triageResult;
  }

  prepareEmailText(email) {
    let text = `Subject: ${email.subject}\n`;
    text += `From: ${email.from}\n`;
    text += `Date: ${email.date}\n\n`;
    text += email.text || '';
    return text;
  }

  generateId() {
    return `triage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  updateStats(result) {
    this.stats.processed++;

    if (!this.stats.byType[result.type]) {
      this.stats.byType[result.type] = 0;
    }
    this.stats.byType[result.type]++;

    if (!this.stats.byCategory[result.category]) {
      this.stats.byCategory[result.category] = 0;
    }
    this.stats.byCategory[result.category]++;
  }

  getStats() {
    return this.stats;
  }
}
