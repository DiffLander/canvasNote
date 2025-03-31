import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import NoteTemplate from '../templates/BaseTemplate';
import { registerCustomTemplate } from '../templates/NoteTemplates';

/**
 * TemplateEditor - A component for creating and editing custom note templates
 */
const TemplateEditor = ({ onClose, onSave, initialTemplate = null }) => {
  const [id, setId] = useState(initialTemplate?.id || `custom-${uuidv4().substring(0, 8)}`);
  const [name, setName] = useState(initialTemplate?.name || 'New Custom Template');
  const [description, setDescription] = useState(initialTemplate?.description || 'Custom note template');
  const [width, setWidth] = useState(initialTemplate?.defaultSize?.width || 300);
  const [height, setHeight] = useState(initialTemplate?.defaultSize?.height || 200);
  const [content, setContent] = useState(initialTemplate?.defaultContent || getDefaultTemplateContent());
  const [previewMode, setPreviewMode] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [error, setError] = useState(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [reactComponentCode, setReactComponentCode] = useState(initialTemplate?.reactCode || getDefaultReactComponentCode());

  // Function to get default template content with helpful comments
  function getDefaultTemplateContent() {
    return `<!-- 
CUSTOM_NOTE_CONFIG: {
  "controls": {
    "showHeader": true,
    "title": "My Custom Note",
    "headerStyle": {
      "backgroundColor": "#4285f4",
      "color": "white"
    },
    "contentStyle": {
      "padding": "10px"
    }
  }
}
-->

<div style="padding: 10px; height: 100%;">
  <h3>Custom Template</h3>
  <p>This is a custom note template. Edit the HTML, CSS, and JavaScript to create your own note type.</p>
  
  <p>Current time: <span id="time"></span></p>
  
  <script>
    function updateTime() {
      const timeElement = document.getElementById('time');
      if (timeElement) {
        timeElement.textContent = new Date().toLocaleTimeString();
      }
    }
    
    updateTime();
    setInterval(updateTime, 1000);
  </script>
</div>`;
  }

  // Function to get default React component code
  function getDefaultReactComponentCode() {
    return `import React, { useState, useEffect } from 'react';

/**
 * Custom React component for rendering note content
 * This is the advanced template mode, where you can create
 * fully-featured React components for your notes.
 */
const CustomComponent = ({ note, content, onContentChange, onCustomAction }) => {
  const [counter, setCounter] = useState(0);
  
  // Example of using React hooks
  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(prev => prev + 1);
    }, 1000);
    
    // Clean up when component unmounts
    return () => clearInterval(timer);
  }, []);
  
  // Example of custom note update
  const updateNoteContent = () => {
    onContentChange('Content updated at: ' + new Date().toLocaleTimeString());
  };
  
  return (
    <div style={{ padding: '15px', height: '100%' }}>
      <h3>Advanced React Component</h3>
      <p>This component has been running for {counter} seconds</p>
      
      <button 
        onClick={updateNoteContent}
        style={{
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Update Note Content
      </button>
    </div>
  );
};

export default CustomComponent;`;
  }

  // Handle saving the template
  const handleSave = () => {
    try {
      let newTemplate;
      
      if (isAdvancedMode) {
        // For advanced mode, we'll store the React code in the template
        // We won't create the component dynamically here, but will do it
        // properly when the template is loaded in NoteTemplates.js
        newTemplate = new NoteTemplate(
          id,
          name,
          description,
          { width: parseInt(width), height: parseInt(height) },
          "Loading advanced component...", // Default content while component loads
          null, // Component will be created when the template is loaded
          {}, // Custom controls
          null, // Canvas component
          { // Behaviors
            draggable: true,
            resizable: true
          }
        );
        
        // Store the React code for future loading
        newTemplate.reactCode = reactComponentCode;
        newTemplate.isAdvancedTemplate = true;
      } else {
        // For basic mode, create a template with HTML content
        newTemplate = new NoteTemplate(
          id,
          name,
          description,
          { width: parseInt(width), height: parseInt(height) },
          content
        );
      }
      
      // Register the template and notify parent
      const updatedTemplates = registerCustomTemplate(newTemplate);
      
      if (onSave) {
        onSave(newTemplate, updatedTemplates);
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving template:', err);
      setError(`Error saving template: ${err.message}`);
    }
  };

  return (
    <div className="create-template-modal">
      <h2>{initialTemplate ? 'Edit Template' : 'Create New Template'}</h2>
      
      {error && (
        <div className="template-error">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      
      <div className="template-form">
        <div className="form-row">
          <label>
            Template Name:
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for your template"
            />
          </label>
        </div>
        
        <div className="form-row">
          <label>
            Description:
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template does"
            />
          </label>
        </div>
        
        <div className="form-row size-inputs">
          <label>
            Width:
            <input 
              type="number" 
              value={width} 
              onChange={(e) => setWidth(e.target.value)}
              min="100"
              max="1000"
            />
          </label>
          
          <label>
            Height:
            <input 
              type="number" 
              value={height} 
              onChange={(e) => setHeight(e.target.value)}
              min="100"
              max="1000"
            />
          </label>
        </div>
        
        <div className="template-mode-toggle">
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isAdvancedMode} 
              onChange={() => setIsAdvancedMode(!isAdvancedMode)} 
            />
            <span className="slider round"></span>
          </label>
          <span>{isAdvancedMode ? 'Advanced Mode (React)' : 'Basic Mode (HTML/JS)'}</span>
        </div>
        
        {isAdvancedMode ? (
          <div className="advanced-editor">
            <div className="editor-toolbar">
              <button onClick={() => setReactComponentCode(getDefaultReactComponentCode())}>
                Reset to Default
              </button>
              <button onClick={() => setShowHelpPanel(!showHelpPanel)}>
                {showHelpPanel ? 'Hide Help' : 'Show Help'}
              </button>
            </div>
            
            {showHelpPanel && (
              <div className="help-panel">
                <h3>React Component Help</h3>
                <p>
                  Write a full React component to customize your note. Your component should:
                </p>
                <ul>
                  <li>Accept these props: <code>note, content, onContentChange, onCustomAction</code></li>
                  <li>Export your component as the default export</li>
                  <li>Name your main component <code>CustomComponent</code></li>
                </ul>
                <div className="code-example">
                  <pre>
{`import React from 'react';

const CustomComponent = (props) => {
  // Your component code
  return (
    <div>Your custom UI</div>
  );
};

export default CustomComponent;`}
                  </pre>
                </div>
              </div>
            )}
            
            <textarea
              className="code-editor react-editor"
              value={reactComponentCode}
              onChange={(e) => setReactComponentCode(e.target.value)}
              placeholder="Write your React component here..."
              spellCheck="false"
            />
          </div>
        ) : (
          <div className="template-editor">
            <div className="editor-toolbar">
              <button
                className={`toolbar-button ${previewMode ? 'active' : ''}`}
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              
              <button
                className="toolbar-button"
                onClick={() => setShowHelpPanel(!showHelpPanel)}
              >
                {showHelpPanel ? 'Hide Help' : 'Show Help'}
              </button>
              
              <button
                className="toolbar-button"
                onClick={() => setContent(getDefaultTemplateContent())}
              >
                Reset
              </button>
            </div>
            
            {showHelpPanel && (
              <div className="help-panel">
                <h3>Template Syntax Help</h3>
                <p>You can use HTML, CSS, and JavaScript to create your template:</p>
                
                <div className="help-section">
                  <h4>Configuration</h4>
                  <p>Use a special HTML comment to configure your note:</p>
                  <pre>
{`<!-- 
CUSTOM_NOTE_CONFIG: {
  "controls": {
    "showHeader": true,
    "title": "My Custom Note",
    "headerStyle": {
      "backgroundColor": "#4285f4",
      "color": "white"
    }
  }
}
-->`}
                  </pre>
                </div>
                
                <div className="help-section">
                  <h4>HTML Structure</h4>
                  <p>Create your note content with standard HTML tags.</p>
                </div>
                
                <div className="help-section">
                  <h4>JavaScript</h4>
                  <p>Add interactivity with JavaScript inside script tags:</p>
                  <pre>
{`<script>
  // Your JavaScript code
  function updateElement() {
    document.getElementById('my-element').textContent = 'Updated!';
  }
  
  // Call a function when the note loads
  updateElement();
  
  // Access note APIs
  note.updateContent('<p>New content!</p>');
</script>`}
                  </pre>
                </div>
                
                <div className="help-section">
                  <h4>Available APIs</h4>
                  <p>Your script has access to these note APIs:</p>
                  <ul>
                    <li><code>note.updateContent(newContent)</code> - Update the note's content</li>
                    <li><code>note.close()</code> - Close/delete the note</li>
                    <li><code>note.noteId</code> - The unique ID of this note</li>
                  </ul>
                </div>
              </div>
            )}
            
            {previewMode ? (
              <div className="template-preview">
                <div 
                  className="preview-container"
                  style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    position: 'relative',
                    margin: '0 auto',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    borderRadius: '3px'
                  }}
                >
                  <div className="preview-header" style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderBottom: '1px solid #ddd' }}>
                    <div className="preview-title">Preview: {name}</div>
                  </div>
                  <div
                    className="preview-content"
                    style={{ height: 'calc(100% - 31px)', overflow: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              </div>
            ) : (
              <textarea
                className="code-editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your HTML, CSS, and JavaScript code here..."
                spellCheck="false"
              />
            )}
          </div>
        )}
        
        <div className="template-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save Template</button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
