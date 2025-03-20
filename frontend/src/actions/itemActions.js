// frontend/src/actions/itemActions.js

// Асинхронное получение задач с бекенда
export const fetchItems = () => {
    return async dispatch => {
      dispatch({ type: 'FETCH_ITEMS_REQUEST' });
      try {
        const response = await fetch('http://localhost:5050/api/items');
        const data = await response.json();
        dispatch({ type: 'FETCH_ITEMS_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_ITEMS_FAILURE', payload: error.message });
      }
    };
  };
  
  export const addItem = (item) => {
    return async dispatch => {
      try {
        const response = await fetch('http://localhost:5050/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: item.text })
        });
        const newItem = await response.json();
        dispatch({ type: 'ADD_ITEM', payload: newItem });
      } catch (error) {
        console.error(error);
      }
    };
  };
  
  export const updateItem = (item) => {
    return async dispatch => {
      try {
        const response = await fetch(`http://localhost:5050/api/items/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: item.text })
        });
        const updatedItem = await response.json();
        dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });
      } catch (error) {
        console.error(error);
      }
    };
  };
  
  export const deleteItem = (id) => {
    return async dispatch => {
      try {
        await fetch(`http://localhost:5050/api/items/${id}`, {
          method: 'DELETE'
        });
        dispatch({ type: 'DELETE_ITEM', payload: id });
      } catch (error) {
        console.error(error);
      }
    };
  };