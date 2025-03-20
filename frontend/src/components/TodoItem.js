// frontend/src/components/TodoItem.js
import React, { useState } from 'react';

const TodoItem = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(item.text);

  const handleUpdate = () => {
    onUpdate({ ...item, text: editedText });
    setIsEditing(false);
  };

  return (
    <li>
      {isEditing ? (
        <>
          <input 
            type="text" 
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />
          <button onClick={handleUpdate}>Сохранить</button>
          <button onClick={() => setIsEditing(false)}>Отмена</button>
        </>
      ) : (
        <>
          <span>{item.text}</span>
          <button onClick={() => setIsEditing(true)}>Редактировать</button>
          <button onClick={() => onDelete(item.id)}>Удалить</button>
        </>
      )}
    </li>
  );
};

export default TodoItem;