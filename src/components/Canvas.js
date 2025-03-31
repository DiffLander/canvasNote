import React, { useContext } from 'react';
import CustomTemplateRenderer from './CustomTemplateRenderer';
import { TemplateContext } from './TemplateManager';

const Canvas = ({ 
  notes, 
  canvasComponents, 
  handleUpdateNote, 
  handleSelectNote, 
  handleDeleteNote, 
  selectedNoteId,
  contextMenuPosition,
  onContextMenu,
  setContextMenuPosition,
  addNote,
  canvasPosition,
  canvasScale
}) => {
  // Get templates from context
  const { templates } = useContext(TemplateContext);
  
  return (
    <>
      {/* Render all notes using CustomTemplateRenderer to delegate rendering to templates */}
      {notes.map((note) => (
        <CustomTemplateRenderer
          key={note.id}
          note={note}
          selected={note.id === selectedNoteId}
          onSelect={handleSelectNote}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
          canvasScale={canvasScale}
        />
      ))}

      {/* Render any canvas-level components */}
      {Object.keys(canvasComponents || {}).map((id) => (
        <div key={id} className="canvas-level-component">
          {canvasComponents[id]}
        </div>
      ))}

      {/* Render context menu if visible */}
      {contextMenuPosition && (
        <div 
          className="context-menu"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y
          }}
        >
          <div className="context-menu-item" onClick={() => {
            // Use default template
            const defaultTemplateId = templates && templates.length > 0 ? templates[0].id : null;
            if (defaultTemplateId) {
              // Calculate position in canvas coordinates
              const x = (contextMenuPosition.x - canvasPosition.x) / canvasScale;
              const y = (contextMenuPosition.y - canvasPosition.y) / canvasScale;
              addNote(defaultTemplateId, { x, y });
            }
            setContextMenuPosition(null);
          }}>
            Add Note
          </div>
          
          {templates && templates.length > 0 && (
            <>
              <div className="context-menu-divider"></div>
              <div className="context-menu-item">
                Add Specific Note
                <div className="template-submenu">
                  {templates.map(template => (
                    <div 
                      key={template.id} 
                      className="context-menu-item template-item"
                      onClick={() => {
                        // Calculate position in canvas coordinates
                        const x = (contextMenuPosition.x - canvasPosition.x) / canvasScale;
                        const y = (contextMenuPosition.y - canvasPosition.y) / canvasScale;
                        addNote(template.id, { x, y });
                        setContextMenuPosition(null);
                      }}
                    >
                      <span>{template.name}</span>
                      <span className="template-description">{template.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Show empty state message if no notes */}
      {notes.length === 0 && (
        <div className="empty-canvas-message">
          <h3>Your canvas is empty</h3>
          <p>Click the "Add Note" button or right-click anywhere to get started</p>
        </div>
      )}
    </>
  );
};

export default Canvas;
