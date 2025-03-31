// NoteTemplates.js - Main index file for all note templates
import React from 'react';
import NoteTemplate from './BaseTemplate';
import { defaultTemplates } from '../utils/templateHelper';

// Clear custom templates on startup to reset sizes
try {
  localStorage.removeItem('customTemplates');
  console.log('Cleared custom templates to reset sizes');
} catch (err) {
  console.error('Error clearing custom templates:', err);
}

// Create a proper React component to load dynamic components
// This follows React's rules of hooks
const DynamicComponentLoader = ({ templateId, reactCode, ...otherProps }) => {
  const [Component, setComponent] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    try {
      // For demo purposes, creating an IIFE that returns the component
      const componentCode = `
        (function() {
          ${reactCode}
          return CustomComponent;
        })()
      `;
      
      // Execute the code to get the component
      const ComponentClass = eval(componentCode);
      setComponent(() => ComponentClass);
    } catch (err) {
      console.error(`Error creating dynamic component for template ${templateId}:`, err);
      setError(err.message);
    }
  }, [templateId, reactCode]);

  if (error) {
    return (
      <div style={{color: 'red', padding: '10px'}}>
        Error rendering component: {error}
      </div>
    );
  }

  if (!Component) {
    return <div>Loading advanced component...</div>;
  }

  return <Component {...otherProps} />;
};

// Load custom templates from localStorage
const loadCustomTemplates = () => {
  try {
    const savedTemplates = localStorage.getItem('customTemplates');
    if (savedTemplates) {
      return JSON.parse(savedTemplates);
    }
  } catch (err) {
    console.error('Error loading custom templates:', err);
  }
  return [];
};

// Save custom templates to localStorage
const saveCustomTemplates = (customTemplates) => {
  try {
    localStorage.setItem('customTemplates', JSON.stringify(customTemplates));
  } catch (err) {
    console.error('Error saving custom templates:', err);
  }
};

// Initialize with templates from localStorage
let customTemplates = loadCustomTemplates();

// Create collection of built-in templates using the new system
const templates = [...defaultTemplates];

// Registers a new custom template
// @param {object} template - The template to register
const registerCustomTemplate = (template) => {
  // Don't register if template already exists (use update instead)
  if (customTemplates.some(t => t.id === template.id)) {
    console.warn(`Template with ID ${template.id} already exists. Use updateCustomTemplate instead.`);
    return false;
  }
  
  // Add to collection
  customTemplates.push(template);
  
  // Save to localStorage
  saveCustomTemplates(customTemplates);
  
  return true;
};

// Removes a custom template
// @param {string} templateId - ID of the template to remove
const removeCustomTemplate = (templateId) => {
  const initialLength = customTemplates.length;
  customTemplates = customTemplates.filter(t => t.id !== templateId);
  
  if (customTemplates.length !== initialLength) {
    saveCustomTemplates(customTemplates);
    return true;
  }
  return false;
};

// Export both the template collection and utility functions
export { 
  NoteTemplate, 
  registerCustomTemplate, 
  removeCustomTemplate,
  DynamicComponentLoader
};

// Export the combined templates array
const combinedTemplates = [...templates, ...customTemplates];
export { combinedTemplates as templates };

export default {
  templates: combinedTemplates,
  registerCustomTemplate,
  removeCustomTemplate
};
