const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;

const server = http.createServer((req, res) => {
  // Если запрошен корневой URL, отдаем index.html
  if (req.url === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Ошибка сервера</h1>');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    // Определяем путь к файлу
    const filePath = path.join(__dirname, req.url);
    // Определяем Content-Type
    let contentType = 'text/plain';
    if (req.url.endsWith('.css')) contentType = 'text/css';
    if (req.url.endsWith('.js')) contentType = 'text/javascript';
    if (req.url.endsWith('.html')) contentType = 'text/html';

    // Читаем файл
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Если файл не найден, отдаем 404 страницу
        fs.readFile(path.join(__dirname, '404.html'), (err404, data404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(data404 || '<h1>Страница не найдена (404)</h1>');
        });
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  }
});

server.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});