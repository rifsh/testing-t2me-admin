import dayjs from "dayjs";
import { createSlice } from "@reduxjs/toolkit";

// Mock data for initial state
const initialMovies = [
  {
    id: 1,
    title: "Interstellar",
    duration: 169,
    color: "#4299e1",
    description: "A team of explorers travel through a wormhole in space.",
  },
  {
    id: 2,
    title: "The Matrix",
    duration: 136,
    color: "#48bb78",
    description: "A computer hacker learns about the true nature of reality.",
  },
  {
    id: 3,
    title: "Inception",
    duration: 148,
    color: "#ed8936",
    description:
      "A thief who steals corporate secrets through dream-sharing technology.",
  },
  {
    id: 4,
    title: "Pulp Fiction",
    duration: 154,
    color: "#9f7aea",
    description:
      "The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine.",
  },
  {
    id: 5,
    title: "The Dark Knight",
    duration: 152,
    color: "#f56565",
    description: "Batman fights the menace known as the Joker.",
  },
];

const screens = ["Screen 1", "Screen 2", "Screen 3", "Screen 4"];

// Generate empty schedule for 7 days
const generateEmptySchedule = () => {
  const schedule = {};
  for (let i = 0; i < 7; i++) {
    schedule[i] = [];
  }
  return schedule;
};

const movieScheduleSlice = createSlice({
  name: "movieSchedule",
  initialState: {
    movies: initialMovies,
    screens: screens,
    scheduledMovies: {}, // Change from array to object with date keys
    dateRange: [
      dayjs().format("YYYY-MM-DD"),
      dayjs().add(6, "day").format("YYYY-MM-DD"),
    ],
    selectedDate: dayjs().format("YYYY-MM-DD"),
    selectedMovieId: null,
    isDetailsOpen: false,
    seatStructure: null,
    coupons: {},
  },
  reducers: {
    // Switch between days
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },

    // Add a movie to the schedule
    // Update scheduleMovie reducer
    scheduleMovie: (state, action) => {
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

    // Update updateScheduledMovie reducer
    updateScheduledMovie: (state, action) => {
      const { date, updatedMovie } = action.payload;

      if (state.scheduledMovies[date]) {
        state.scheduledMovies[date] = state.scheduledMovies[date].map((movie) =>
          movie.id === updatedMovie.id ? updatedMovie : movie
        );
      }
    },

    // Update removeScheduledMovie reducer
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
    // Add a new movie to the catalog
    addMovie: (state, action) => {
      state.movies.push({
        id: Date.now(),
        ...action.payload,
      });
    },
  },
});

// Export actions
export const {
  setActiveTab,
  scheduleMovie,
  updateScheduledMovie,
  removeScheduledMovie,
  setSelectedMovie,
  toggleDetailsOpen,
  updateSeatStructure,
  setCoupon,
  setDateRange,
  setSelectedDate,
  addMovie,
} = movieScheduleSlice.actions;

// Export selectors
export const selectMovies = (state) => state.movieSchedule.movies;
export const selectScreens = (state) => state.movieSchedule.screens;
export const selectActiveTab = (state) => state.movieSchedule.activeTab;
export const selectScheduledMovies = (state) =>
  state.movieSchedule.scheduledMovies;
export const selectScheduledMoviesForActiveDay = (state) =>
  state.movieSchedule.scheduledMovies[state.movieSchedule.activeTab];
export const selectSelectedMovie = (state) => {
  const id = state.movieSchedule.selectedMovieId;
  if (!id) return null;

  const day = state.movieSchedule.activeTab;
  const scheduledMovie = state.movieSchedule.scheduledMovies[day].find(
    (m) => m.id === id
  );
  if (!scheduledMovie) return null;

  const movieDetails = state.movieSchedule.movies.find(
    (m) => m.id === scheduledMovie.movieId
  );
  if (!movieDetails) return null;

  return {
    ...scheduledMovie,
    ...movieDetails,
    coupon: state.movieSchedule.coupons[id] || "",
  };
};
export const selectIsDetailsOpen = (state) => state.movieSchedule.isDetailsOpen;
export const selectSeatStructure = (state) => state.movieSchedule.seatStructure;

export default movieScheduleSlice.reducer;
