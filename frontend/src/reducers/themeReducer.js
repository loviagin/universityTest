// frontend/src/reducers/themeReducer.js
const initialState = {
    darkMode: false,
  };
  
  const themeReducer = (state = initialState, action) => {
    switch(action.type) {
      case 'TOGGLE_THEME':
        return { darkMode: !state.darkMode };
      default:
        return state;
    }
  };
  
  export default themeReducer;