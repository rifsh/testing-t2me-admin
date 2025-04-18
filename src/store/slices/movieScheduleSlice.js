import dayjs from "dayjs";
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  scheduledMovies: {},
  dateRange: [],
  selectedDate: dayjs().format("YYYY-MM-DD"),
  selectedMovieId: null,
  isDetailsOpen: false,
  seatStructure: null,
  coupons: {},
  offers: {},
  seatStructures: {},
  intervalTimes: {},
  activeTab: 0,
  dateRangeLength: 7,
  showLengthOptions: false,
  availableMovies: [],
};
const movieScheduleSlice = createSlice({
  name: "movieSchedule",
  initialState,
  reducers: {
    resetState: () => {
      return initialState;
    },
    // Switch between days
    setavailableMovies: (state, action) => {
      state.availableMovies = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setDateRangeLength: (state, action) => {
      state.dateRangeLength = action.payload;
    },

    setShowLengthOptions: (state, action) => {
      state.showLengthOptions = action.payload;
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

    // Set coupons for a scheduled movie (as a list)
    setCoupons: (state, action) => {
      const { movieId, couponIds } = action.payload;
      state.coupons[movieId] = couponIds;
    },

    // Set offers for a scheduled movie (as a list)
    setOffers: (state, action) => {
      const { movieId, offerIds } = action.payload;
      state.offers[movieId] = offerIds;
    },

    // Set seat structure for a scheduled movie
    setSeatStructure: (state, action) => {
      const { movieId, seatStructureId } = action.payload;
      state.seatStructures[movieId] = seatStructureId;
    },

    // Set interval time for a scheduled movie
    setIntervalTime: (state, action) => {
      const { movieId, intervalTime } = action.payload;
      state.intervalTimes[movieId] = intervalTime;
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
  resetState,
  scheduleMovie,
  scheduleMovieSingle,
  updateScheduledMovie,
  setavailableMovies,
  removeScheduledMovie,
  setSelectedMovie,
  toggleDetailsOpen,
  updateSeatStructure,
  setCoupons,
  setOffers,
  setSeatStructure,
  setIntervalTime,
  setDateRange,
  setSelectedDate,
  setDateRangeLength,
  setShowLengthOptions,
} = movieScheduleSlice.actions;

export default movieScheduleSlice.reducer;
