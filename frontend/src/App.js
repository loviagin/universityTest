// frontend/src/App.js
import React from 'react';
import TodoList from './components/TodoList';
import ThemeToggle from './components/ThemeToggle';
import { useSelector } from 'react-redux';
import './App.css';

function App() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <header>
        <h1>Todo List с Redux</h1>
        <ThemeToggle />
      </header>
      <main>
        <TodoList />
      </main>
    </div>
  );
}

export default App;