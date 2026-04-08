require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'], // Common dev servers
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); // Serve frontend static from backend

// Data directory
const DATA_DIR = path.join(__dirname, 'data');

// GET /api/destinations - List all destinations
app.get('/api/destinations', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'destinations.json'), 'utf8');
    const destinations = JSON.parse(data);
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load destinations' });
  }
});

// GET /api/destinations/:id - Single destination
app.get('/api/destinations/:id', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'destinations.json'), 'utf8');
    const destinations = JSON.parse(data);
    const destination = destinations.find(d => d.id === req.params.id);
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    res.json(destination);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load destination' });
  }
});

// GET /api/packages - List packages
app.get('/api/packages', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'packages.json'), 'utf8');
    const packages = JSON.parse(data);
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load packages' });
  }
});

// POST /api/contact - Handle contact form
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, destination, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

// Save contact to JSON file
  const contactsFile = path.join(DATA_DIR, 'contacts.json');
  let contacts = [];
  try {
    const data = await fs.readFile(contactsFile, 'utf8');
    contacts = JSON.parse(data);
  } catch (err) {
    // File doesn't exist or empty
  }
  
  const contactLog = {
    timestamp: new Date().toISOString(),
    name,
    email,
    phone,
    destination,
    message
  };
  
  contacts.push(contactLog);
  await fs.writeFile(contactsFile, JSON.stringify(contacts, null, 2));
  
  console.log('New contact saved:', contactLog);

  res.json({ 
    success: true, 
    message: 'Thank you! Your message has been saved. We will contact you within 24 hours.' 
  });

});

// POST /api/newsletter - Handle newsletter signup
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email required' });
  }

  const newsletterLog = {
    timestamp: new Date().toISOString(),
    email
  };
  
  console.log('New newsletter signup:', newsletterLog);
  
  // Optional: Save to file
  // Similar to contacts...
  
  res.json({ 
    success: true, 
    message: 'Thank you for subscribing to our newsletter!' 
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Indian Travel Backend running on http://localhost:${PORT}`);
  console.log(`📋 APIs: /api/destinations, /api/packages, /api/contact (POST), /api/newsletter (POST)`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
});

