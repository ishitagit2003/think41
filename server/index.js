const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running. Try GET /api/health or /api/items');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

let items = [{ id: 1, title: 'Sample item' }];

app.get('/api/items', (req, res) => {
  res.json(items);
});

app.post('/api/items', (req, res) => {
  const { title } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const next = { id: items.length ? items[items.length - 1].id + 1 : 1, title };
  items.push(next);
  res.status(201).json(next);
});

app.put('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title } = req.body || {};
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  items[idx].title = title ?? items[idx].title;
  res.json(items[idx]);
});

app.delete('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const before = items.length;
  items = items.filter(i => i.id !== id);
  if (items.length === before) return res.status(404).json({ error: 'not found' });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
