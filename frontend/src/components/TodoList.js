// frontend/src/components/TodoList.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchItems, addItem, updateItem, deleteItem } from '../actions/itemActions';
import TodoItem from './TodoItem';

const TodoList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(state => state.items);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const handleAddItem = () => {
    if (newItemText.trim() !== '') {
      const newItem = { text: newItemText };
      dispatch(addItem(newItem));
      setNewItemText('');
    }
  };

  const handleUpdateItem = (updatedItem) => {
    dispatch(updateItem(updatedItem));
  };

  const handleDeleteItem = (id) => {
    dispatch(deleteItem(id));
  };

  return (
    <div>
      <h2>Список задач</h2>
      {loading && <p>Загрузка...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      <ul>
        {items.map(item => (
          <TodoItem
            key={item.id}
            item={item}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
          />
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Добавить новую задачу"
        />
        <button onClick={handleAddItem}>Добавить</button>
      </div>
    </div>
  );
};

export default TodoList;