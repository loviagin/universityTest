// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store, persistor } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';

// Получаем элемент-контейнер
const container = document.getElementById('root');
const root = createRoot(container);

// Рендерим приложение
root.render(
  <Provider store={store}>
    <PersistGate loading={<div>Загрузка...</div>} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);