import React, { useState, useEffect } from 'react';

const Toolbar = ({ 
  onAddNote, 
  templates, 
  onCreateTemplate, 
  onToggleDebug, 
  debugMode 
}) => {
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTemplateDropdown && !event.target.closest('.template-dropdown')) {
        setShowTemplateDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTemplateDropdown]);
  
  const toggleTemplateDropdown = () => {
    setShowTemplateDropdown(!showTemplateDropdown);
  };
  
  const handleTemplateSelect = (templateId) => {
    onAddNote(templateId);
    setShowTemplateDropdown(false);
  };
  
  return (
    <div className="toolbar">
      <div className="template-dropdown">
        <button 
          className="toolbar-button"
          onClick={toggleTemplateDropdown}
        >
          Add Note ▾
        </button>
        
        {showTemplateDropdown && (
          <div className="template-dropdown-content">
            {templates && templates.length > 0 ? (
              templates.map(template => (
                <div 
                  key={template.id}
                  className="template-option"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  {template.name}
                </div>
              ))
            ) : (
              <div className="template-option disabled">No templates available</div>
            )}
            <div className="template-option create" onClick={onCreateTemplate}>
              + Create Custom Template
            </div>
          </div>
        )}
      </div>
      
      <button 
        className="toolbar-button"
        onClick={onCreateTemplate}
      >
        Create Template
      </button>
      
      {onToggleDebug && (
        <button 
          className={`toolbar-button ${debugMode ? 'active' : ''}`}
          onClick={onToggleDebug}
        >
          {debugMode ? 'Hide Debug' : 'Show Debug'}
        </button>
      )}
    </div>
  );
};

export default Toolbar;
