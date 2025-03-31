import React, { useState, useCallback, createContext, useContext, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TemplateContext } from './TemplateManager';

// Create context for notes
export const NotesContext = createContext(null);

/**
 * NoteManager - Handles note state and operations
 * Centralizes note functionality and provides context for notes
 */
function NoteManager({ children, initialNotes = [] }) {
  // Access template context
  const { templates, getTemplate } = useContext(TemplateContext);
  
  // State for notes and selection
  const [notes, setNotes] = useState([]);  
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  
  // State for canvas components
  const [canvasComponents, setCanvasComponents] = useState({});
  
  // Flag to track if initial load has happened
  const initialLoadDone = useRef(false);
  
  // Load saved notes on mount - only once
  useEffect(() => {
    if (!initialLoadDone.current) {
      try {
        const savedNotes = localStorage.getItem('canvasNotes');
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        } else if (initialNotes.length > 0) {
          setNotes(initialNotes);
        }
        initialLoadDone.current = true;
      } catch (err) {
        console.error('Error loading notes:', err);
        // If there's an error loading, fall back to initialNotes
        if (initialNotes.length > 0) {
          setNotes(initialNotes);
        }
        initialLoadDone.current = true;
      }
    }
  }, [initialNotes]);
  
  // Save notes whenever they change - but only after initial load
  const notesRef = useRef(notes);
  
  useEffect(() => {
    // Update the ref
    notesRef.current = notes;
    
    // Only save if initial load is complete and we actually have notes
    if (initialLoadDone.current && notes.length > 0) {
      try {
        localStorage.setItem('canvasNotes', JSON.stringify(notes));
      } catch (err) {
        console.error('Error saving notes:', err);
      }
    }
  }, [notes]);
  
  // Select a note
  const selectNote = useCallback((noteId) => {
    setSelectedNoteId(noteId);
  }, []);
  
  // Add a new note
  const addNote = useCallback((position, templateId) => {
    // Find the template to use
    let template = templates.find(t => t.id === templateId);
    
    // If no template specified or not found, use the first available
    if (!template && templates.length > 0) {
      console.warn(`Template ${templateId} not found. Falling back to first available template`);
      template = templates[0];
    }
    
    // If no templates are available, show an error and return
    if (!template) {
      console.error("No templates available to create a note");
      return null;
    }
    
    console.log("Creating note with template:", template);
    
    // Generate a unique ID for the note
    const noteId = `note-${uuidv4()}`;
    
    // Create a new note with standardized size regardless of template
    const newNote = {
      id: noteId,
      templateId: template.id,
      position,
      size: { width: 250, height: 150 }, 
      content: template.defaultContent || '',
      zIndex: notes.length + 1,
      // Add any additional properties from the template
      behaviors: template.behaviors ? { ...template.behaviors } : {},
      customControls: template.customControls ? { ...template.customControls } : {}
    };
    
    console.log("Creating new note:", newNote);
    
    // Add the note to the list
    setNotes(prevNotes => {
      return [...prevNotes, newNote];
    });
    
    return noteId;
  }, [notes, templates]);
  
  // Update a note
  const updateNote = useCallback((noteUpdate) => {
    if (!noteUpdate || !noteUpdate.id) {
      console.error("Cannot update note: Invalid update or missing ID");
      return;
    }
    
    setNotes(prevNotes => {
      return prevNotes.map(note => {
        if (note.id === noteUpdate.id) {
          // Merge the update with the existing note
          return { ...note, ...noteUpdate };
        }
        return note;
      });
    });
  }, []);
  
  // Delete a note
  const deleteNote = useCallback((noteId) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    
    // Deselect if the deleted note was selected
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  }, [selectedNoteId]);
  
  // Register a canvas component
  const registerCanvasComponent = useCallback((id, component) => {
    setCanvasComponents(prev => {
      // Only update if the component has changed
      if (prev[id] === component) return prev;
      return { ...prev, [id]: component };
    });
  }, []);
  
  // Unregister a canvas component
  const unregisterCanvasComponent = useCallback((id) => {
    setCanvasComponents(prev => {
      const newComponents = { ...prev };
      delete newComponents[id];
      return newComponents;
    });
  }, []);
  
  // Notes context value with methods and state
  const notesContextValue = {
    notes,
    setNotes,
    selectedNoteId,
    selectNote,
    addNote,
    updateNote,
    deleteNote,
    canvasComponents,
    setCanvasComponents,
    registerCanvasComponent,
    unregisterCanvasComponent
  };
  
  return (
    <NotesContext.Provider value={notesContextValue}>
      {children}
    </NotesContext.Provider>
  );
}

export default NoteManager;
