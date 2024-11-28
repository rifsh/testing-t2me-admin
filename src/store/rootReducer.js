import { combineReducers } from 'redux'
import theme from './slices/themeSlice'
import auth from './slices/authSlice'
import category from './slices/categorySlice';

const rootReducer = (asyncReducers) => (state, action) => {
    const combinedReducer = combineReducers({
        theme,
        auth,
        category,
        ...asyncReducers,
    })
    return combinedReducer(state, action)
}
  
export default rootReducer
