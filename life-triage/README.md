# Life Triage System 🧠

AI-powered life management system that automatically triages incoming content (emails, images, notes) and organizes them into your Obsidian vault via GitHub.

## Features

🤖 **AI-Powered Analysis** - Uses Google Gemini 2.5 Flash for intelligent content understanding
- Multimodal processing (text, images, PDFs, audio)
- OCR for screenshots and documents
- Smart extraction of dates, people, locations, amounts
- Automatic categorization and prioritization

📧 **Email Integration** - Send anything to `triage@fredrikivarsson.fi`
- Monitors inbox in real-time
- Processes attachments (images, documents)
- Extracts actionable information

📝 **Obsidian Integration** - Auto-generates beautiful markdown notes
- Structured frontmatter with metadata for Bases compatibility
- Daily notes automatically updated
- Smart folder organization (Inbox, Projects, Areas, etc.)
- Automatic linking between related notes
- **NEW:** Auto-creates people notes with interaction tracking

🎨 **Canvas Visualization** - Automatic visual relationship maps
- Every note gets a Canvas showing connections
- Visual display of people, dates, tasks, locations
- JSON Canvas format (open standard)
- Interactive and editable in Obsidian

📊 **Obsidian Bases** - Powerful database views
- 7 automatic bases: Tasks, Meetings, Finance, Ideas, People, Projects, Master
- Filter, sort, and query your notes like a database
- No coding required (unlike Dataview)
- Card and table views
- Custom formulas for computed properties

🔄 **GitHub Sync** - Everything backed up and versioned
- Automatic commits after each triage
- Intelligent batching
- Retry logic for network failures

## Architecture

```
Email Input → AI Processing → Triage Logic → Obsidian Note → Canvas/Bases → GitHub Push
   ↓             ↓                ↓              ↓              ↓              ↓
 IMAP       Gemini 2.5        Smart Rules    Markdown      Visual Maps    Git Sync
            Flash API         Extraction     + Frontmatter  + Databases
```

### Components

- **Email Receiver** - IMAP poller for `triage@fredrikivarsson.fi`
- **Gemini Processor** - Multimodal AI analysis with OCR
- **Triage Engine** - Smart categorization and extraction
- **Obsidian Writer** - Markdown generation with rich frontmatter
- **Canvas Generator** - Automatic visual relationship maps
- **Base Generator** - Creates database views (.base files)
- **GitHub Sync** - Automatic commits and push with retry

## Quick Start

### Prerequisites

- Node.js 18+
- Email account with IMAP access
- Google Gemini API key
- GitHub repository for Obsidian vault
- GitHub Personal Access Token

### Installation

```bash
cd life-triage
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your credentials:
```env
# Get your Gemini API key from: https://ai.google.dev/
GEMINI_API_KEY=your_gemini_api_key_here

# Email configuration
EMAIL_HOST=imap.fredrikivarsson.fi
EMAIL_PORT=993
EMAIL_USER=triage@fredrikivarsson.fi
EMAIL_PASSWORD=your_email_password

# GitHub configuration
GITHUB_REPO_URL=https://github.com/yourusername/obsidian-vault.git
GITHUB_TOKEN=your_github_token
OBSIDIAN_VAULT_PATH=./obsidian-vault
```

3. Create a GitHub repository for your Obsidian vault:
```bash
# On GitHub, create a new repository (e.g., obsidian-vault)
# Then clone it locally or let the system do it automatically
```

### Running

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

## Usage Examples

### Example 1: Email with Screenshot

**Send to:** triage@fredrikivarsson.fi

**Subject:** Möte nästa vecka

**Body:** (none)

**Attachment:** screenshot-meeting.png (contains "Möte med Anna 2025-11-15 kl 14:00")

**Result:**
```markdown
---
type: meeting
category: work
priority: high
title: Möte med Anna 2025-11-15
dates: [2025-11-15]
people: [Anna]
---

# Möte med Anna 2025-11-15

## Extracted Information

**Dates:** 2025-11-15
**People:** [[Anna]]

## Images

### screenshot-meeting.png

![[2025-11-11-143022-screenshot-meeting.png]]

**Extracted Text:**
Möte med Anna
2025-11-15 kl 14:00
```

### Example 2: Quick Note

**Send to:** triage@fredrikivarsson.fi

**Subject:** Idé

**Body:** Bygg en AI-assistent för juridiska frågor som kan analysera kontrakt

**Result:**
```markdown
---
type: idea
category: work
priority: medium
title: AI-assistent för juridiska frågor
tags: [idea, ai, juridik]
---

# AI-assistent för juridiska frågor

## Summary

Idé om att bygga en AI-assistent som kan analysera juridiska kontrakt och svara på juridiska frågor.

## Action Items

- [ ] Researcha befintliga juridiska AI-lösningar
- [ ] Definiera scope och use cases
- [ ] Undersök datasources för träning
```

### Example 3: Invoice/Receipt

**Send to:** triage@fredrikivarsson.fi

**Attachment:** faktura.pdf

**Result:**
```markdown
---
type: invoice
category: finance
priority: high
title: Faktura Acme AB 5000 SEK
amounts: [{value: 5000, currency: SEK}]
deadline: 2025-11-30
---

# Faktura Acme AB 5000 SEK

## Extracted Information

**Amounts:** 5000 SEK
**Deadlines:** 2025-11-30

## Action Items

- [ ] Betala faktura innan 2025-11-30

## Attachments

- [[2025-11-11-143500-faktura.pdf]]
```

## Obsidian Bases & Canvas

### What are Bases?

**Bases** are Obsidian's built-in database feature that turns folders of notes into queryable databases. No coding required!

The system automatically creates **7 bases**:

1. **All Triage Items** - Master view of everything
2. **Tasks** - Task management with filters (Urgent, By Energy, This Week)
3. **Meetings** - Meeting notes with participants and dates
4. **Finance** - Invoices and receipts with totals
5. **Ideas** - Brainstorming and idea tracking
6. **People** - Contact database with interaction history
7. **Projects** - Project management with status tracking

**Features:**
- Filter by any property (type, category, priority, date, etc.)
- Sort by multiple columns
- Group by categories
- Custom formulas (e.g., sum of amounts)
- Multiple views per base
- Card and table layouts

**To use:** Enable "Bases" core plugin in Obsidian → Open any `.base` file

### What are Canvas?

**Canvas** files are visual maps showing relationships between notes. Each triaged item gets an automatic Canvas.

**Canvas shows:**
- Main note in center
- Connected people (links to their notes)
- Important dates
- Action items
- Locations

**Format:** JSON Canvas (open standard) - works in any app supporting the spec

**Location:** `Canvas/` folder - one `.canvas` file per triaged item

**To use:** Just click any `.canvas` file in Obsidian!

### Complete Guide

See [OBSIDIAN-GUIDE.md](OBSIDIAN-GUIDE.md) for detailed instructions on:
- Using Bases for filtering and querying
- Creating custom views
- Working with Canvas
- People note management
- Daily note integration
- Advanced formulas and Dataview queries

## API Endpoints

### POST /api/triage

Manual triage endpoint for testing or external integrations.

```bash
curl -X POST http://localhost:3000/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Möte med Anna imorgon kl 15:00",
    "metadata": {
      "source": "manual"
    }
  }'
```

### GET /health

Health check endpoint.

```bash
curl http://localhost:3000/health
```

### GET /api/stats

Get triage statistics.

```bash
curl http://localhost:3000/api/stats
```

## Obsidian Vault Structure

```
obsidian-vault/
├── Inbox/              # New items land here
├── Daily/              # Daily notes (auto-generated)
├── Projects/           # Project-specific notes
├── Areas/              # Life areas
│   ├── Work/
│   ├── Personal/
│   ├── Finance/
│   └── Health/
├── Resources/          # Reference material
├── Archive/            # Completed/archived items
├── Attachments/        # Images and files
│   ├── images/
│   └── attachments/
└── People/             # People notes (auto-linked)
```

## Triage Categories

**Types:**
- `task` - Actionable items
- `note` - General notes
- `idea` - Ideas and brainstorming
- `meeting` - Meeting notes
- `decision` - Decisions made
- `journal` - Journal entries
- `invoice` - Invoices and bills
- `receipt` - Receipts
- `other` - Uncategorized

**Categories:**
- `work` - Work-related
- `personal` - Personal life
- `health` - Health and fitness
- `finance` - Money matters
- `relationships` - People and relationships
- `learning` - Learning and education
- `home` - Home and household
- `other` - Uncategorized

**Priorities:**
- `urgent` - Needs immediate attention
- `high` - Important, schedule soon
- `medium` - Normal priority
- `low` - Nice to have

## Advanced Configuration

### Custom Triage Rules

You can customize triage behavior by modifying the Gemini prompt in `src/gemini-processor.js`.

### Email Filters

Add custom email filtering logic in `src/email-receiver.js` to ignore certain senders or subjects.

### Obsidian Templates

Customize note templates in `src/obsidian-writer.js` to match your preferred format.

## Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t life-triage .
docker run -d --env-file .env -p 3000:3000 life-triage
```

### VPS/Cloud

Deploy to any Node.js-compatible hosting:
- DigitalOcean App Platform
- Heroku
- Railway
- Fly.io
- AWS EC2/Lambda

### systemd Service (Linux)

```ini
[Unit]
Description=Life Triage System
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/life-triage
ExecStart=/usr/bin/node src/server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## Monitoring

Logs are output to stdout. Use PM2 or similar for log management:

```bash
npm install -g pm2
pm2 start src/server.js --name life-triage
pm2 logs life-triage
pm2 monit
```

## Troubleshooting

### Email not receiving

1. Check IMAP credentials
2. Enable "Less secure app access" if using Gmail
3. Check firewall/port 993
4. Verify inbox folder name (might be "INBOX" vs "Inbox")

### Gemini API errors

1. Verify API key is valid
2. Check quota limits at https://ai.google.dev/
3. Ensure billing is enabled for higher limits

### GitHub push failures

1. Check token permissions (needs `repo` scope)
2. Verify repository URL
3. Ensure branch exists
4. Check network connectivity

## License

MIT

## Author

Fredrik Ivarsson
- Email: fredrik@fredrikivarsson.fi
- LinkedIn: https://www.linkedin.com/in/fredrikivarsson/

## Contributing

This is a personal project, but feel free to fork and adapt to your needs!
