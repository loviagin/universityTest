// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5050;

app.use(cors());
app.use(bodyParser.json());

// Простой in-memory store для задач
let items = [
  { id: 1, text: 'Первая задача' },
  { id: 2, text: 'Вторая задача' },
];

// Получить все задачи
app.get('/api/items', (req, res) => {
  res.json(items);
});

// Добавить новую задачу
app.post('/api/items', (req, res) => {
  const newItem = { id: Date.now(), text: req.body.text };
  items.push(newItem);
  res.json(newItem);
});

// Обновить задачу
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const index = items.findIndex(item => item.id == id);
  if (index !== -1) {
    items[index].text = req.body.text;
    res.json(items[index]);
  } else {
    res.status(404).json({ error: 'Задача не найдена' });
  }
});

// Удалить задачу
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  items = items.filter(item => item.id != id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту http://localhost:${PORT}`);
});