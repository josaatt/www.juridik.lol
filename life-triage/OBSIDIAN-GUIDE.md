# Obsidian Integration Guide

Life Triage System creates a powerful, AI-driven Obsidian vault with automatic **Bases** (databases) and **Canvas** (visual maps) generation.

## Features Overview

### 🎨 Canvas - Visual Relationship Maps

Every triaged item automatically gets a **Canvas visualization** showing:
- The main note in the center
- Related people (with links to their notes)
- Important dates
- Action items
- Connected notes

**Location:** `Canvas/` folder

**Format:** `.canvas` files (JSON Canvas standard)

### 📊 Bases - Powerful Databases

Bases turn your notes into queryable databases. The system creates **7 automatic bases**:

#### 1. **All Triage Items** (`All-Triage-Items.base`)
- Master database of everything
- Views: All Items, By Priority, By Category
- Sortable by all properties

#### 2. **Tasks** (`Inbox/Tasks.base`)
- Only task-type items
- Views: Active Tasks, Urgent, By Energy, This Week
- Filters by status, priority, deadline
- Shows energy level and estimated duration

#### 3. **Meetings** (`Areas/Meetings.base`)
- Meeting notes with dates and people
- Views: Upcoming, Past, By Person
- Automatically links to people notes

#### 4. **Finance** (`Areas/Finance/Finance.base`)
- Invoices, receipts, financial items
- Views: Invoices, Receipts, Due Soon
- Shows amounts and totals
- Formula: `total_amount` calculates sum

#### 5. **Ideas** (`Resources/Ideas.base`)
- Creative ideas and brainstorming
- Views: Active Ideas, By Category, High Priority
- Status tracking

#### 6. **People** (`People/People.base`)
- Database of all people mentioned
- Views: All People, By Relationship, Need to Contact
- Tracks last contact date

#### 7. **Projects** (`Projects/Projects.base`)
- Project management
- Views: Active Projects, By Status, Completed
- Progress tracking

## Folder Structure

```
obsidian-vault/
├── Inbox/                          # New items land here
│   └── Tasks.base                  # Task database
├── Daily/                          # Daily notes (auto-generated)
│   └── 2025-11-11.md              # Today's triage log
├── Projects/                       # Project notes
│   └── Projects.base               # Project database
├── Areas/                          # Life areas
│   ├── Work/
│   ├── Personal/
│   ├── Finance/
│   │   └── Finance.base           # Finance database
│   ├── Health/
│   └── Learning/
├── Resources/                      # Reference material
│   └── Ideas.base                 # Ideas database
├── People/                         # People notes
│   ├── People.base                # People database
│   ├── anna.md                    # Auto-created when mentioned
│   └── john.md
├── Canvas/                         # Visual maps
│   ├── 2025-11-11-meeting-anna.canvas
│   └── 2025-11-11-project-idea.canvas
├── Attachments/                    # Files and images
│   ├── images/
│   └── attachments/
├── Archive/                        # Completed/archived
└── All-Triage-Items.base          # Master database
```

## Properties (Frontmatter)

Each note has rich metadata for Bases:

```yaml
---
# Core Properties
id: triage-1731340800-abc123
type: meeting
category: work
priority: high
title: Meeting with Anna
status: active

# Timestamps
created: 2025-11-11T14:30:00Z
modified: 2025-11-11T14:30:00Z

# Source Information
source: email
source_from: anna@example.com
source_subject: Project Discussion

# Extracted Data
dates: [2025-11-15]
date_first: 2025-11-15
people: [Anna, John]
locations: [Office]
deadline: 2025-11-30
has_deadline: true

# Task-specific
energy: medium
duration: 1h
action_items_count: 3

# Finance-specific
amounts:
  - value: 5000
    currency: SEK
total_amount: 5000
currency: SEK

# Media
has_images: true
has_attachments: true
image_count: 2
attachment_count: 1

# Tags
tags: [meeting, project, important]
---
```

## Using Bases in Obsidian

### Step 1: Enable Bases Plugin

1. Open Obsidian
2. Go to: Settings → Core Plugins
3. Enable: **Bases**

### Step 2: Open a Base

1. Navigate to any `.base` file
2. Double-click to open
3. See your notes as a database!

### Step 3: Use Views

Each Base has multiple views:

**Example: Tasks Base**
- Click "Active Tasks" → See only TODO items
- Click "By Energy" → Group by energy level
- Click "This Week" → See items due this week

### Step 4: Filter and Sort

1. Click "Filters" button (top right)
2. Add filters:
   - Property: `priority`
   - Operator: `equals`
   - Value: `urgent`
3. Click "Sort" to change order

### Step 5: Customize Properties

1. Click "Properties" button
2. Check/uncheck properties to show/hide columns
3. Drag to reorder columns

### Step 6: Create Custom Views

1. Click "+ New View"
2. Name it (e.g., "My High Priority Tasks")
3. Add filters:
   - `priority = high`
   - `status = todo`
   - `category = work`
4. Save

## Using Canvas in Obsidian

Canvas files are automatically created for each triaged item.

### Viewing a Canvas

1. Navigate to `Canvas/` folder
2. Click any `.canvas` file
3. See visual map of relationships

### Canvas Layout

```
           [Dates]
              |
              |
    [People]--[Main Note]--[Tasks]
              |
              |
         [Locations]
```

### Editing Canvas

- **Move nodes:** Click and drag
- **Add notes:** Drag from file explorer
- **Connect nodes:** Drag from node edge to another node
- **Add text:** Right-click → Add text
- **Change colors:** Right-click node → Color

### Canvas Use Cases

1. **Meeting Planning:** See all participants, dates, and action items
2. **Project Overview:** Visualize project components
3. **People Networks:** See how people are connected
4. **Timeline:** Arrange notes chronologically

## People Notes

People are automatically created when mentioned in any triage item.

### Auto-created Content

```markdown
---
name: Anna
tags: [person]
created: 2025-11-11T14:30:00Z
last_contact: 2025-11-11T14:30:00Z
---

# Anna

## About

*Add information about this person here*

## Interactions

- 2025-11-11 14:30 - [[meeting-with-anna|Meeting with Anna]] #meeting
- 2025-11-10 09:15 - [[project-discussion|Project Discussion]] #note

## Related Notes

*This section is automatically updated*
```

### Updating People Notes

1. Open person note (e.g., `People/anna.md`)
2. Edit "About" section with details:
   - Role/relationship
   - Contact info
   - Important notes
3. Interactions are auto-updated on each mention

### People Base View

Open `People/People.base` to see:
- All people in one database
- Last contact date
- Number of interactions
- Relationship type

**View: "Need to Contact"**
- Shows people you haven't contacted in 30+ days
- Perfect for maintaining relationships

## Advanced: Formulas in Bases

Bases support formulas for computed properties.

### Example: Finance Base

```yaml
formulas:
  - name: total_amount
    type: number
    expression: sum(amounts.value)
  - name: days_until_due
    type: number
    expression: deadline - today()
```

**Built-in formulas:**
- `sum()` - Add numbers
- `average()` - Calculate average
- `count()` - Count items
- Date calculations: `today()`, `this-week()`, etc.

### Creating Custom Formulas

1. Open `.base` file in text editor
2. Add to `formulas` section
3. Use in views and filters

## Daily Notes Integration

Every triaged item is logged in your daily note.

### Daily Note Format

```markdown
---
date: 2025-11-11
tags: [daily-note]
---

# 2025-11-11

## Triage Log

- 14:30 - [[meeting-with-anna|Meeting with Anna]] #meeting #high
- 15:45 - [[project-idea|Build AI Assistant]] #idea #medium
- 16:20 - [[invoice-acme|Invoice from Acme]] #invoice #urgent

## Notes

*Add your own notes here*

## Tasks

*Link to important tasks from today*
```

### Daily Note Templates

You can customize daily note templates by editing the template in `obsidian-writer.js`.

## Dataview Queries (Optional)

If you have Dataview plugin installed, you can create advanced queries:

### Show Urgent Tasks

```dataview
TABLE priority, deadline, status
FROM ""
WHERE type = "task" AND priority = "urgent"
SORT deadline ASC
```

### Show This Week's Meetings

```dataview
TABLE date_first as Date, people as Participants
FROM ""
WHERE type = "meeting" AND date_first >= date(today) AND date_first <= date(today) + dur(7 days)
SORT date_first ASC
```

### Finance Overview

```dataview
TABLE total_amount as Amount, deadline as Due, status
FROM ""
WHERE category = "finance"
SORT deadline ASC
```

### People I Haven't Contacted

```dataview
TABLE last_contact as "Last Contact"
FROM "People"
WHERE last_contact < date(today) - dur(30 days)
SORT last_contact ASC
```

## Tips & Best Practices

### 1. **Use Bases for Quick Filtering**
- Instead of searching, open relevant Base
- Use filters to narrow down
- Save common filters as views

### 2. **Leverage Canvas for Planning**
- Create project canvas by combining multiple notes
- Use colors to indicate priority/status
- Add text nodes for context

### 3. **Maintain People Notes**
- Fill in "About" section with key info
- Use People Base "Need to Contact" view weekly
- Link important conversations

### 4. **Weekly Review Process**
1. Open `All-Triage-Items.base`
2. Filter: `created = this-week`
3. Review and update status
4. Archive completed items

### 5. **Mobile Workflow**
- Obsidian mobile app supports Bases
- Quick email → triage → instant mobile access
- Canvas works on mobile too!

### 6. **Backup Strategy**
- Everything is in Git (automatic)
- Obsidian Sync (optional, for real-time)
- Local backup of vault folder

## Troubleshooting

### Bases Not Showing

1. Ensure Bases plugin is enabled
2. Check file has `.base` extension
3. Verify YAML syntax is correct

### Canvas Not Rendering

1. Update Obsidian to latest version
2. Check `.canvas` file is valid JSON
3. Try opening in text editor to validate

### People Notes Not Created

1. Check People folder exists
2. Verify frontmatter has `people` property
3. Check console logs for errors

### Properties Not Appearing in Base

1. Ensure frontmatter is valid YAML
2. Property names are case-sensitive
3. Refresh Base view (close and reopen)

## Examples

### Example Base Configuration

Create custom `.base` file:

```yaml
name: "My Custom View"
source:
  type: "folder"
  path: "/"
filters:
  - property: "type"
    operator: "in"
    value: ["task", "meeting"]
  - property: "priority"
    operator: "equals"
    value: "high"
sorts:
  - property: "deadline"
    direction: "ascending"
properties:
  - name: "title"
    visible: true
  - name: "deadline"
    visible: true
  - name: "status"
    visible: true
views:
  - name: "Active"
    type: "table"
    filters:
      - property: "status"
        operator: "not-equals"
        value: "completed"
```

### Example Canvas Customization

Edit generated canvas in `canvas-generator.js` to customize:
- Node positions
- Colors per type
- Edge labels
- Layout algorithm

## Resources

- [Obsidian Bases Documentation](https://help.obsidian.md/bases)
- [JSON Canvas Spec](https://jsoncanvas.org/)
- [Obsidian Community Forum](https://forum.obsidian.md/)

## Next Steps

1. ✅ Enable Bases plugin in Obsidian
2. ✅ Open `All-Triage-Items.base`
3. ✅ Explore different views
4. ✅ Open a Canvas file
5. ✅ Check out People notes
6. ✅ Create custom views for your workflow

Happy organizing! 🚀
