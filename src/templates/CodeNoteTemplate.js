import React, { useState, useEffect, useCallback } from 'react';
import { createTemplate } from '../utils/templateHelper';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula, solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * Custom renderer for the Code Note template
 * Demonstrates how templates can completely control their own rendering
 */
function CodeNoteRenderer({ note, selected, onSelect, onUpdate, onDelete, onContentChange, behaviors, canvasScale }) {
  const [language, setLanguage] = useState(note.metadata?.language || 'javascript');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showHighlighting, setShowHighlighting] = useState(true);
  const [isMinimized, setIsMinimized] = useState(note.isMinimized || false);
  
  // Get theme from note properties
  const currentTheme = note.theme || 'dark';
  const isLocked = note.isLocked || false;
  
  // Determine note size with defaults
  const noteWidth = note.size?.width || 250;
  const noteHeight = isMinimized ? 40 : (note.size?.height || 150);
  
  // Handle content changes
  const handleContentChange = (e) => {
    if (isLocked) return;
    onContentChange(e.target.value);
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (isLocked) return;
    setIsEditing(!isEditing);
    setShowHighlighting(!showHighlighting);
  };
  
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    onUpdate({
      id: note.id,
      theme: newTheme
    });
  };
  
  // Toggle locked state
  const toggleLocked = () => {
    onUpdate({
      id: note.id,
      isLocked: !isLocked
    });
  };
  
  // Toggle minimized state
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
    onUpdate({
      id: note.id,
      isMinimized: !isMinimized
    });
  };
  
  // Dragging handlers
  const handleDragStart = () => {
    if (isLocked) return;
    setIsDragging(true);
  };
  
  const handleDragStop = (e, data) => {
    if (isLocked) return;
    setIsDragging(false);
    const newPosition = { x: data.x, y: data.y };
    onUpdate({ id: note.id, position: newPosition });
  };
  
  // Resizing handlers
  const handleResizeStart = () => {
    if (isLocked || isMinimized) return;
    setIsResizing(true);
  };
  
  const handleResizeStop = (e, { size }) => {
    if (isLocked || isMinimized) return;
    setIsResizing(false);
    
    // Apply code note-specific size limits
    const maxWidth = 600;
    const maxHeight = 600;
    const minWidth = 150;
    const minHeight = 100;
    
    // Constrain the size
    const constrainedSize = {
      width: Math.min(Math.max(size.width, minWidth), maxWidth),
      height: Math.min(Math.max(size.height, minHeight), maxHeight)
    };
    
    onUpdate({ id: note.id, size: constrainedSize });
  };
  
  // Handle language selection
  const handleLanguageChange = (e) => {
    if (isLocked) return;
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    // Update note metadata with the new language
    onUpdate({
      id: note.id,
      metadata: {
        ...note.metadata,
        language: newLanguage
      }
    });
  };
  
  // Handle running code (example of custom behavior)
  const handleRunCode = () => {
    // This is just a simple example of a custom action
    try {
      if (language === 'javascript') {
        // eslint-disable-next-line
        const result = new Function(note.content)();
        console.log('Code execution result:', result);
        alert(`Code executed successfully ${result ? ': ' + result : ''}`);
      } else {
        alert(`Running ${language} code is not implemented yet`);
      }
    } catch (err) {
      console.error('Error executing code:', err);
      alert(`Error executing code: ${err.message}`);
    }
  };
  
  // Handle export code
  const handleExport = () => {
    const element = document.createElement('a');
    const fileExtensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      html: 'html',
      css: 'css'
    };
    const extension = fileExtensions[language] || 'txt';
    const file = new Blob([note.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `code-snippet.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Handle duplicate
  const handleDuplicate = () => {
    // This should be implemented at the canvas level
    // but we can trigger a custom event or callback
    if (typeof behaviors.onDuplicate === 'function') {
      behaviors.onDuplicate(note);
    }
  };
  
  // Define theme-based styles
  const themeStyles = currentTheme === 'light' ? {
    container: {
      backgroundColor: '#ffffff',
      color: '#333333',
      border: '1px solid #dddddd',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    header: {
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #dddddd'
    },
    textarea: {
      backgroundColor: '#ffffff',
      color: '#333333'
    },
    footer: {
      backgroundColor: '#f5f5f5',
      borderTop: '1px solid #dddddd'
    },
    button: {
      backgroundColor: '#e0e0e0',
      color: '#333333',
      border: '1px solid #cccccc'
    },
    syntaxHighlighter: solarizedlight
  } : {
    container: {
      backgroundColor: '#2d2d2d',
      color: '#f8f8f2',
      border: '1px solid #555',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    },
    header: {
      backgroundColor: '#383838',
      borderBottom: '1px solid #555'
    },
    textarea: {
      backgroundColor: '#2d2d2d',
      color: '#f8f8f2'
    },
    footer: {
      backgroundColor: '#383838',
      borderTop: '1px solid #555'
    },
    button: {
      backgroundColor: '#44475a',
      color: '#f8f8f2',
      border: 'none'
    },
    syntaxHighlighter: dracula
  };
  
  // Custom styles for this note type
  const styles = {
    container: {
      ...themeStyles.container,
      fontFamily: 'monospace',
      borderRadius: '4px',
      width: noteWidth,
      height: noteHeight,
      transition: isResizing ? 'none' : 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      ...note.styles
    },
    header: {
      ...themeStyles.header,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px 10px',
      cursor: behaviors.draggable && !isLocked ? 'grab' : 'default',
      userSelect: 'none'
    },
    headerActive: {
      cursor: 'grabbing'
    },
    title: {
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    headerControls: {
      display: 'flex',
      gap: '6px'
    },
    content: {
      flex: isMinimized ? 0 : 1,
      overflow: 'auto',
      height: isMinimized ? 0 : 'calc(100% - 70px)',
      transition: 'height 0.2s ease'
    },
    textarea: {
      ...themeStyles.textarea,
      width: '100%',
      height: '100%',
      border: 'none',
      padding: '8px',
      outline: 'none',
      resize: 'none',
      fontFamily: 'monospace',
      fontSize: '13px'
    },
    syntaxHighlighter: {
      margin: '0 !important',
      padding: '8px !important'
    },
    footer: {
      ...themeStyles.footer,
      display: isMinimized ? 'none' : 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px 10px'
    },
    select: {
      backgroundColor: themeStyles.button.backgroundColor,
      color: themeStyles.button.color,
      border: themeStyles.button.border || '1px solid #555',
      borderRadius: '3px',
      padding: '2px 4px'
    },
    button: {
      ...themeStyles.button,
      borderRadius: '3px',
      padding: '3px 8px',
      cursor: 'pointer',
      margin: '0 2px',
      fontSize: '12px'
    },
    buttonIcon: {
      fontSize: '14px',
      margin: '0 2px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '4px'
    },
    lockIcon: {
      marginLeft: '4px',
      fontSize: '12px',
      color: isLocked ? '#ff9800' : 'inherit',
      opacity: isLocked ? 1 : 0.5
    },
    resizeHandle: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '10px',
      height: '10px',
      cursor: isLocked ? 'not-allowed' : 'se-resize',
      zIndex: 1
    }
  };

  // List of supported languages
  const supportedLanguages = [
    'javascript', 'python', 'java', 'html', 'css', 'typescript', 
    'jsx', 'bash', 'json', 'sql', 'php', 'c', 'cpp', 'csharp', 'go'
  ];
  
  return (
    <Draggable
      position={note.position}
      onStart={handleDragStart}
      onStop={handleDragStop}
      disabled={!behaviors.draggable || isLocked}
    >
      <Resizable
        width={noteWidth}
        height={noteHeight}
        onResizeStart={handleResizeStart}
        onResizeStop={handleResizeStop}
        resizeHandles={['se']}
        handle={<div className="resize-handle" style={styles.resizeHandle} />}
        disabled={!behaviors.resizable || isLocked || isMinimized}
      >
        <div 
          className="code-note-container" 
          style={styles.container}
          aria-label="Code note"
          role="region"
        >
          <div 
            className="note-header" 
            style={{
              ...styles.header,
              ...(isDragging ? styles.headerActive : {})
            }}
            onClick={() => onSelect(note.id)}
          >
            <div className="note-title" style={styles.title}>
              <span>Code Snippet</span>
              {isLocked && <span style={styles.lockIcon}>🔒</span>}
            </div>
            <div className="note-header-controls" style={styles.headerControls}>
              {behaviors.minimizable && (
                <button 
                  className="note-minimize-btn" 
                  onClick={toggleMinimized}
                  aria-label={isMinimized ? "Maximize note" : "Minimize note"}
                  style={{
                    ...styles.button,
                    padding: '0 6px'
                  }}
                >
                  {isMinimized ? '□' : '_'}
                </button>
              )}
              {behaviors.lockable && (
                <button 
                  className="note-lock-btn" 
                  onClick={toggleLocked}
                  aria-label={isLocked ? "Unlock note" : "Lock note"}
                  style={{
                    ...styles.button,
                    padding: '0 6px'
                  }}
                >
                  {isLocked ? '🔓' : '🔒'}
                </button>
              )}
              {behaviors.closable !== false && (
                <button 
                  className="note-close-btn" 
                  onClick={onDelete}
                  aria-label="Close note"
                  style={{
                    ...styles.button,
                    padding: '0 6px'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
          {!isMinimized && (
            <div className="note-content" style={styles.content}>
              {isEditing || !showHighlighting ? (
                <textarea
                  value={note.content}
                  onChange={handleContentChange}
                  style={styles.textarea}
                  disabled={isLocked}
                />
              ) : (
                <SyntaxHighlighter
                  language={language}
                  style={themeStyles.syntaxHighlighter}
                  customStyle={styles.syntaxHighlighter}
                  wrapLines={true}
                >
                  {note.content}
                </SyntaxHighlighter>
              )}
            </div>
          )}
          {!isMinimized && (
            <div className="note-footer" style={styles.footer}>
              <div style={styles.buttonGroup}>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  style={styles.select}
                  disabled={isLocked}
                >
                  {supportedLanguages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <button
                  onClick={toggleEditMode}
                  style={styles.button}
                  disabled={isLocked}
                >
                  {isEditing ? 'Preview' : 'Edit'}
                </button>
              </div>
              <div style={styles.buttonGroup}>
                {language === 'javascript' && (
                  <button
                    onClick={handleRunCode}
                    style={styles.button}
                    disabled={isLocked}
                  >
                    Run
                  </button>
                )}
                <button
                  onClick={handleExport}
                  style={styles.button}
                >
                  Export
                </button>
                <button
                  onClick={toggleTheme}
                  style={styles.button}
                >
                  {currentTheme === 'light' ? '🌙' : '☀️'}
                </button>
                {behaviors.duplicatable && (
                  <button
                    onClick={handleDuplicate}
                    style={styles.button}
                  >
                    Duplicate
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Resizable>
    </Draggable>
  );
}

/**
 * Code Note Template Definition
 * Provides a simple template for code snippets
 */
const CodeNoteTemplate = createTemplate({
  id: 'code-note',
  name: 'Code Snippet',
  description: 'A template for code snippets with syntax highlighting',
  defaultSize: { width: 350, height: 250 },
  defaultContent: '// Write your code here\nconsole.log("Hello, world!");',
  
  // Template styles (these get merged with note-specific styles)
  styles: {
    backgroundColor: '#2d2d2d',
    color: '#f8f8f2',
    border: '1px solid #555',
    borderRadius: '4px'
  },
  
  // Attach our custom renderer
  renderer: CodeNoteRenderer,
  
  // Define custom themes
  themes: {
    light: {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      borderColor: '#dddddd',
      headerColor: '#f5f5f5',
      accentColor: '#4a90e2'
    },
    dark: {
      backgroundColor: '#2d2d2d',
      textColor: '#f8f8f2',
      borderColor: '#555555',
      headerColor: '#383838',
      accentColor: '#6272a4'
    },
  },
  
  // Define custom animations
  animations: {
    create: {
      type: 'fade-in',
      duration: 300
    },
    delete: {
      type: 'fade-out',
      duration: 300
    }
  },
  
  // Define accessibility options
  accessibility: {
    ariaLabels: {
      close: 'Close code snippet',
      minimize: 'Minimize code snippet',
      maximize: 'Maximize code snippet',
      resize: 'Resize code snippet',
      run: 'Run code snippet',
      edit: 'Edit code snippet',
      preview: 'Preview code snippet'
    }
  },
  
  // Define template-specific behaviors
  behaviors: {
    draggable: true,
    resizable: true,
    editable: true,
    closable: true,
    minimizable: true,
    lockable: true,
    duplicatable: true,
    themeable: true,
    exportable: true,
    
    // Custom behaviors
    canRunCode: true
  },
  
  // Event handlers
  handlers: {
    // Drag handlers
    onDragEnd: (e, data, note) => {
      // Ensure the note stays within the visible area of the canvas
      // This is just example code - actual implementation would depend on canvas size
      return data; // Return position data as is for now
    },
    
    // Custom resize handler
    onResizeEnd: (e, { size }, note) => {
      // Code note-specific size limits
      const maxWidth = 800;
      const maxHeight = 800;
      const minWidth = 150;
      const minHeight = 100;
      
      // Apply constraints
      const constrainedSize = {
        width: Math.min(Math.max(size.width, minWidth), maxWidth),
        height: Math.min(Math.max(size.height, minHeight), maxHeight)
      };
      
      return constrainedSize;
    },
    
    // Export code handler
    onExport: (note, format = 'file') => {
      // This would be called by the canvas manager
      const language = note.metadata?.language || 'javascript';
      const fileExtensions = {
        javascript: 'js',
        python: 'py',
        java: 'java',
        html: 'html',
        css: 'css'
      };
      const extension = fileExtensions[language] || 'txt';
      
      return {
        content: note.content,
        fileName: `code-snippet.${extension}`,
        mimeType: 'text/plain'
      };
    }
  }
});

export default CodeNoteTemplate;
