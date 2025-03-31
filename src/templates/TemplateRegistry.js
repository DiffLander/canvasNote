import { createTemplate } from '../utils/templateHelper';
import CodeNoteTemplate from './CodeNoteTemplate';

/**
 * Template Registry - Central place to register and access all templates
 * Makes it easy to add new templates to the application
 */

// Default text note template
const TextNoteTemplate = createTemplate({
  id: 'text-note',
  name: 'Text Note',
  defaultSize: { width: 300, height: 200 },
  defaultContent: 'Add your content here...',
  behaviors: {
    draggable: true,
    resizable: true,
    editable: true,
    closable: true
  },
  styles: {
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  }
});

// Task list template
const TaskListTemplate = createTemplate({
  id: 'task-list',
  name: 'Task List',
  defaultSize: { width: 300, height: 250 },
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
  },
  // Custom renderer could be added here to handle checkbox toggling
});

// Collection of all built-in templates
const builtInTemplates = [
  TextNoteTemplate,
  TaskListTemplate,
  CodeNoteTemplate
];

// Map of all registered templates by ID
const templateMap = {};

// Register built-in templates
builtInTemplates.forEach(template => {
  templateMap[template.id] = template;
});

/**
 * Get all registered templates
 * @returns {Array} Array of all templates
 */
export function getAllTemplates() {
  return Object.values(templateMap);
}

/**
 * Get a template by ID
 * @param {string} id - Template ID
 * @returns {Object|null} Template object or null if not found
 */
export function getTemplateById(id) {
  return templateMap[id] || null;
}

/**
 * Register a new template
 * @param {Object} template - Template object
 * @returns {boolean} True if successful, false otherwise
 */
export function registerTemplate(template) {
  if (!template || !template.id) {
    console.error('Cannot register template: Invalid template or missing ID');
    return false;
  }
  
  templateMap[template.id] = template;
  return true;
}

/**
 * Remove a template by ID
 * @param {string} id - Template ID to remove
 * @returns {boolean} True if successful, false otherwise
 */
export function removeTemplate(id) {
  if (!templateMap[id]) {
    console.warn(`Template with ID "${id}" not found`);
    return false;
  }
  
  delete templateMap[id];
  return true;
}

// Export the default templates and functions
export default {
  getAllTemplates,
  getTemplateById,
  registerTemplate,
  removeTemplate,
  builtInTemplates
};
