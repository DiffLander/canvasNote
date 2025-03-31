/**
 * Template creator utility function
 * Helps create consistent templates with all required properties
 */
export function createTemplate({
  id,
  name,
  renderer, // Custom renderer function/component
  behaviors = {
    draggable: true,
    resizable: true,
    editable: true,
    closable: true,
    // Custom behaviors go here
  },
  defaultSize = { width: 250, height: 150 },
  defaultContent = '',
  customControls = {}, // Custom buttons/widgets
  handlers = {}, // Custom event handlers
  styles = {}
}) {
  return {
    id,
    name,
    renderer,
    behaviors,
    defaultSize,
    defaultContent,
    customControls,
    handlers,
    styles,
    
    // Methods that templates can provide
    applyTo: (note) => {
      return {
        ...note,
        templateId: id,
        behaviors: { ...behaviors },
        customControls: { ...customControls },
        size: note.size || defaultSize,
        content: note.content || defaultContent,
        // Apply any other template properties
      };
    }
  };
}

/**
 * Default templates that can be used as a starting point
 */
export const defaultTemplates = [
  createTemplate({
    id: 'default',
    name: 'Default Note',
    defaultContent: 'Add your content here...',
    styles: {
      backgroundColor: '#fff',
      color: '#333',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }
  }),
  createTemplate({
    id: 'code-note',
    name: 'Code Snippet',
    defaultContent: '// Your code here\n\n',
    defaultSize: { width: 400, height: 300 },
    behaviors: {
      draggable: true,
      resizable: true,
      editable: true,
      closable: true,
      codeHighlighting: true
    },
    styles: {
      backgroundColor: '#2d2d2d',
      color: '#f8f8f2',
      border: '1px solid #555',
      borderRadius: '4px',
      fontFamily: 'monospace',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    }
  }),
  createTemplate({
    id: 'task-note',
    name: 'Task List',
    defaultContent: '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3',
    behaviors: {
      draggable: true,
      resizable: true,
      editable: true,
      closable: true,
      checkboxToggle: true
    },
    styles: {
      backgroundColor: '#f9f7e8',
      color: '#555',
      border: '1px solid #e6e2c9',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }
  })
];

/**
 * Register initial templates with the template manager
 */
export function registerInitialTemplates(registerTemplate) {
  defaultTemplates.forEach(template => {
    registerTemplate(template);
  });
}
