# CanvasNote Installation Guide

Follow these steps to get CanvasNote up and running on your local machine:

## Prerequisites

- Node.js (version 14.0.0 or higher)
- npm (usually comes with Node.js)

## Installation Steps

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Using the Application

1. Click "Add Text Note" or use the dropdown to select other note types
2. Drag notes around the canvas by their header
3. Resize notes using the handle in the bottom-right corner
4. Pan around the canvas by holding Alt + dragging (or using the middle mouse button)
5. Zoom in/out using your mouse wheel

## Data Persistence

- Notes are automatically saved to your browser's localStorage
- For more robust storage, you can run the Express.js server:
```bash
npm run server
```

- Then update your React app to use the API endpoints for data storage.

Enjoy using CanvasNote for your visual thinking needs!
