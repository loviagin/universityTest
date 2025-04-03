// Импорт необходимых модулей
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

// Инициализация приложения
const app = express();
app.use(bodyParser.json());

// Определение маршрута для корневого пути, который отправляет index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const SECRET_KEY = 'KKOfijew9fh98fh9h8fj2w0dj2fj0r9wckds'; // Секрет для подписи JWT
const users = []; // Массив для хранения пользователей

// Middleware для проверки JWT токена
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Неверный токен' });
    }
    req.user = decoded;
    next();
  });
}

// Маршрут регистрации
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
  }
  users.push({ username, password });
  res.json({ message: 'Пользователь успешно зарегистрирован' });
});

// Маршрут входа
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Неверные учетные данные' });
  }
  // Генерация JWT токена
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Защищённый маршрут
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Доступ к защищенным данным получен', user: req.user });
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});