import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import yaml from 'js-yaml';
import { CanvasGenerator } from './canvas-generator.js';
import { BaseGenerator } from './base-generator.js';

export class ObsidianWriter {
  constructor() {
    this.vaultPath = process.env.OBSIDIAN_VAULT_PATH || './obsidian-vault';
    this.canvasGenerator = new CanvasGenerator();
    this.baseGenerator = new BaseGenerator(this.vaultPath);
  }

  /**
   * Initialize Obsidian vault with Bases
   */
  async initialize() {
    console.log('🔧 Initializing Obsidian vault...');

    // Create folder structure
    await this.createFolderStructure();

    // Initialize all bases
    await this.baseGenerator.initializeAllBases();

    console.log('✅ Obsidian vault initialized');
  }

  /**
   * Create folder structure
   */
  async createFolderStructure() {
    const folders = [
      'Inbox',
      'Daily',
      'Projects',
      'Areas/Work',
      'Areas/Personal',
      'Areas/Finance',
      'Areas/Health',
      'Areas/Learning',
      'Resources',
      'Archive',
      'Attachments/images',
      'Attachments/attachments',
      'People',
      'Canvas'
    ];

    for (const folder of folders) {
      await fs.mkdir(path.join(this.vaultPath, folder), { recursive: true });
    }
  }

  async createNote(triageResult) {
    const {
      type,
      category,
      priority,
      title,
      summary,
      extractedData,
      tags,
      suggestedFolder,
      energyLevel,
      estimatedDuration,
      context,
      source,
      originalContent,
      images,
      attachments,
      processedAt,
      id
    } = triageResult;

    // Determine folder structure
    const folder = this.determineFolder(suggestedFolder, category, type);
    const folderPath = path.join(this.vaultPath, folder);

    // Ensure folder exists
    await fs.mkdir(folderPath, { recursive: true });

    // Generate filename
    const timestamp = format(new Date(processedAt), 'yyyy-MM-dd-HHmmss');
    const sanitizedTitle = this.sanitizeFilename(title);
    const filename = `${timestamp}-${sanitizedTitle}.md`;
    const filePath = path.join(folderPath, filename);

    // Build enhanced frontmatter for Obsidian Bases compatibility
    const frontmatter = {
      id,
      type,
      category,
      priority,
      title,
      created: processedAt,
      modified: processedAt,
      source: source.type,
      tags: tags || [],
      status: type === 'task' ? 'todo' : 'active'
    };

    // Add type-specific properties
    if (energyLevel) frontmatter.energy = energyLevel;
    if (estimatedDuration) frontmatter.duration = estimatedDuration;

    // Add extracted data as proper properties for Bases
    if (extractedData?.dates?.length > 0) {
      frontmatter.dates = extractedData.dates;
      frontmatter.date_first = extractedData.dates[0]; // For sorting
    }

    if (extractedData?.people?.length > 0) {
      frontmatter.people = extractedData.people;
    }

    if (extractedData?.locations?.length > 0) {
      frontmatter.locations = extractedData.locations;
    }

    if (extractedData?.amounts?.length > 0) {
      frontmatter.amounts = extractedData.amounts;
      // Calculate total for finance tracking
      frontmatter.total_amount = extractedData.amounts.reduce((sum, amt) => sum + amt.value, 0);
      frontmatter.currency = extractedData.amounts[0]?.currency || 'SEK';
    }

    if (extractedData?.deadlines?.length > 0) {
      frontmatter.deadline = extractedData.deadlines[0];
      frontmatter.has_deadline = true;
    }

    if (extractedData?.actionItems?.length > 0) {
      frontmatter.action_items_count = extractedData.actionItems.length;
    }

    // Add source metadata
    if (source.from) frontmatter.source_from = source.from;
    if (source.subject) frontmatter.source_subject = source.subject;

    // Add computed properties
    frontmatter.has_images = images && images.length > 0;
    frontmatter.has_attachments = attachments && attachments.length > 0;
    frontmatter.image_count = images?.length || 0;
    frontmatter.attachment_count = attachments?.length || 0;

    // Build markdown content
    let content = '---\n';
    content += yaml.dump(frontmatter);
    content += '---\n\n';

    content += `# ${title}\n\n`;

    // Summary
    if (summary) {
      content += `## Summary\n\n${summary}\n\n`;
    }

    // Extracted Data
    if (extractedData && Object.keys(extractedData).length > 0) {
      content += `## Extracted Information\n\n`;

      if (extractedData.dates?.length > 0) {
        content += `**Dates:** ${extractedData.dates.join(', ')}\n\n`;
      }

      if (extractedData.people?.length > 0) {
        content += `**People:** ${extractedData.people.map(p => `[[${p}]]`).join(', ')}\n\n`;
      }

      if (extractedData.locations?.length > 0) {
        content += `**Locations:** ${extractedData.locations.join(', ')}\n\n`;
      }

      if (extractedData.amounts?.length > 0) {
        content += `**Amounts:**\n`;
        extractedData.amounts.forEach(amt => {
          content += `- ${amt.value} ${amt.currency}\n`;
        });
        content += '\n';
      }

      if (extractedData.deadlines?.length > 0) {
        content += `**Deadlines:** ${extractedData.deadlines.join(', ')}\n\n`;
      }

      if (extractedData.actionItems?.length > 0) {
        content += `**Action Items:**\n`;
        extractedData.actionItems.forEach(item => {
          content += `- [ ] ${item}\n`;
        });
        content += '\n';
      }
    }

    // Original Content
    if (originalContent?.text) {
      content += `## Original Content\n\n`;
      content += originalContent.text.trim() + '\n\n';
    }

    // Images
    if (images && images.length > 0) {
      content += `## Images\n\n`;

      for (const image of images) {
        const imagePath = await this.saveAttachment(
          image.data,
          image.filename,
          'images'
        );
        content += `### ${image.filename}\n\n`;
        content += `![[${path.basename(imagePath)}]]\n\n`;

        if (image.analysis?.description) {
          content += `**Description:** ${image.analysis.description}\n\n`;
        }

        if (image.analysis?.extractedText) {
          content += `**Extracted Text:**\n\`\`\`\n${image.analysis.extractedText}\n\`\`\`\n\n`;
        }
      }
    }

    // Other Attachments
    if (attachments && attachments.length > 0) {
      content += `## Attachments\n\n`;

      for (const attachment of attachments) {
        const attPath = await this.saveAttachment(
          attachment.content,
          attachment.filename,
          'attachments'
        );
        content += `- [[${path.basename(attPath)}]] (${this.formatBytes(attachment.size)})\n`;
      }
      content += '\n';
    }

    // Context
    if (context) {
      content += `## Context\n\n${context}\n\n`;
    }

    // Metadata
    content += `## Metadata\n\n`;
    content += `- **Source:** ${source.type}\n`;
    if (source.from) content += `- **From:** ${source.from}\n`;
    if (source.subject) content += `- **Subject:** ${source.subject}\n`;
    content += `- **Processed:** ${processedAt}\n`;
    content += `- **ID:** \`${id}\`\n`;

    // Write file
    await fs.writeFile(filePath, content, 'utf-8');

    const relativePath = path.relative(this.vaultPath, filePath);
    console.log(`📄 Created note: ${relativePath}`);

    // Store relative path in triage result for canvas generation
    triageResult.notePath = relativePath.replace('.md', '');

    // Also update daily note
    await this.updateDailyNote(triageResult, filePath);

    // Create canvas visualization for this note
    await this.createNoteCanvas(triageResult);

    // Auto-create people notes if mentioned
    if (extractedData?.people?.length > 0) {
      await this.createPeopleNotes(extractedData.people, triageResult);
    }

    return relativePath;
  }

  async updateDailyNote(triageResult, notePath) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const dailyFolder = path.join(this.vaultPath, 'Daily');
    await fs.mkdir(dailyFolder, { recursive: true });

    const dailyPath = path.join(dailyFolder, `${today}.md`);
    const relativeNotePath = path.relative(this.vaultPath, notePath);

    let dailyContent = '';

    // Read existing daily note if it exists
    try {
      dailyContent = await fs.readFile(dailyPath, 'utf-8');
    } catch (err) {
      // Create new daily note
      dailyContent = `---\ndate: ${today}\ntags: [daily-note]\n---\n\n# ${today}\n\n## Triage Log\n\n`;
    }

    // Add entry
    const timestamp = format(new Date(triageResult.processedAt), 'HH:mm');
    const entry = `- ${timestamp} - [[${relativeNotePath.replace('.md', '')}|${triageResult.title}]] #${triageResult.type} #${triageResult.priority}\n`;

    if (!dailyContent.includes(entry)) {
      // Find or create Triage Log section
      if (!dailyContent.includes('## Triage Log')) {
        dailyContent += `\n## Triage Log\n\n`;
      }

      dailyContent += entry;

      await fs.writeFile(dailyPath, dailyContent, 'utf-8');
    }
  }

  async saveAttachment(buffer, filename, subfolder) {
    const attachmentsFolder = path.join(this.vaultPath, 'Attachments', subfolder);
    await fs.mkdir(attachmentsFolder, { recursive: true });

    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
    const sanitized = this.sanitizeFilename(filename);
    const uniqueFilename = `${timestamp}-${sanitized}`;
    const filePath = path.join(attachmentsFolder, uniqueFilename);

    await fs.writeFile(filePath, buffer);

    return filePath;
  }

  determineFolder(suggested, category, type) {
    // Priority mapping
    const folderMap = {
      'Inbox': 'Inbox',
      'Daily': 'Daily',
      'Projects': 'Projects',
      'Areas': 'Areas',
      'Resources': 'Resources',
      'Archive': 'Archive'
    };

    if (folderMap[suggested]) {
      return folderMap[suggested];
    }

    // Fallback to category-based
    if (type === 'task') return 'Inbox';
    if (type === 'journal') return 'Daily';
    if (category === 'work') return 'Areas/Work';
    if (category === 'personal') return 'Areas/Personal';
    if (category === 'finance') return 'Areas/Finance';
    if (category === 'health') return 'Areas/Health';

    return 'Inbox';
  }

  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9åäöÅÄÖ\s\-_]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
      .toLowerCase();
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Creates a canvas visualization for a note
   */
  async createNoteCanvas(triageResult) {
    try {
      const canvasData = this.canvasGenerator.createNoteCanvas(triageResult);

      const timestamp = format(new Date(triageResult.processedAt), 'yyyy-MM-dd-HHmmss');
      const sanitizedTitle = this.sanitizeFilename(triageResult.title);
      const canvasFilename = `${timestamp}-${sanitizedTitle}.canvas`;
      const canvasPath = path.join(this.vaultPath, 'Canvas', canvasFilename);

      await fs.writeFile(canvasPath, this.canvasGenerator.toJSON(canvasData), 'utf-8');

      console.log(`  🎨 Created canvas: Canvas/${canvasFilename}`);
    } catch (error) {
      console.error('  ⚠️  Canvas creation failed:', error.message);
    }
  }

  /**
   * Auto-creates people notes
   */
  async createPeopleNotes(people, triageResult) {
    for (const person of people) {
      try {
        const sanitizedName = this.sanitizeFilename(person);
        const personFilePath = path.join(this.vaultPath, 'People', `${sanitizedName}.md`);

        let personContent = '';
        let interactions = [];

        // Check if person note already exists
        try {
          personContent = await fs.readFile(personFilePath, 'utf-8');

          // Extract existing interactions
          const interactionsMatch = personContent.match(/## Interactions\n\n([\s\S]*?)(\n## |$)/);
          if (interactionsMatch) {
            const interactionLines = interactionsMatch[1].trim().split('\n');
            interactions = interactionLines.filter(line => line.startsWith('- '));
          }
        } catch (err) {
          // Person doesn't exist, create new
          personContent = `---
name: ${person}
tags: [person]
created: ${new Date().toISOString()}
last_contact: ${new Date().toISOString()}
---

# ${person}

## About

*Add information about this person here*

## Interactions

`;
        }

        // Add new interaction
        const timestamp = format(new Date(triageResult.processedAt), 'yyyy-MM-dd HH:mm');
        const newInteraction = `- ${timestamp} - [[${triageResult.notePath}|${triageResult.title}]] #${triageResult.type}`;

        if (!interactions.includes(newInteraction)) {
          interactions.push(newInteraction);

          // Rebuild person note
          const frontmatterMatch = personContent.match(/^---\n([\s\S]*?)\n---/);
          let frontmatter = {};

          if (frontmatterMatch) {
            frontmatter = yaml.load(frontmatterMatch[1]);
          }

          // Update last_contact
          frontmatter.last_contact = new Date().toISOString();

          personContent = `---
${yaml.dump(frontmatter).trim()}
---

# ${person}

## About

${this.extractPersonInfo(personContent, person)}

## Interactions

${interactions.join('\n')}

## Related Notes

*This section is automatically updated*
`;

          await fs.mkdir(path.join(this.vaultPath, 'People'), { recursive: true });
          await fs.writeFile(personFilePath, personContent, 'utf-8');

          console.log(`  👤 Updated person note: People/${sanitizedName}.md`);
        }
      } catch (error) {
        console.error(`  ⚠️  Failed to create/update person note for ${person}:`, error.message);
      }
    }
  }

  /**
   * Extracts existing person info from note
   */
  extractPersonInfo(content, defaultName) {
    const aboutMatch = content.match(/## About\n\n([\s\S]*?)(\n## |$)/);
    if (aboutMatch && aboutMatch[1].trim() && !aboutMatch[1].includes('*Add information')) {
      return aboutMatch[1].trim();
    }
    return '*Add information about this person here*';
  }
}
