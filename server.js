const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { schema, root } = require('./schema');
const http = require('http');
const ChatServer = require('./chat-server');

const app = express();
const adminApp = express();

// Создаем HTTP серверы
const mainServer = http.createServer(app);
const adminServer = http.createServer(adminApp);

const PORT_MAIN = 8080;
const PORT_ADMIN = 3000;
const DATA_FILE = path.join(__dirname, 'products.json');

// Инициализируем один общий чат-сервер на админском порту
const chatServer = new ChatServer(adminServer);

app.use(cors());
adminApp.use(cors());
app.use(express.json());
adminApp.use(express.json());

const getProducts = () => {
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const saveProducts = (products) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
};

app.use(express.static(path.join(__dirname, 'public')));
adminApp.use(express.static(path.join(__dirname, 'admin')));

// GraphQL endpoint для основного приложения
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true // Включаем GraphiQL интерфейс для тестирования
}));

// GraphQL endpoint для админки
adminApp.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

// REST endpoints (оставляем для обратной совместимости)
app.get('/products', (req, res) => {
    res.json(getProducts());
});

adminApp.get('/products', (req, res) => {
    res.json(getProducts());
});

adminApp.get('/products/:id', (req, res) => {
    const products = getProducts();
    const product = products.find(p => p.id == req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

adminApp.post('/products', (req, res) => {
    const products = getProducts();
    const newProduct = { id: Date.now(), ...req.body };
    products.push(newProduct);
    saveProducts(products);
    res.status(201).json(newProduct);
});

adminApp.put('/products/:id', (req, res) => {
    const products = getProducts();
    const productIndex = products.findIndex(p => p.id == req.params.id);
    if (productIndex !== -1) {
        products[productIndex] = { ...products[productIndex], ...req.body };
        saveProducts(products);
        res.json(products[productIndex]);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

adminApp.delete('/products/:id', (req, res) => {
    let products = getProducts();
    products = products.filter(p => p.id != req.params.id);
    saveProducts(products);
    res.json({ message: 'Product deleted' });
});

// Запускаем HTTP серверы
mainServer.listen(PORT_MAIN, () => console.log(`Каталог работает на http://localhost:${PORT_MAIN}`));
adminServer.listen(PORT_ADMIN, () => console.log(`Админка работает на http://localhost:${PORT_ADMIN}`));