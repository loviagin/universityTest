// frontend/src/reducers/index.js
import { combineReducers } from 'redux';
import itemsReducer from './itemsReducer';
import themeReducer from './themeReducer';

export default combineReducers({
  items: itemsReducer,
  theme: themeReducer,
});