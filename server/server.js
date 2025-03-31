const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'canvasData.json');

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../build')));

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ notes: [], templates: [] }));
}

// Helper function to read data
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { notes: [], templates: [] };
  }
};

// Helper function to write data
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
};

// API Routes
// Get all notes
app.get('/api/notes', (req, res) => {
  const data = readData();
  res.json(data.notes);
});

// Save notes
app.post('/api/notes', (req, res) => {
  const { notes } = req.body;
  
  if (!Array.isArray(notes)) {
    return res.status(400).json({ error: 'Invalid notes data' });
  }
  
  const data = readData();
  data.notes = notes;
  
  if (writeData(data)) {
    res.json({ success: true, message: 'Notes saved successfully' });
  } else {
    res.status(500).json({ error: 'Failed to save notes' });
  }
});

// Get user templates
app.get('/api/templates', (req, res) => {
  const data = readData();
  res.json(data.templates);
});

// Save user template
app.post('/api/templates', (req, res) => {
  const { template } = req.body;
  
  if (!template || !template.id || !template.name) {
    return res.status(400).json({ error: 'Invalid template data' });
  }
  
  const data = readData();
  
  // Update existing template or add new one
  const existingIndex = data.templates.findIndex(t => t.id === template.id);
  if (existingIndex >= 0) {
    data.templates[existingIndex] = template;
  } else {
    data.templates.push(template);
  }
  
  if (writeData(data)) {
    res.json({ success: true, message: 'Template saved successfully' });
  } else {
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// Delete user template
app.delete('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  
  const data = readData();
  data.templates = data.templates.filter(t => t.id !== id);
  
  if (writeData(data)) {
    res.json({ success: true, message: 'Template deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Serve React app for any other route in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
