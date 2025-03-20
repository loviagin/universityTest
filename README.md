# To-Do List с Redux и Express

## Описание

Данное приложение представляет собой одностраничное приложение (SPA), реализованное на React с использованием Redux для управления состоянием. Оно позволяет выполнять операции CRUD (создание, чтение, обновление, удаление) для списка задач (to-do list), а также поддерживает переключение между тёмной и светлой темами. Для асинхронных действий используется middleware (redux-thunk), а состояние сохраняется в localStorage посредством redux-persist. Бекенд реализован на Node.js с Express и предоставляет API для работы со списком задач.

## Структура проекта

```
universitytest/
├── backend/                # Бекенд часть приложения (Express API)
│   ├── package.json
│   └── server.js           # Основной файл сервера
└── frontend/               # Фронтенд часть приложения (React + Redux)
    ├── package.json
    ├── public/
    └── src/
        ├── actions/        # Redux actions (itemActions.js, themeActions.js)
        ├── components/     # React-компоненты (TodoList, TodoItem, ThemeToggle)
        ├── reducers/       # Redux reducers (itemsReducer.js, themeReducer.js)
        ├── store/          # Конфигурация Redux store и redux-persist (store.js)
        ├── App.js          # Основной компонент приложения
        ├── App.css         # Стили приложения (поддержка темной/светлой темы)
        └── index.js        # Точка входа приложения
```

## Установка и запуск

### Требования
- Node.js
- npm

### Бекенд

1. Перейдите в папку `backend`:
   ```bash
   cd backend
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Запустите сервер:
   ```bash
   node server.js
   ```
   Сервер будет запущен на порту **5050**. API будет доступно по адресу: `http://localhost:5050/api/items`.

### Фронтенд

1. Перейдите в папку `frontend`:
   ```bash
   cd ..
   cd frontend
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Запустите приложение:
   ```bash
   npm start
   ```
   Приложение запустится на **localhost:3000**.

## API Спецификация

Бекенд предоставляет следующие REST API эндпоинты для работы со списком задач:

### Получение списка задач

- **Метод:** `GET`
- **URL:** `/api/items`
- **Описание:** Возвращает массив задач.
- **Пример ответа:**
  ```json
  [
    { "id": 1, "text": "Первая задача" },
    { "id": 2, "text": "Вторая задача" }
  ]
  ```

### Добавление новой задачи

- **Метод:** `POST`
- **URL:** `/api/items`
- **Описание:** Добавляет новую задачу.
- **Тело запроса (JSON):**
  ```json
  {
    "text": "Текст новой задачи"
  }
  ```
- **Пример ответа:**
  ```json
  {
    "id": 1627891234567,
    "text": "Текст новой задачи"
  }
  ```

### Обновление задачи

- **Метод:** `PUT`
- **URL:** `/api/items/:id`
- **Описание:** Обновляет задачу с указанным `id`.
- **Параметры URL:**  
  - `id` — идентификатор задачи.
- **Тело запроса (JSON):**
  ```json
  {
    "text": "Обновлённый текст задачи"
  }
  ```
- **Пример ответа:**
  ```json
  {
    "id": 1,
    "text": "Обновлённый текст задачи"
  }
  ```

### Удаление задачи

- **Метод:** `DELETE`
- **URL:** `/api/items/:id`
- **Описание:** Удаляет задачу с указанным `id`.
- **Параметры URL:**  
  - `id` — идентификатор задачи.
- **Пример ответа:**
  ```json
  { "success": true }
  ```

## Используемые технологии

- **Фронтенд:**  
  - React  
  - Redux  
  - Redux Thunk  
  - Redux Persist  
  - JavaScript (ES6+)  
  - CSS

- **Бекенд:**  
  - Node.js  
  - Express  
  - CORS, body-parser

---