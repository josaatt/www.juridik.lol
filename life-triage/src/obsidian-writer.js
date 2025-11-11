import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import yaml from 'js-yaml';

export class ObsidianWriter {
  constructor() {
    this.vaultPath = process.env.OBSIDIAN_VAULT_PATH || './obsidian-vault';
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

    // Build frontmatter
    const frontmatter = {
      id,
      type,
      category,
      priority,
      title,
      created: processedAt,
      source: source.type,
      tags: tags || [],
      status: type === 'task' ? 'todo' : 'active'
    };

    if (energyLevel) frontmatter.energy = energyLevel;
    if (estimatedDuration) frontmatter.duration = estimatedDuration;
    if (extractedData?.dates?.length > 0) frontmatter.dates = extractedData.dates;
    if (extractedData?.people?.length > 0) frontmatter.people = extractedData.people;
    if (extractedData?.deadlines?.length > 0) frontmatter.deadline = extractedData.deadlines[0];

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

    console.log(`📄 Created note: ${path.relative(this.vaultPath, filePath)}`);

    // Also update daily note
    await this.updateDailyNote(triageResult, filePath);

    return path.relative(this.vaultPath, filePath);
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
}
