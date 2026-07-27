import express from 'express';

const app = express();
const PORT = 5000;

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Minimal server running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('Minimal server running on http://localhost:' + PORT);
  console.log('Health check: http://localhost:' + PORT + '/health');
});
