// rootReducer.js
import { combineReducers } from "redux";
import theme from "./slices/themeSlice";
import auth from "./slices/authSlice";
import category from "./slices/categorySlice";
import adCategory from "./slices/adCategorySlice";
import users from "./slices/userSlice";
import locations from "./slices/locationSlice";
import event from "./slices/eventSlice";
import offers from "./slices/offerSlice";
import staticsReducer from './slices/staticsSlice';
import coupons from "./slices/couponSlice";
import tickets from "./slices/ticketSlice";
import schedules from "./slices/scheduleSlice";
import modalSlice from "./slices/modalSlice";
import tax from "./slices/taxSlice"; 
import issue from "./slices/IssueSlice"; 

const rootReducer = (asyncReducers = {}) => {
  return (state, action) => {
    const combinedReducer = combineReducers({
      theme,
      auth,
      category,
      users,
      locations,
      event,
      offers,
      statics: staticsReducer,
      coupons,
      tickets,
      schedules,
      modalSlice,     
      tax,  
      issue,    
      adCategory,
      ...asyncReducers, 
    });

    return combinedReducer(state, action);
  };
};

export default rootReducer;