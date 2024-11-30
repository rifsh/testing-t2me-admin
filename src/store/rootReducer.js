import { combineReducers } from 'redux';
import theme from './slices/themeSlice';
import auth from './slices/authSlice';
import category from './slices/categorySlice';
import users from './slices/userSlice';
import location from './slices/locationSlice';

const rootReducer = (asyncReducers) => (state, action) => {
        const combinedReducer = combineReducers({
                theme,
                auth,
                category,
                users,
                location,
                ...asyncReducers,
        })
        return combinedReducer(state, action)
}

export default rootReducer
