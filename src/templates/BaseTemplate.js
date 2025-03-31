// BaseTemplate.js - Base template class for creating note templates

/**
 * Base class for all note templates. Provides common functionality and structure.
 */
class NoteTemplate {
  /**
   * Create a new note template
   * @param {string} id - Unique identifier for this template
   * @param {string} name - Display name for the template
   * @param {string} description - Description of what this template does
   * @param {object} defaultSize - Default width and height for notes of this template
   * @param {string} defaultContent - Default HTML content for notes of this template
   * @param {function} component - React component for rendering the note content (optional)
   * @param {object} customControls - Custom controls configuration (optional)
   * @param {function} canvasComponent - React component for canvas-level rendering (optional)
   * @param {object} behaviors - Custom behaviors for this template (optional)
   * @param {object} handlers - Custom event handlers for this template (optional)
   * @param {object} styles - Default styles for this template (optional)
   * @param {object} themes - Custom themes for this template (optional)
   * @param {object} animations - Custom animations for this template (optional)
   * @param {object} accessibility - Accessibility options for this template (optional)
   */
  constructor(id, name, description, defaultSize, defaultContent, component = null, customControls = {}, canvasComponent = null, behaviors = {}, handlers = {}, styles = {}, themes = {}, animations = {}, accessibility = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.defaultSize = defaultSize || { width: 250, height: 150 };
    this.defaultContent = defaultContent || '';
    this.component = component; // Custom React component for rendering inside the note
    this.canvasComponent = canvasComponent; // Custom React component for rendering at canvas level
    this.customControls = customControls; // Custom controls for the note (e.g., custom header buttons)
    this.styles = styles; // Default styles for the template
    
    // Define default themes with light and dark options
    this.themes = {
      light: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        borderColor: '#dddddd',
        headerColor: '#f5f5f5',
        accentColor: '#4a90e2'
      },
      dark: {
        backgroundColor: '#2d2d2d',
        textColor: '#f8f8f2',
        borderColor: '#555555',
        headerColor: '#383838',
        accentColor: '#6272a4'
      },
      // Allow custom themes to override defaults
      ...themes
    };
    
    // Define default animations
    this.animations = {
      create: {
        type: 'fade-in',
        duration: 300
      },
      delete: {
        type: 'fade-out',
        duration: 300
      },
      minimize: {
        type: 'slide-up',
        duration: 200
      },
      maximize: {
        type: 'slide-down',
        duration: 200
      },
      // Allow custom animations to override defaults
      ...animations
    };
    
    // Define default accessibility options
    this.accessibility = {
      ariaLabels: {
        close: 'Close note',
        minimize: 'Minimize note',
        maximize: 'Maximize note',
        resize: 'Resize note'
      },
      keyboardShortcuts: {
        close: 'Escape',
        save: 'Ctrl+S',
        undo: 'Ctrl+Z'
      },
      highContrast: false,
      textZoom: 100, // percentage
      // Allow custom accessibility options to override defaults
      ...accessibility
    };
    
    // Define default behaviors that can be overridden by templates
    this.behaviors = {
      // Can the note be dragged?
      draggable: true,
      // Can the note be resized?
      resizable: true,
      // Can the note be deleted?
      deletable: true,
      // Can the note be minimized?
      minimizable: true,
      // Can the note create other notes?
      canCreateNotes: false,
      // Can the note be locked to prevent editing?
      lockable: true,
      // Can the note be exported?
      exportable: true,
      // Can the note be duplicated?
      duplicatable: true,
      // Can the note change themes?
      themeable: true,
      // Does the note support undo/redo?
      undoable: false,
      // Override with any provided behaviors
      ...behaviors
    };
    
    // Define default handlers that can be overridden by templates
    this.handlers = {
      // Drag handlers
      onDragStart: null,
      onDrag: null,
      onDragEnd: (e, data, note) => {
        // Default implementation - just return the data
        return data;
      },
      
      // Resize handlers
      onResizeStart: null,
      onResize: null,
      onResizeEnd: (e, { size }, note) => {
        // Default implementation - enforce reasonable limits
        const maxWidth = 600;
        const maxHeight = 600;
        const minWidth = 100;
        const minHeight = 100;
        
        // Apply constraints
        const constrainedSize = {
          width: Math.min(Math.max(size.width, minWidth), maxWidth),
          height: Math.min(Math.max(size.height, minHeight), maxHeight)
        };
        
        // Only return a value if we need to override
        if (constrainedSize.width !== size.width || constrainedSize.height !== size.height) {
          return constrainedSize;
        }
        
        // Otherwise, return null to use the original size
        return null;
      },
      
      // Other handlers
      onDelete: null,
      onSelect: null,
      onDeselect: null,
      onMinimize: null,
      onMaximize: null,
      onContentChange: null,
      onExport: null,
      onDuplicate: null,
      onThemeChange: null,
      onLock: null,
      onUnlock: null,
      onUndo: null,
      onRedo: null,
      
      // Override with any provided handlers
      ...handlers
    };
  }
  
  /**
   * Factory method to create a note instance from this template
   * @param {string} id - Unique identifier for the new note (optional, will generate if not provided)
   * @param {object} position - Initial position for the note (optional, will use default if not provided)
   * @param {object} options - Additional options for creating the note
   * @returns {object} A new note instance based on this template
   */
  createNoteInstance(id, position, options = {}) {
    const metadata = options.metadata || {};
    const content = options.content || this.defaultContent;
    const size = options.size || { ...this.defaultSize };
    const currentTheme = options.theme || 'light';
    
    return {
      id: id || `note-${Date.now()}`,
      templateId: this.id,
      position: position || { x: 100, y: 100 },
      size: size,
      content: content,
      customControls: { ...this.customControls },
      hasCanvasComponent: !!this.canvasComponent,
      behaviors: { ...this.behaviors },
      styles: { ...this.styles },
      metadata: { ...metadata },
      theme: currentTheme,
      isLocked: options.isLocked || false,
      isMinimized: options.isMinimized || false,
      history: options.history || { 
        past: [], 
        future: [] 
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Get current theme styling based on theme name
   * @param {string} themeName - Name of the theme to get styles for
   * @returns {object} Theme styles
   */
  getThemeStyles(themeName = 'light') {
    return this.themes[themeName] || this.themes.light;
  }
  
  /**
   * Export the note data to a specific format
   * @param {object} note - The note instance to export
   * @param {string} format - Format to export as (json, markdown, html, etc.)
   * @returns {string} Exported note data
   */
  exportNote(note, format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(note, null, 2);
      case 'markdown':
        return `# ${this.name}\n\n${note.content}`;
      case 'html':
        return `<div class="note">\n  <h2>${this.name}</h2>\n  <div>${note.content}</div>\n</div>`;
      default:
        return JSON.stringify(note, null, 2);
    }
  }
  
  /**
   * Duplicate a note with a new ID
   * @param {object} note - The note instance to duplicate
   * @returns {object} New note instance
   */
  duplicateNote(note) {
    const offsetPosition = {
      x: note.position.x + 20,
      y: note.position.y + 20
    };
    
    return this.createNoteInstance(
      null, 
      offsetPosition, 
      {
        content: note.content,
        size: { ...note.size },
        metadata: { ...note.metadata },
        theme: note.theme
      }
    );
  }
}

export default NoteTemplate;
