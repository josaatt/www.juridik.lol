/**
 * Obsidian Bases Generator
 * Creates .base files for database views
 * Bases turn any folder of notes into a powerful database
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export class BaseGenerator {
  constructor(vaultPath) {
    this.vaultPath = vaultPath;
  }

  /**
   * Creates a master base for all triage items
   */
  async createMasterBase() {
    const baseConfig = {
      name: "All Triage Items",
      source: {
        type: "folder",
        path: "/"
      },
      filters: [
        {
          property: "type",
          operator: "is-not-empty"
        }
      ],
      sorts: [
        {
          property: "created",
          direction: "descending"
        }
      ],
      properties: [
        { name: "title", visible: true },
        { name: "type", visible: true },
        { name: "category", visible: true },
        { name: "priority", visible: true },
        { name: "status", visible: true },
        { name: "created", visible: true },
        { name: "tags", visible: true }
      ],
      views: [
        {
          name: "All Items",
          type: "table"
        },
        {
          name: "By Priority",
          type: "table",
          sorts: [
            {
              property: "priority",
              direction: "ascending"
            }
          ]
        },
        {
          name: "By Category",
          type: "table",
          groupBy: "category"
        }
      ]
    };

    const basePath = path.join(this.vaultPath, 'All-Triage-Items.base');
    await this.writeBase(basePath, baseConfig);
    return basePath;
  }

  /**
   * Creates a tasks base
   */
  async createTasksBase() {
    const baseConfig = {
      name: "Tasks",
      source: {
        type: "folder",
        path: "/"
      },
      filters: [
        {
          property: "type",
          operator: "equals",
          value: "task"
        }
      ],
      sorts: [
        {
          property: "priority",
          direction: "ascending"
        },
        {
          property: "deadline",
          direction: "ascending"
        }
      ],
      properties: [
        { name: "title", visible: true },
        { name: "status", visible: true },
        { name: "priority", visible: true },
        { name: "category", visible: true },
        { name: "energy", visible: true },
        { name: "duration", visible: true },
        { name: "deadline", visible: true },
        { name: "created", visible: true }
      ],
      views: [
        {
          name: "Active Tasks",
          type: "table",
          filters: [
            {
              property: "status",
              operator: "equals",
              value: "todo"
            }
          ]
        },
        {
          name: "Urgent",
          type: "table",
          filters: [
            {
              property: "priority",
              operator: "equals",
              value: "urgent"
            }
          ]
        },
        {
          name: "By Energy",
          type: "table",
          groupBy: "energy"
        },
        {
          name: "This Week",
          type: "table",
          filters: [
            {
              property: "deadline",
              operator: "is-this-week"
            }
          ]
        }
      ]
    };

    const basePath = path.join(this.vaultPath, 'Inbox', 'Tasks.base');
    await this.writeBase(basePath, baseConfig);
    return basePath;
  }

  /**
   * Creates a meetings base
   */
  async createMeetingsBase() {
    const baseConfig = {
      name: "Meetings",
      source: {
        type: "folder",
        path: "/"
      },
      filters: [
        {
          property: "type",
          operator: "equals",
          value: "meeting"
        }
      ],
      sorts: [
        {
          property: "dates",
          direction: "descending"
        }
      ],
      properties: [
        { name: "title", visible: true },
        { name: "dates", visible: true },
        { name: "people", visible: true },
        { name: "category", visible: true },
        { name: "priority", visible: true },
        { name: "created", visible: true }
      ],
      views: [
        {
          name: "Upcoming",
          type: "table",
          filters: [
            {
              property: "dates",
              operator: "is-after",
              value: "today"
            }
          ]
        },
        {
          name: "Past",
          type: "table",
          filters: [
            {
              property: "dates",
              operator: "is-before",
              value: "today"
            }
          ]
        },
        {
          name: "By Person",
          type: "table",
          groupBy: "people"
        }
      ]
    };

    const basePath = path.join(this.vaultPath, 'Areas', 'Meetings.base');
    await this.writeBase(basePath, baseConfig);
    return basePath;
  }

  /**
   * Creates a finance base
   */
  async createFinanceBase() {
    const baseConfig = {
      name: "Finance",
      source: {
        type: "folder",
        path: "/"
      },
      filters: [
        {
          property: "category",
          operator: "equals",
          value: "finance"
        }
      ],
      sorts: [
        {
          property: "deadline",
          direction: "ascending"
        }
      ],
      properties: [
        { name: "title", visible: true },
        { name: "type", visible: true },
        { name: "amounts", visible: true },
        { name: "deadline", visible: true },
        { name: "status", visible: true },
        { name: "created", visible: true }
      ],
      formulas: [
        {
          name: "total_amount",
          type: "number",
          expression: "sum(amounts.value)"
        }
      ],
      views: [
        {
          name: "Invoices",
          type: "table",
          filters: [
            {
              property: "type",
              operator: "equals",
              value: "invoice"
            }
          ]
        },
        {
          name: "Receipts",
          type: "table",
          filters: [
            {
              property: "type",
              operator: "equals",
              value: "receipt"
            }
          ]
        },
        {
          name: "Due Soon",
          type: "table",
          filters: [
            {
              property: "deadline",
              operator: "is-this-month"
            }
          ],
          sorts: [
            {
              property: "deadline",
              direction: "ascending"
            }
          ]
        }
      ]
    };

    const basePath = path.join(this.vaultPath, 'Areas', 'Finance', 'Finance.base');
    await this.writeBase(basePath, baseConfig);
    return basePath;
  }

  /**
   * Creates an ideas base
   */
  async createIdeasBase() {
    const baseConfig = {
      name: "Ideas",
      source: {
        type: "folder",
        path: "/"
      },
      filters: [
        {
          property: "type",
          operator: "equals",
          value: "idea"
        }
      ],
      sorts: [
        {
          property: "created",
          direction: "descending"
        }
      ],
      properties: [
        { name: "title", visible: true },
        { name: "category", visible: true },
        { name: "tags", visible: true },
        { name: "priority", visible: true },
        { name: "status", visible: true },
        { name: "created", visible: true }
      ],
      views: [
        {
          name: "Active Ideas",
          type: "table",
          filters: [
            {
              property: "status",
              operator: "equals",
              value: "active"
            }
          ]
        },
        {
          name: "By Category",
          type: "table",
          groupBy: "category"
        },
        {
          name: "High Priority",
          type: "table",
          filters: [
            {
              property: "priority",
              operator: "in",
              value: ["urgent", "high"]
            }
          ]
        }
      ]
    };

    const basePath = path.join(this.vaultPath, 'Resources', 'Ideas.base');
    await this.writeBase(basePath, baseConfig);
    return basePath;
  }

  /**
   * Creates a people base
   */
  async createPeopleBase() {
    const baseConfig = {
      name: "People",
      source: {
        type: "folder",
        path: "People"
      },
      sorts: [
        {
          property: "last_contact",
          direction: "descending"
        }
      ],
      properties: [
        { name: "name", visible: true },
        { name: "relationship", visible: true },
        { name: "tags", visible: true },
        { name: "last_contact", visible: true },
        { name: "email", visible: true },
        { name: "phone", visible: true }
      ],
      views: [
        {
          name: "All People",
          type: "table"
        },
        {
          name: "By Relationship",
          type: "table",
          groupBy: "relationship"
        },
        {
          name: "Need to Contact",
          type: "table",
          filters: [
            {
              property: "last_contact",
              operator: "is-before",
              value: "-30d"
            }
          ]
        }
      ]
    };

    const basePath = path.join(this.vaultPath, 'People', 'People.base');
    await this.writeBase(basePath, baseConfig);
    return basePath;
  }

  /**
   * Creates a projects base
   */
  async createProjectsBase() {
    const baseConfig = {
      name: "Projects",
      source: {
        type: "folder",
        path: "Projects"
      },
      sorts: [
        {
          property: "status",
          direction: "ascending"
        },
        {
          property: "priority",
          direction: "ascending"
        }
      ],
      properties: [
        { name: "title", visible: true },
        { name: "status", visible: true },
        { name: "priority", visible: true },
        { name: "category", visible: true },
        { name: "start_date", visible: true },
        { name: "deadline", visible: true },
        { name: "progress", visible: true }
      ],
      views: [
        {
          name: "Active Projects",
          type: "table",
          filters: [
            {
              property: "status",
              operator: "in",
              value: ["active", "in-progress"]
            }
          ]
        },
        {
          name: "By Status",
          type: "table",
          groupBy: "status"
        },
        {
          name: "Completed",
          type: "table",
          filters: [
            {
              property: "status",
              operator: "equals",
              value: "completed"
            }
          ]
        }
      ]
    };

    const basePath = path.join(this.vaultPath, 'Projects', 'Projects.base');
    await this.writeBase(basePath, baseConfig);
    return basePath;
  }

  /**
   * Initializes all bases
   */
  async initializeAllBases() {
    console.log('📊 Creating Obsidian Bases...');

    const bases = [];

    try {
      bases.push(await this.createMasterBase());
      console.log('  ✅ Master base created');

      bases.push(await this.createTasksBase());
      console.log('  ✅ Tasks base created');

      bases.push(await this.createMeetingsBase());
      console.log('  ✅ Meetings base created');

      bases.push(await this.createFinanceBase());
      console.log('  ✅ Finance base created');

      bases.push(await this.createIdeasBase());
      console.log('  ✅ Ideas base created');

      bases.push(await this.createPeopleBase());
      console.log('  ✅ People base created');

      bases.push(await this.createProjectsBase());
      console.log('  ✅ Projects base created');

      console.log(`✅ Created ${bases.length} bases`);

      return bases;
    } catch (error) {
      console.error('❌ Error creating bases:', error);
      throw error;
    }
  }

  /**
   * Writes a base configuration to a .base file
   */
  async writeBase(filePath, config) {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Convert config to YAML format (Bases use YAML internally)
    const yamlContent = yaml.dump(config);

    await fs.writeFile(filePath, yamlContent, 'utf-8');

    return filePath;
  }

  /**
   * Updates base with new note
   */
  async updateBaseWithNote(triageResult) {
    // Bases automatically detect new notes with proper frontmatter
    // No manual update needed, but we can trigger a refresh
    console.log(`  📊 Note will appear in bases: ${triageResult.type}, ${triageResult.category}`);
  }
}
