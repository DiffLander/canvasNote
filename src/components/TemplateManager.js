import React, { useState, useCallback, createContext } from 'react';

// Create context for templates
export const TemplateContext = createContext(null);

/**
 * TemplateManager - Handles template registration and management
 * Centralizes template functionality and provides context for templates
 */
function TemplateManager({ children, initialTemplates = [] }) {
  // State for storing templates
  const [templates, setTemplates] = useState(initialTemplates);

  // Register a new template
  const registerTemplate = useCallback((template) => {
    if (!template || !template.id) {
      console.error('Cannot register template: Invalid template or missing ID');
      return false;
    }

    setTemplates(prevTemplates => {
      // Check if template with this ID already exists
      const existingIndex = prevTemplates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        // Update existing template
        const updatedTemplates = [...prevTemplates];
        updatedTemplates[existingIndex] = {
          ...updatedTemplates[existingIndex],
          ...template
        };
        return updatedTemplates;
      } else {
        // Add new template
        return [...prevTemplates, template];
      }
    });

    return true;
  }, []);

  // Remove a template by ID
  const removeTemplate = useCallback((templateId) => {
    setTemplates(prevTemplates => 
      prevTemplates.filter(template => template.id !== templateId)
    );
  }, []);

  // Get a template by ID
  const getTemplate = useCallback((templateId) => {
    return templates.find(template => template.id === templateId) || null;
  }, [templates]);

  // Template context value with methods and state
  const templateContextValue = {
    templates,
    setTemplates,
    registerTemplate,
    removeTemplate,
    getTemplate
  };

  return (
    <TemplateContext.Provider value={templateContextValue}>
      {children}
    </TemplateContext.Provider>
  );
}

export default TemplateManager;
