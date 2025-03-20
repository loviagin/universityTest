// frontend/src/reducers/itemsReducer.js
const initialState = {
    items: [],
    loading: false,
    error: null,
  };
  
  const itemsReducer = (state = initialState, action) => {
    switch(action.type) {
      case 'FETCH_ITEMS_REQUEST':
        return { ...state, loading: true, error: null };
      case 'FETCH_ITEMS_SUCCESS':
        return { ...state, loading: false, items: action.payload };
      case 'FETCH_ITEMS_FAILURE':
        return { ...state, loading: false, error: action.payload };
      case 'ADD_ITEM':
        return { ...state, items: [...state.items, action.payload] };
      case 'UPDATE_ITEM':
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id ? action.payload : item
          ),
        };
      case 'DELETE_ITEM':
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload),
        };
      default:
        return state;
    }
  };
  
  export default itemsReducer;