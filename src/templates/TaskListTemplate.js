import React, { useState, useEffect } from 'react';
import { createTemplate } from '../utils/templateHelper';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

/**
 * Custom renderer for the Task List template
 * Demonstrates how templates can control their own rendering
 */
function TaskListRenderer({ note, selected, onSelect, onUpdate, onDelete, onContentChange, behaviors, canvasScale }) {
  // State for tracking tasks
  const [content, setContent] = useState(note.content || '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(note.isMinimized || false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  
  // Get theme from note properties
  const currentTheme = note.theme || 'light';
  const isLocked = note.isLocked || false;
  
  // Determine note size with defaults
  const noteWidth = note.size?.width || 250;
  const noteHeight = isMinimized ? 40 : (note.size?.height || 150);

  // Handle manual content edits
  const handleContentChange = (e) => {
    if (isLocked) return;
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange(newContent);
  };

  // Parse content to count completed vs total tasks
  useEffect(() => {
    const lines = content.split('\n');
    let completed = 0;
    let total = 0;
    
    lines.forEach(line => {
      // Check for task format: "- [ ]" or "- [x]"
      if (line.trim().match(/^-\s*\[[ x]\]/i)) {
        total++;
        if (line.trim().match(/^-\s*\[[xX]\]/)) {
          completed++;
        }
      }
    });
    
    setCompletedTasks(completed);
    setTotalTasks(total);
  }, [content]);

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
  
  // Toggle task completion
  const toggleTaskCompletion = (lineIndex) => {
    if (isLocked) return;
    
    const lines = content.split('\n');
    if (lineIndex < 0 || lineIndex >= lines.length) return;
    
    const line = lines[lineIndex];
    // Check if this is a task line
    if (line.trim().match(/^-\s*\[[ x]\]/i)) {
      // Toggle between unchecked and checked
      if (line.trim().match(/^-\s*\[[xX]\]/)) {
        lines[lineIndex] = line.replace(/^(-\s*\[)[xX](\])/, '$1 $2');
      } else {
        lines[lineIndex] = line.replace(/^(-\s*\[)[ ](\])/, '$1x$2');
      }
      
      const newContent = lines.join('\n');
      setContent(newContent);
      onContentChange(newContent);
    }
  };
  
  // Handle adding a new task
  const addNewTask = () => {
    if (isLocked) return;
    const newContent = content + '\n- [ ] New task';
    setContent(newContent);
    onContentChange(newContent);
  };
  
  // Handle clearing completed tasks
  const clearCompletedTasks = () => {
    if (isLocked) return;
    
    const lines = content.split('\n');
    const updatedLines = lines.filter(line => !line.trim().match(/^-\s*\[[xX]\]/));
    
    const newContent = updatedLines.join('\n');
    setContent(newContent);
    onContentChange(newContent);
  };
  
  // Handle exporting tasks
  const handleExport = () => {
    const element = document.createElement('a');
    let exportContent = `# Task List\n\n`;
    
    // Format the content for export
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.trim().match(/^-\s*\[[ ]\]/i)) {
        exportContent += `☐ ${line.replace(/^-\s*\[[ ]\]\s*/, '')}\n`;
      } else if (line.trim().match(/^-\s*\[[xX]\]/i)) {
        exportContent += `✓ ${line.replace(/^-\s*\[[xX]\]\s*/, '')}\n`;
      } else {
        exportContent += `${line}\n`;
      }
    });
    
    const file = new Blob([exportContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `task-list.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Handle duplicate
  const handleDuplicate = () => {
    if (typeof behaviors.onDuplicate === 'function') {
      behaviors.onDuplicate(note);
    }
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
    
    // Apply task list-specific size limits
    const maxWidth = 400;
    const maxHeight = 500;
    const minWidth = 150;
    const minHeight = 100;
    
    // Constrain the size
    const constrainedSize = {
      width: Math.min(Math.max(size.width, minWidth), maxWidth),
      height: Math.min(Math.max(size.height, minHeight), maxHeight)
    };
    
    onUpdate({ id: note.id, size: constrainedSize });
  };

  // Define theme-based styles
  const themeStyles = currentTheme === 'light' ? {
    container: {
      backgroundColor: '#f9f7e8',
      color: '#555',
      border: '1px solid #e6e2c9',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    header: {
      backgroundColor: '#f3f0d7',
      borderBottom: '1px solid #e6e2c9'
    },
    textarea: {
      backgroundColor: '#f9f7e8',
      color: '#555'
    },
    footer: {
      backgroundColor: '#f3f0d7',
      borderTop: '1px solid #e6e2c9'
    },
    button: {
      backgroundColor: '#e6e2c9',
      color: '#555',
      border: '1px solid #d8d4b8'
    },
    progressBar: {
      backgroundColor: '#e6e2c9',
      fill: '#a1c181'
    }
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
    progressBar: {
      backgroundColor: '#44475a',
      fill: '#6272a4'
    }
  };
  
  // Custom styles for this note type
  const styles = {
    container: {
      ...themeStyles.container,
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
      transition: 'height 0.2s ease',
      padding: '8px'
    },
    textarea: {
      ...themeStyles.textarea,
      width: '100%',
      height: '100%',
      border: 'none',
      outline: 'none',
      resize: 'none',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    footer: {
      ...themeStyles.footer,
      display: isMinimized ? 'none' : 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px 10px'
    },
    button: {
      ...themeStyles.button,
      borderRadius: '3px',
      padding: '3px 8px',
      cursor: 'pointer',
      margin: '0 2px',
      fontSize: '12px'
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
    progressContainer: {
      width: '100%',
      height: '4px',
      backgroundColor: themeStyles.progressBar.backgroundColor,
      marginTop: '4px',
      borderRadius: '2px',
      overflow: 'hidden'
    },
    progressBar: {
      height: '100%',
      backgroundColor: themeStyles.progressBar.fill,
      width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%',
      transition: 'width 0.3s ease'
    },
    progressText: {
      fontSize: '11px',
      opacity: 0.7,
      marginTop: '2px',
      textAlign: 'center'
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
          className="task-list-note" 
          style={styles.container}
          aria-label="Task list note"
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
              <span>Task List</span>
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
            <>
              <div className="task-progress">
                <div style={styles.progressContainer}>
                  <div style={styles.progressBar}></div>
                </div>
                <div style={styles.progressText}>
                  {completedTasks} of {totalTasks} tasks completed
                </div>
              </div>
              <div className="note-content" style={styles.content}>
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  style={styles.textarea}
                  disabled={isLocked}
                  placeholder="- [ ] Add your tasks here"
                />
              </div>
              <div className="note-footer" style={styles.footer}>
                <div style={styles.buttonGroup}>
                  <button
                    onClick={addNewTask}
                    style={styles.button}
                    disabled={isLocked}
                    aria-label="Add new task"
                  >
                    + Task
                  </button>
                  <button
                    onClick={clearCompletedTasks}
                    style={styles.button}
                    disabled={isLocked || completedTasks === 0}
                    aria-label="Clear completed tasks"
                  >
                    Clear Done
                  </button>
                </div>
                <div style={styles.buttonGroup}>
                  <button
                    onClick={handleExport}
                    style={styles.button}
                    aria-label="Export tasks"
                  >
                    Export
                  </button>
                  <button
                    onClick={toggleTheme}
                    style={styles.button}
                    aria-label={currentTheme === 'light' ? "Switch to dark theme" : "Switch to light theme"}
                  >
                    {currentTheme === 'light' ? '🌙' : '☀️'}
                  </button>
                  {behaviors.duplicatable && (
                    <button
                      onClick={handleDuplicate}
                      style={styles.button}
                      aria-label="Duplicate this note"
                    >
                      Duplicate
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Resizable>
    </Draggable>
  );
}

/**
 * Task List Template Definition
 * Provides a template for simple task lists
 */
const TaskListTemplate = createTemplate({
  id: 'task-list',
  name: 'Task List',
  description: 'A simple task list for tracking to-dos',
  defaultSize: { width: 280, height: 220 },
  defaultContent: '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3',
  
  // Template styles (these get merged with note-specific styles)
  styles: {
    backgroundColor: '#f9f7e8',
    color: '#555',
    border: '1px solid #e6e2c9',
    borderRadius: '4px'
  },
  
  // Attach our custom renderer
  renderer: TaskListRenderer,
  
  // Define custom themes
  themes: {
    light: {
      backgroundColor: '#f9f7e8',
      textColor: '#555',
      borderColor: '#e6e2c9',
      headerColor: '#f3f0d7',
      accentColor: '#a1c181'
    },
    dark: {
      backgroundColor: '#2d2d2d',
      textColor: '#f8f8f2',
      borderColor: '#555555',
      headerColor: '#383838',
      accentColor: '#6272a4'
    }
  },
  
  // Define custom animations
  animations: {
    create: {
      type: 'slide-in',
      duration: 300
    },
    delete: {
      type: 'fade-out',
      duration: 300
    },
    taskComplete: {
      type: 'pulse',
      duration: 200
    }
  },
  
  // Define accessibility options
  accessibility: {
    ariaLabels: {
      close: 'Close task list',
      minimize: 'Minimize task list',
      maximize: 'Maximize task list',
      resize: 'Resize task list',
      addTask: 'Add new task',
      clearCompleted: 'Clear completed tasks',
      exportTasks: 'Export tasks'
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
    taskCheckboxes: true
  },
  
  // Event handlers
  handlers: {
    // Drag handlers
    onDragEnd: (e, data, note) => {
      // Ensure the note stays within the visible area of the canvas
      return data; // Return position data as is for now
    },
    
    // Custom resize handler
    onResizeEnd: (e, { size }, note) => {
      // Task list-specific size limits
      const maxWidth = 500;
      const maxHeight = 600;
      const minWidth = 150;
      const minHeight = 100;
      
      // Apply constraints
      const constrainedSize = {
        width: Math.min(Math.max(size.width, minWidth), maxWidth),
        height: Math.min(Math.max(size.height, minHeight), maxHeight)
      };
      
      return constrainedSize;
    },
    
    // Handle a task being checked/unchecked
    onTaskToggle: (note, taskIndex, isCompleted) => {
      // This would be implemented by the canvas manager
      // to allow for potential animation or sound effects
      return {
        animate: true,
        animationType: isCompleted ? 'complete' : 'incomplete'
      };
    }
  }
});

export default TaskListTemplate;
