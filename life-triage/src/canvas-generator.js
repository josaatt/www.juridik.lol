/**
 * JSON Canvas Generator
 * Creates visual canvas files showing relationships between notes
 * Spec: https://jsoncanvas.org/
 */

export class CanvasGenerator {
  constructor() {
    this.colors = {
      task: "1",      // red
      meeting: "2",   // orange
      idea: "3",      // yellow
      note: "4",      // green
      decision: "5",  // cyan
      journal: "6",   // purple
      invoice: "1",   // red
      receipt: "2",   // orange
      other: "4"      // green
    };
  }

  /**
   * Creates a canvas showing a note and its relationships
   */
  createNoteCanvas(triageResult, relatedNotes = []) {
    const nodes = [];
    const edges = [];

    // Main note (center)
    const mainNode = this.createFileNode(
      'main',
      triageResult.title,
      triageResult.notePath,
      0,
      0,
      400,
      300,
      this.colors[triageResult.type] || this.colors.other
    );
    nodes.push(mainNode);

    let nodeId = 1;
    let angle = 0;
    const radius = 500;
    const angleStep = (2 * Math.PI) / Math.max(relatedNotes.length, 1);

    // Add related notes in a circle
    for (const related of relatedNotes) {
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const node = this.createFileNode(
        `related-${nodeId}`,
        related.title,
        related.path,
        x,
        y,
        300,
        200,
        this.colors[related.type] || this.colors.other
      );
      nodes.push(node);

      // Create edge
      edges.push(this.createEdge(`main`, `related-${nodeId}`, related.relationship || ''));

      nodeId++;
      angle += angleStep;
    }

    // Add extracted data as text nodes
    if (triageResult.extractedData) {
      const { dates, people, locations, actionItems } = triageResult.extractedData;

      if (people && people.length > 0) {
        const peopleNode = this.createTextNode(
          'people',
          `**People**\n\n${people.map(p => `- [[${p}]]`).join('\n')}`,
          -600,
          -200,
          250,
          150,
          "5" // cyan
        );
        nodes.push(peopleNode);
        edges.push(this.createEdge('main', 'people', 'involves'));
      }

      if (dates && dates.length > 0) {
        const datesNode = this.createTextNode(
          'dates',
          `**Dates**\n\n${dates.join('\n')}`,
          600,
          -200,
          200,
          120,
          "3" // yellow
        );
        nodes.push(datesNode);
        edges.push(this.createEdge('main', 'dates', 'scheduled'));
      }

      if (actionItems && actionItems.length > 0) {
        const tasksNode = this.createTextNode(
          'tasks',
          `**Action Items**\n\n${actionItems.map(t => `- [ ] ${t}`).join('\n')}`,
          -600,
          200,
          300,
          200,
          "1" // red
        );
        nodes.push(tasksNode);
        edges.push(this.createEdge('main', 'tasks', 'requires'));
      }
    }

    return {
      nodes,
      edges
    };
  }

  /**
   * Creates a timeline canvas showing notes chronologically
   */
  createTimelineCanvas(notes) {
    const nodes = [];
    const edges = [];

    const spacing = 400;
    let x = 0;

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];

      const node = this.createFileNode(
        `note-${i}`,
        note.title,
        note.path,
        x,
        0,
        300,
        200,
        this.colors[note.type] || this.colors.other
      );
      nodes.push(node);

      // Connect to previous note
      if (i > 0) {
        edges.push(this.createEdge(`note-${i - 1}`, `note-${i}`, ''));
      }

      x += spacing;
    }

    return {
      nodes,
      edges
    };
  }

  /**
   * Creates a category canvas grouping notes by category
   */
  createCategoryCanvas(notesByCategory) {
    const nodes = [];
    const edges = [];

    const categories = Object.keys(notesByCategory);
    const columns = Math.ceil(Math.sqrt(categories.length));

    categories.forEach((category, catIndex) => {
      const col = catIndex % columns;
      const row = Math.floor(catIndex / columns);

      const baseX = col * 800;
      const baseY = row * 600;

      // Category header
      const headerNode = this.createTextNode(
        `cat-${category}`,
        `# ${category.toUpperCase()}`,
        baseX,
        baseY,
        300,
        80,
        this.getCategoryColor(category)
      );
      nodes.push(headerNode);

      // Notes in category
      const categoryNotes = notesByCategory[category];
      categoryNotes.forEach((note, noteIndex) => {
        const noteNode = this.createFileNode(
          `${category}-${noteIndex}`,
          note.title,
          note.path,
          baseX + (noteIndex % 2) * 350,
          baseY + 120 + Math.floor(noteIndex / 2) * 180,
          300,
          150,
          this.colors[note.type] || this.colors.other
        );
        nodes.push(noteNode);

        edges.push(this.createEdge(`cat-${category}`, `${category}-${noteIndex}`, ''));
      });
    });

    return {
      nodes,
      edges
    };
  }

  /**
   * Creates a weekly overview canvas
   */
  createWeeklyCanvas(weekNotes, weekStart) {
    const nodes = [];
    const edges = [];

    // Week header
    const headerNode = this.createTextNode(
      'header',
      `# Week of ${weekStart}`,
      0,
      -300,
      400,
      100,
      "6"
    );
    nodes.push(headerNode);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const spacing = 350;

    days.forEach((day, index) => {
      const x = (index - 3) * spacing;

      // Day header
      const dayNode = this.createTextNode(
        `day-${index}`,
        `## ${day}`,
        x,
        0,
        300,
        80,
        "4"
      );
      nodes.push(dayNode);

      // Notes for this day
      const dayNotes = weekNotes[day] || [];
      dayNotes.forEach((note, noteIndex) => {
        const noteNode = this.createFileNode(
          `${day}-${noteIndex}`,
          note.title,
          note.path,
          x,
          120 + noteIndex * 180,
          280,
          150,
          this.colors[note.type] || this.colors.other
        );
        nodes.push(noteNode);

        edges.push(this.createEdge(`day-${index}`, `${day}-${noteIndex}`, ''));
      });
    });

    return {
      nodes,
      edges
    };
  }

  /**
   * Creates a text node
   */
  createTextNode(id, text, x, y, width, height, color = null) {
    const node = {
      id,
      type: 'text',
      x,
      y,
      width,
      height,
      text
    };

    if (color) {
      node.color = color;
    }

    return node;
  }

  /**
   * Creates a file node
   */
  createFileNode(id, label, file, x, y, width, height, color = null) {
    const node = {
      id,
      type: 'file',
      file,
      x,
      y,
      width,
      height
    };

    if (color) {
      node.color = color;
    }

    return node;
  }

  /**
   * Creates a link node
   */
  createLinkNode(id, url, x, y, width, height, color = null) {
    const node = {
      id,
      type: 'link',
      url,
      x,
      y,
      width,
      height
    };

    if (color) {
      node.color = color;
    }

    return node;
  }

  /**
   * Creates a group node (container for other nodes)
   */
  createGroupNode(id, label, x, y, width, height, color = null) {
    const node = {
      id,
      type: 'group',
      label,
      x,
      y,
      width,
      height
    };

    if (color) {
      node.color = color;
    }

    return node;
  }

  /**
   * Creates an edge between two nodes
   */
  createEdge(fromNode, toNode, label = '', color = null) {
    const edge = {
      id: `${fromNode}-${toNode}`,
      fromNode,
      toNode
    };

    if (label) {
      edge.label = label;
    }

    if (color) {
      edge.color = color;
    }

    return edge;
  }

  /**
   * Get color for category
   */
  getCategoryColor(category) {
    const categoryColors = {
      work: "2",      // orange
      personal: "4",  // green
      health: "1",    // red
      finance: "3",   // yellow
      relationships: "6", // purple
      learning: "5",  // cyan
      home: "4",      // green
      other: "4"      // green
    };

    return categoryColors[category] || "4";
  }

  /**
   * Converts canvas data to JSON string
   */
  toJSON(canvasData) {
    return JSON.stringify(canvasData, null, 2);
  }
}
