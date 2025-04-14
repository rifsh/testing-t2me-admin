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
    {
      id: 2,
      title: "The Dark Knight",
      duration: 152,
      genre: "Action",
      director: "Christopher Nolan",
      image:
        "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC/et00012473-vlrjfslazp-portrait.jpg",
    },
    {
      id: 3,
      title: "Interstellar",
      duration: 169,
      genre: "Sci-Fi",
      director: "Christopher Nolan",
      image:
        "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC/et00019066-rtldxrfyzs-portrait.jpg",
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
      // Ensure the movie has a scheduleDate property if selectedDate exists
      if (state.selectedDate && !action.payload.scheduleDate) {
        action.payload.scheduleDate = state.selectedDate.format("YYYY-MM-DD");
      }
      state.scheduledMovies.push(action.payload);
    },
    updateScheduledMovie: (state, action) => {
      const index = state.scheduledMovies.findIndex(
        (movie) => movie.id === action.payload.id
      );
      if (index !== -1) {
        // Keep the original scheduleDate unless a new one is provided
        if (
          !action.payload.scheduleDate &&
          state.scheduledMovies[index].scheduleDate
        ) {
          action.payload.scheduleDate =
            state.scheduledMovies[index].scheduleDate;
        }
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
