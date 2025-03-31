import React, { useState, useContext } from 'react';
import { TemplateContext } from './TemplateManager';

const ContextMenu = ({ 
  position, 
  onClose, 
  onAddNote
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const { templates } = useContext(TemplateContext);
  
  // Close the menu if clicked outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.context-menu')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  return (
    <div 
      className="context-menu" 
      style={{ 
        left: position.x, 
        top: position.y 
      }}
    >
      <div className="context-menu-item" onClick={onAddNote}>
        Add Note
      </div>
      
      <div 
        className="context-menu-item"
        onClick={() => setShowTemplates(!showTemplates)}
      >
        {showTemplates ? 'Hide Templates' : 'Show All Templates'}
      </div>
      
      {showTemplates && templates && templates.length > 0 && (
        <div className="context-menu-template-list">
          {templates.map(template => (
            <div 
              key={template.id}
              className="context-menu-item template-item"
              onClick={() => {
                onAddNote(template.id);
              }}
            >
              <div 
                className="template-color" 
                style={{ 
                  backgroundColor: template.styles?.backgroundColor || '#ccc',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginRight: '8px'
                }}
              />
              {template.name}
            </div>
          ))}
        </div>
      )}
      
      <div className="context-menu-divider"></div>
      
      <div className="context-menu-item" onClick={onClose}>
        Cancel
      </div>
    </div>
  );
};

export default ContextMenu;
