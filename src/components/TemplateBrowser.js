import React, { useContext, useState } from 'react';
import { TemplateContext } from './TemplateManager';
import { NotesContext } from './NoteManager';

/**
 * TemplateBrowser - Provides a UI for browsing and using templates
 * Allows users to see available templates and drag them onto the canvas
 */
function TemplateBrowser({ onCreateTemplate }) {
  const { templates } = useContext(TemplateContext);
  const { addNote } = useContext(NotesContext);
  const [expanded, setExpanded] = useState(true);
  
  // Handle dragging a template
  const handleDragStart = (e, templateId) => {
    e.dataTransfer.setData('template-id', templateId);
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  // Toggle the browser panel
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className={`template-browser ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="template-browser-header">
        <h3>Templates</h3>
        <button onClick={toggleExpanded} className="toggle-browser-btn">
          {expanded ? '◀' : '▶'}
        </button>
      </div>
      
      {expanded && (
        <>
          <div className="template-list">
            {templates && templates.length > 0 ? (
              templates.map(template => (
                <div 
                  key={template.id}
                  className="template-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, template.id)}
                  onClick={() => addNote({ x: 200, y: 200 }, template.id)}
                >
                  <div className="template-icon" style={{ backgroundColor: template.styles?.backgroundColor || '#f5f5f5' }}>
                    {template.name.charAt(0)}
                  </div>
                  <div className="template-name">{template.name}</div>
                </div>
              ))
            ) : (
              <div className="no-templates">No templates available</div>
            )}
          </div>
          
          <div className="template-browser-footer">
            <button className="create-template-btn" onClick={onCreateTemplate}>
              + Create Template
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default TemplateBrowser;
