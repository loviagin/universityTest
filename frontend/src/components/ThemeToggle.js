// frontend/src/components/ThemeToggle.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../actions/themeActions';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div>
      <button onClick={() => dispatch(toggleTheme())}>
        Переключить тему: {darkMode ? 'Тёмная' : 'Светлая'}
      </button>
    </div>
  );
};

export default ThemeToggle;