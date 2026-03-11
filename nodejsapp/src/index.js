const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => res.status(200).send('OK'));

// Status endpoint
app.get('/status', (req, res) => res.status(200).json({ status: 'App is running' }));

// Process endpoint
app.post('/process', (req, res) => {
  console.log('Processing request:', req.body);
  res.status(200).json({ message: 'Processed successfully' });
});

// Start server only when run directly (not during tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;