import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import ContextMenu from './components/ContextMenu';
import TemplateManager, { TemplateContext } from './components/TemplateManager';
import NoteManager, { NotesContext } from './components/NoteManager';
import CanvasManager from './components/CanvasManager';
import TemplateBrowser from './components/TemplateBrowser';
import TemplateEditor from './components/TemplateEditor';
import { registerInitialTemplates } from './utils/templateHelper';
import './components/TemplateBrowser.css';

function App() {
  // State for toolbar visibility
  const [showToolbar, setShowToolbar] = useState(true);
  
  // Context menu state
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  
  // Template editor state
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  
  // Handle canvas click - close context menu
  const handleCanvasClick = () => {
    if (contextMenuPosition) {
      setContextMenuPosition(null);
    }
  };
  
  // Handle context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenuPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  return (
    <div className="app">
      {/* Use our new component structure */}
      <TemplateManager>
        <AppContent 
          showToolbar={showToolbar}
          setShowToolbar={setShowToolbar}
          contextMenuPosition={contextMenuPosition}
          setContextMenuPosition={setContextMenuPosition}
          handleCanvasClick={handleCanvasClick}
          handleContextMenu={handleContextMenu}
          isTemplateEditorOpen={isTemplateEditorOpen}
          setIsTemplateEditorOpen={setIsTemplateEditorOpen}
        />
      </TemplateManager>
      
      {/* Template editor modal */}
      {isTemplateEditorOpen && (
        <TemplateEditor 
          onClose={() => setIsTemplateEditorOpen(false)}
          onSave={(template) => {
            // Handle saving template
            setIsTemplateEditorOpen(false);
          }}
        />
      )}
    </div>
  );
}

// Separate component to handle template registration
function AppContent({ 
  showToolbar, 
  setShowToolbar, 
  contextMenuPosition, 
  setContextMenuPosition,
  handleCanvasClick,
  handleContextMenu,
  isTemplateEditorOpen,
  setIsTemplateEditorOpen
}) {
  const { registerTemplate } = useContext(TemplateContext);
  
  // Register initial templates
  useEffect(() => {
    registerInitialTemplates(registerTemplate);
  }, [registerTemplate]);
  
  return (
    <NoteManager>
      <NotesContext.Consumer>
        {({ 
          notes, 
          canvasComponents,
          addNote, 
          updateNote, 
          selectNote, 
          deleteNote, 
          selectedNoteId 
        }) => (
          <>
            {/* Template Browser */}
            <TemplateBrowser 
              onCreateTemplate={() => setIsTemplateEditorOpen(true)}
            />
            
            {/* Toolbar */}
            {showToolbar ? (
              <div className="toolbar">
                <button className="add-note-btn" onClick={() => addNote({ x: 100, y: 100 })}>
                  Add Note
                </button>
                <button className="create-template-btn" onClick={() => setIsTemplateEditorOpen(true)}>
                  Create Template
                </button>
                <button onClick={() => setShowToolbar(false)}>
                  Hide Toolbar
                </button>
              </div>
            ) : (
              <button className="show-toolbar-btn" onClick={() => setShowToolbar(true)}>
                Show Toolbar
              </button>
            )}
            
            {/* Canvas with Manager */}
            <div className="canvas-wrapper">
              <CanvasManager>
                {(canvasPosition, canvasScale) => (
                  <div
                    className="canvas-container"
                    onClick={handleCanvasClick}
                    onContextMenu={handleContextMenu}
                    onDragOver={(e) => {
                      // Allow dropping by preventing default
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      
                      // Get the template ID from the drop event
                      const templateId = e.dataTransfer.getData('template-id');
                      if (templateId) {
                        // Calculate position in canvas coordinates
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) - canvasPosition.x) / canvasScale;
                        const y = ((e.clientY - rect.top) - canvasPosition.y) / canvasScale;
                        
                        // Create a new note at the drop position with the template
                        addNote({ x, y }, templateId);
                      }
                    }}
                  >
                    <div className="canvas-background">
                      <div className="canvas">
                        <Canvas 
                          notes={notes}
                          canvasComponents={canvasComponents}
                          handleUpdateNote={updateNote}
                          handleSelectNote={selectNote}
                          handleDeleteNote={deleteNote}
                          selectedNoteId={selectedNoteId}
                          contextMenuPosition={contextMenuPosition}
                          setContextMenuPosition={setContextMenuPosition}
                          addNote={addNote}
                          canvasPosition={canvasPosition}
                          canvasScale={canvasScale}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CanvasManager>
            </div>
            
            {/* Context Menu */}
            {contextMenuPosition && (
              <ContextMenu
                position={contextMenuPosition}
                onAddNote={() => {
                  addNote(contextMenuPosition);
                  setContextMenuPosition(null);
                }}
                onClose={() => setContextMenuPosition(null)}
              />
            )}
          </>
        )}
      </NotesContext.Consumer>
    </NoteManager>
  );
}

export default App;
