import dayjs from "dayjs";
import { createSlice } from "@reduxjs/toolkit";

const movieScheduleSlice = createSlice({
  name: "movieSchedule",
  initialState: {
    scheduledMovies: {}, // Object with tab/weekday keys
    dateRange: [
      dayjs().format("YYYY-MM-DD"),
      dayjs().add(6, "day").format("YYYY-MM-DD"),
    ],
    selectedDate: dayjs().format("YYYY-MM-DD"),
    selectedMovieId: null,
    isDetailsOpen: false,
    seatStructure: null,
    coupons: {},
    activeTab: 0, // Default to today (Sunday is 0, Saturday is 6)
  },
  reducers: {
    // Switch between days
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },

    // Handle scheduling movies - accept the entire updated scheduledMovies object
    scheduleMovie: (state, action) => {
      state.scheduledMovies = action.payload;
    },

    // Legacy reducer for scheduling a single movie
    scheduleMovieSingle: (state, action) => {
      const { date, movieData } = action.payload;

      // Initialize the date if it doesn't exist
      if (!state.scheduledMovies[date]) {
        state.scheduledMovies[date] = [];
      }

      // Check for conflicts
      const conflicts = state.scheduledMovies[date].some((movie) => {
        if (movie.screen !== movieData.screen) return false;

        // Check if the new movie overlaps with an existing one
        return (
          movieData.startMinutes < movie.endMinutes &&
          movieData.endMinutes > movie.startMinutes
        );
      });

      if (!conflicts) {
        state.scheduledMovies[date].push(movieData);
      }
    },

    // Update scheduled movie reducer
    updateScheduledMovie: (state, action) => {
      const { date, updatedMovie } = action.payload;

      if (state.scheduledMovies[date]) {
        state.scheduledMovies[date] = state.scheduledMovies[date].map((movie) =>
          movie.id === updatedMovie.id ? updatedMovie : movie
        );
      }
    },

    // Remove scheduled movie reducer
    removeScheduledMovie: (state, action) => {
      const { date, movieId } = action.payload;

      if (state.scheduledMovies[date]) {
        state.scheduledMovies[date] = state.scheduledMovies[date].filter(
          (movie) => movie.id !== movieId
        );
      }
    },

    // Set selected movie (for detail view)
    setSelectedMovie: (state, action) => {
      state.selectedMovieId = action.payload;
    },

    // Toggle detail drawer/modal
    toggleDetailsOpen: (state, action) => {
      state.isDetailsOpen =
        action.payload !== undefined ? action.payload : !state.isDetailsOpen;
    },

    // Update seat structure
    updateSeatStructure: (state, action) => {
      state.seatStructure = action.payload;
    },

    // Set coupon for a scheduled movie
    setCoupon: (state, action) => {
      const { movieId, couponCode } = action.payload;
      state.coupons[movieId] = couponCode;
    },

    setDateRange: (state, action) => {
      state.dateRange = action.payload;

      // If the current selectedDate is not within the new dateRange, update it
      if (state.selectedDate) {
        const selectedDateObj = dayjs(state.selectedDate);
        const startDate = dayjs(action.payload[0]);
        const endDate = dayjs(action.payload[1]);

        if (
          selectedDateObj.isBefore(startDate) ||
          selectedDateObj.isAfter(endDate)
        ) {
          state.selectedDate = startDate;
        }
      } else if (action.payload && action.payload.length > 0) {
        // If no date was selected, default to the start date
        state.selectedDate = action.payload[0];
      }
    },

    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
  },
});

// Export actions
export const {
  setActiveTab,
  scheduleMovie,
  scheduleMovieSingle,
  updateScheduledMovie,
  removeScheduledMovie,
  setSelectedMovie,
  toggleDetailsOpen,
  updateSeatStructure,
  setCoupon,
  setDateRange,
  setSelectedDate,
} = movieScheduleSlice.actions;

export default movieScheduleSlice.reducer;
