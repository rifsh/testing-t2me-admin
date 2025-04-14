// rootReducer.js
import { combineReducers } from "redux";
import theme from "./slices/themeSlice";
import theater from "./slices/theaterSlice";
import theaterCompany from "./slices/theaterCompanySlice";
import screen from "./slices/screenSlice";
import cast from "./slices/castSlice";
import movie from "./slices/movieSlice";
import auth from "./slices/authSlice";
import category from "./slices/categorySlice";
import adCategory from "./slices/adCategorySlice";
import advertisement from "./slices/advertisementSlice";
import users from "./slices/userSlice";
import locations from "./slices/locationSlice";
import event from "./slices/eventSlice";
import offers from "./slices/offerSlice";
import staticsReducer from "./slices/staticsSlice";
import coupons from "./slices/couponSlice";
import tickets from "./slices/ticketSlice";
import schedules from "./slices/scheduleSlice";
import modalSlice from "./slices/modalSlice";
import seat from "./slices/seatSlice";
import movieSeatSlice from "./slices/movieSeatSlice";
import organizerUpdates from "./slices/EventOrganizerSlice";
import tax from "./slices/taxSlice";
import faqs from "./slices/faqSlice";
import appinfo from "./slices/AppInfoSlice";
import footer from "./slices/footerSlice";
import leadEvents from "./slices/leadEventSlice";
import layout from "./slices/layoutSlice";
import issue from "./slices/IssueSlice";
import payment from "./slices/paymentSlice";
import  movieScheduleSlice  from "./slices/movieScheduleSlice";

const rootReducer = (asyncReducers = {}) => {
  return (state, action) => {
    const combinedReducer = combineReducers({
      theme,
      theater,
      theaterCompany,
      screen,
      cast,
      movie,
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
      layout,
      tax,
      issue,
      adCategory,
      advertisement,
      organizerUpdates,
      payment,
      faqs,
      seat,
      appinfo,
      footer,
      leadEvents,
      movieSeatSlice,
      movieScheduleSlice,
      ...asyncReducers,
    });

    return combinedReducer(state, action);
  };
};

export default rootReducer;
