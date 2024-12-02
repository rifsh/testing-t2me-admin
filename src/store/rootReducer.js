import { combineReducers } from "redux";
import theme from "./slices/themeSlice";
import auth from "./slices/authSlice";
import category from "./slices/categorySlice";
import users from "./slices/userSlice";
import locations from "./slices/locationSlice";
import event from "./slices/eventSlice";

const rootReducer = (asyncReducers = {}) => {
  return (state, action) => {
    const combinedReducer = combineReducers({
      theme,
      auth,
      category,
      users,
      locations,
      event,
      ...asyncReducers, 
    });

    return combinedReducer(state, action);
  };
};

export default rootReducer;
