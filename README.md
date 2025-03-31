# CanvasNote

A visual thinking tool with infinitely customizable notes. Canvas is an infinite, pan/zoom-enabled digital workspace where every note is a single, highly customizable component.

## Vision

CanvasNote reimagines what a note-taking application can be by treating notes not as static text entries but as versatile, interactive components in an infinite workspace. The core vision is to create a digital environment where ideas can be spatially organized, visually structured, and functionally enriched beyond traditional note-taking.

Unlike conventional note applications that constrain users to predefined formats, CanvasNote empowers users to define not just what their notes contain, but how they behave, appear, and interact with each other. The infinite canvas serves as a boundless digital mind map where every note can be a specialized tool tailored to specific tasks or thought processes.

## The Power of CanvasNote

What makes CanvasNote powerful:

1. **Complete Customization**: Notes aren't just containers for text; they can be specialized components with custom behaviors, appearances, and functionalities.

2. **Extensible Architecture**: The template system allows for unlimited expansion of note types, enabling users to create purpose-built tools for different tasks.

3. **Spatial Organization**: The infinite canvas enables spatial thinking and organization that mirrors how the human brain connects ideas.

4. **Component-Based Design**: Each note is isolated, ensuring stability while allowing for complex interactions between notes.

5. **Developer-Friendly**: Advanced users can create entirely new note types with custom code, enabling integration with external tools and services.

6. **Adaptable Workflow**: From simple text notes to complex interactive components, CanvasNote grows with your needs without forcing you to switch between different applications.

## Features

- Infinite canvas with pan and zoom capabilities
- Customizable notes using HTML and JavaScript
- Draggable and resizable notes
- Whiteboard/drawing capabilities
- Error isolation for note components
- Advanced template system for creating custom note types

## Template System

CanvasNote features a powerful template system that allows users to:
- Create entirely new types of notes with custom containers and appearances
- Design custom note behaviors and interactions
- Build specialized note types for different use cases (code snippets, task lists, etc.)
- Extend the functionality of notes beyond the default implementation

Available templates include:
- Base Template - Foundation for creating custom templates
- Task List Template - Specialized notes for tracking tasks
- Code Note Template - Syntax-highlighted code snippets

### Creating Custom Templates

Users can create their own custom templates in two ways:

#### 1. In-App Template Builder (For All Users)

CanvasNote provides an intuitive template builder that allows users to:
- Start from an existing template as a foundation
- Customize appearance through a visual editor
- Define basic behaviors and interactions through a configuration panel
- Save and share templates with other users

To create a template using the in-app builder:
1. Click on the "Templates" button in the main toolbar
2. Select "Create New Template"
3. Choose a base template to start from
4. Use the visual editor to customize appearance and behavior
5. Save your template with a name and description

#### 2. Custom Template Development (For Advanced Users)

For users comfortable with JavaScript and React, CanvasNote supports creating fully custom templates by extending the BaseTemplate class:

1. Create a new JavaScript file in the templates directory
2. Import and extend the BaseTemplate class
3. Define custom components, behaviors, and styles
4. Register the template with the template registry

Example of a basic custom template:

```javascript
import NoteTemplate from './BaseTemplate';
import React from 'react';

// Custom component for the template content
function CustomRenderer({ note, onContentChange }) {
  return (
    <div className="custom-content">
      <h3>Custom Template</h3>
      <div>{note.content}</div>
      <button onClick={() => console.log('Custom action!')}>
        Custom Action
      </button>
    </div>
  );
}

// Create the template
const CustomTemplate = createTemplate({
  id: 'custom-template',
  name: 'Custom Template',
  description: 'A template with custom functionality',
  defaultSize: { width: 300, height: 200 },
  defaultContent: '<p>This is a custom template</p>',
  component: CustomRenderer,
  behaviors: {
    draggable: true,
    resizable: true,
    canCreateNotes: true,
    // Other behaviors...
  }
});

export default CustomTemplate;
```

## Roadmap

CanvasNote is constantly evolving. Here's what we've completed and what's coming next:

### Core Platform
- [x] Infinite canvas implementation
- [x] Draggable and resizable notes
- [x] Note content customization
- [x] Whiteboard/drawing capabilities
- [x] Component-based architecture
- [x] Error isolation system
- [ ] Collaborative editing
- [ ] Offline support with sync
- [ ] Mobile responsive design

### Template System
- [x] Base template architecture
- [x] Custom template creation for developers
- [x] Code note template with syntax highlighting
- [x] Task list template
- [ ] In-app template builder UI
- [ ] Template sharing marketplace
- [ ] **AI-Powered Template Creation** - Generate custom templates using AI by describing your needs in natural language
- [ ] Template version control

### Data Management
- [x] Local storage saving
- [ ] Cloud synchronization
- [ ] Export/import system
- [ ] Revision history
- [ ] Automatic backups

### Advanced Features
- [ ] Spatial search and organization
- [ ] Advanced linking between notes
- [ ] Template-to-template communication
- [ ] Plugin system for third-party integrations
- [ ] AI-assisted content generation
- [ ] Voice commands and dictation
- [ ] Accessibility improvements

## Getting Started

### Prerequisites

- Node.js 14+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Technology Stack

- React for UI components and state management
- FabricJS for whiteboard capabilities
- react-draggable for note positioning
- react-resizable for note resizing
- Express.js backend for data persistence
