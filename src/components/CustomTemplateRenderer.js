import React, { useContext } from 'react';
import { TemplateContext } from './TemplateManager';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

/**
 * CustomTemplateRenderer - Renders a note using its template
 * Delegates actual rendering to the template's custom renderer
 */
function CustomTemplateRenderer({ 
  note, 
  selected, 
  onSelect, 
  onUpdate, 
  onDelete,
  canvasScale = 1
}) {
  // Get template context to find the template for this note
  const { templates, getTemplate } = useContext(TemplateContext);
  
  // Removed forced size behavior - let templates handle their own sizing
  
  // Find the template for this note
  const template = getTemplate ? 
    getTemplate(note.templateId) : 
    templates?.find(t => t.id === note.templateId);
  
  if (!template) {
    return (
      <div className="note note-error">
        <div className="note-header">
          <div className="note-title">Error: Template not found</div>
          <button className="note-close-btn" onClick={() => onDelete(note.id)}>×</button>
        </div>
        <div className="note-content">
          Template "{note.templateId}" not found.
        </div>
      </div>
    );
  }
  
  // Determine if behaviors are enabled
  const behaviors = {
    draggable: true,
    resizable: true,
    closable: true,
    editable: true,
    ...template.behaviors, // Template behaviors override defaults
    ...note.behaviors // Note-specific behaviors override template defaults
  };
  
  // Handle position updates
  const handleDragStop = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    onUpdate({ id: note.id, position: newPosition });
    
    // Call custom handler if present
    if (template.handlers && template.handlers.onDragEnd) {
      template.handlers.onDragEnd(e, data, note);
    }
  };
  
  // Handle resize
  const handleResizeStop = (e, { size }) => {
    // Let the template's handler process the resize if it has one
    if (template.handlers && template.handlers.onResizeEnd) {
      const processedSize = template.handlers.onResizeEnd(e, { size }, note);
      if (processedSize) {
        size = processedSize;
      }
    }
    
    onUpdate({ id: note.id, size });
  };
  
  // Handle content changes
  const handleContentChange = (content) => {
    onUpdate({ id: note.id, content });
  };
  
  // If the template provides a custom renderer, use it
  if (template.renderer) {
    // Set up props for the custom renderer
    const rendererProps = {
      note,
      selected,
      onSelect: () => onSelect(note.id),
      onUpdate,
      onDelete: () => onDelete(note.id),
      onContentChange: handleContentChange,
      behaviors,
      template,
      canvasScale
    };
    
    // Create element with the custom renderer
    return (
      <Draggable
        position={note.position || { x: 0, y: 0 }}
        onStop={handleDragStop}
        disabled={!behaviors.draggable}
        scale={canvasScale}
        handle=".note-header"
      >
        <div className={`note ${selected ? 'selected' : ''}`} onClick={() => onSelect(note.id)}>
          <Resizable
            width={note.size?.width || 250}
            height={note.size?.height || 150}
            onResizeStop={handleResizeStop}
            minConstraints={[100, 100]}
            maxConstraints={[1000, 1000]}
            handle={<span className="react-resizable-handle react-resizable-handle-se" />}
            disabled={!behaviors.resizable}
          >
            <div 
              className="note-container" 
              style={{ 
                width: note.size?.width || 250, 
                height: note.size?.height || 150,
                ...template.styles
              }}
            >
              {template.renderer(rendererProps)}
            </div>
          </Resizable>
        </div>
      </Draggable>
    );
  }
  
  // Default rendering if no custom renderer is provided
  return (
    <Draggable
      position={note.position || { x: 0, y: 0 }}
      onStop={handleDragStop}
      disabled={!behaviors.draggable}
      scale={canvasScale}
      handle=".note-header"
    >
      <div className={`note ${selected ? 'selected' : ''}`} onClick={() => onSelect(note.id)}>
        <Resizable
          width={note.size?.width || 250}
          height={note.size?.height || 150}
          onResizeStop={handleResizeStop}
          minConstraints={[100, 100]}
          maxConstraints={[1000, 1000]}
          handle={<span className="react-resizable-handle react-resizable-handle-se" />}
          disabled={!behaviors.resizable}
        >
          <div 
            className="note-container" 
            style={{ 
              width: note.size?.width || 250, 
              height: note.size?.height || 150,
              ...template.styles
            }}
          >
            <div className="note-header" style={template.styles?.header}>
              <div className="note-title">{template.name}</div>
              {behaviors.closable && (
                <button className="note-close-btn" onClick={() => onDelete(note.id)}>×</button>
              )}
            </div>
            <div className="note-content" style={template.styles?.content}>
              {behaviors.editable ? (
                <textarea 
                  value={note.content || ''}
                  onChange={(e) => handleContentChange(e.target.value)}
                  style={{ width: '100%', height: '100%', resize: 'none' }}
                />
              ) : (
                <div>{note.content || ''}</div>
              )}
            </div>
            {template.customControls && (
              <div className="note-controls">
                {Object.entries(template.customControls).map(([id, control]) => (
                  <button 
                    key={id} 
                    className="note-control-btn"
                    onClick={() => control.onClick(note, onUpdate)}
                  >
                    {control.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
}

export default CustomTemplateRenderer;
