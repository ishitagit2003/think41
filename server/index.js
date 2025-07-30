// index.js (very basic Express server)
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());

// Root route (simple check)
app.get('/', (req, res) => {
  res.send('Server is up');
});

// Health route (handy for quick tests)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
