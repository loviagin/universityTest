const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Включаем парсинг JSON в теле запросов
app.use(express.json());

// Настройка сессий с соответствующими флагами для cookies
app.use(session({
    secret: 'jIHuhfw9f8wefjicnsdubcuisdihidw9ey8hu9ch', // замените на сложное значение
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax'
    }
}));

const users = {};


// Middleware для проверки наличия сессии (защищенный маршрут)
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        // Редирект на / при отсутствии сессии
        res.redirect('/');
    }
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/profile', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

// --- Роуты бэкенда ---

// POST /register – регистрация (логин + пароль)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Необходимо указать логин и пароль' });
    }
    if (users[username]) {
        return res.status(400).json({ message: 'Пользователь уже существует' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users[username] = { username, password: hashedPassword };
        res.status(201).json({ message: 'Пользователь зарегистрирован' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// POST /login – вход (создание сессии)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user) {
        return res.status(400).json({ message: 'Неверный логин или пароль' });
    }
    try {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: 'Неверный логин или пароль' });
        }
        // Создаем сессию
        req.session.user = { username };
        res.json({ message: 'Вход выполнен успешно' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// POST /logout – выход (удаление сессии)
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Не удалось выйти' });
        }
        res.json({ message: 'Вы вышли из системы' });
    });
});

// GET /data – данные с кэшированием (файловый кэш на 1 минуту)
const CACHE_FILE = path.join(__dirname, 'dataCache.json');
const CACHE_DURATION = 60 * 1000; // 1 минута в миллисекундах

app.get('/data', (req, res) => {
    fs.stat(CACHE_FILE, (err, stats) => {
        // Если файл существует и кэш не устарел
        if (!err && (Date.now() - stats.mtimeMs < CACHE_DURATION)) {
            fs.readFile(CACHE_FILE, 'utf8', (readErr, data) => {
                if (readErr) {
                    return res.status(500).json({ message: 'Ошибка чтения кэша' });
                }
                res.json({ data: JSON.parse(data), cached: true });
            });
        } else {
            // Генерируем новые данные
            const newData = {
                time: new Date().toISOString(),
                info: 'Новые данные сгенерированы сервером'
            };
            fs.writeFile(CACHE_FILE, JSON.stringify(newData), (writeErr) => {
                if (writeErr) console.error('Ошибка записи кэша:', writeErr);
                res.json({ data: newData, cached: false });
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на  http://localhost:${PORT}`);
});