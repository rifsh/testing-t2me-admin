import { createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

const initialState = {
  movies: [
    {
      id: 1,
      title: "Inception",
      duration: 148,
      genre: "Sci-Fi",
      director: "Christopher Nolan",
      image:
        "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC/et00308207-dffnzphrxk-portrait.jpg",
    },
  ],
  scheduledMovies: [],
  selectedMovie: null,
  dateRange: [dayjs(), dayjs().add(6, "day")], // Default 7-day range
  selectedDate: dayjs(), // Default to today
  zoomLevel: 1,
  xDomain: [8, 24], // Show 8am-midnight by default
};

const movieScheduleSlice = createSlice({
  name: "movieSchedule",
  initialState,
  reducers: {
    addMovie: (state, action) => {
      state.movies.push(action.payload);
    },
    updateMovie: (state, action) => {
      const index = state.movies.findIndex(
        (movie) => movie.id === action.payload.id
      );
      if (index !== -1) {
        state.movies[index] = action.payload;
      }
    },
    removeMovie: (state, action) => {
      state.movies = state.movies.filter(
        (movie) => movie.id !== action.payload
      );
    },
    addScheduledMovie: (state, action) => {
      state.scheduledMovies.push(action.payload);
    },
    updateScheduledMovie: (state, action) => {
      const index = state.scheduledMovies.findIndex(
        (movie) => movie.id === action.payload.id
      );
      if (index !== -1) {
        state.scheduledMovies[index] = action.payload;
      }
    },
    removeScheduledMovie: (state, action) => {
      state.scheduledMovies = state.scheduledMovies.filter(
        (movie) => movie.id !== action.payload
      );
    },
    setSelectedMovie: (state, action) => {
      state.selectedMovie = action.payload;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setZoomLevel: (state, action) => {
      state.zoomLevel = action.payload;
    },
    setXDomain: (state, action) => {
      state.xDomain = action.payload;
    },
  },
});

export const {
  addMovie,
  updateMovie,
  removeMovie,
  addScheduledMovie,
  updateScheduledMovie,
  removeScheduledMovie,
  setSelectedMovie,
  setDateRange,
  setSelectedDate,
  setZoomLevel,
  setXDomain,
} = movieScheduleSlice.actions;

export default movieScheduleSlice.reducer;
