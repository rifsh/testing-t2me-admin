import { createSlice } from "@reduxjs/toolkit";

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
      title: "The Shawshank Redemption",
      duration: 142,
      genre: "Drama",
      director: "Frank Darabont",
      image:
        "https://assetscdn1.paytm.com/images/cinema/sikanderrr-ed801230-0981-11f0-9ad0-15515cce4369.jpg?format=webp&imwidth=322",
    },
    {
      id: 3,
      title: "The Dark Knight",
      duration: 152,
      genre: "Action",
      director: "Christopher Nolan",
      image:
        "https://berkleyspectator.com/wp-content/uploads/2022/01/vgPj2F128qtShMaT9DNa8ODtWUFhqqrFPEUWfTRo-e1642785179405-683x900.jpeg",
    },
    {
      id: 4,
      title: "Pulp Fiction",
      duration: 154,
      genre: "Crime",
      director: "Quentin Tarantino",
      image:
        "https://assetscdn1.paytm.com/images/cinema/sikanderrr-ed801230-0981-11f0-9ad0-15515cce4369.jpg?format=webp&imwidth=322",
    },
    {
      id: 5,
      title: "Forrest Gump",
      duration: 142,
      genre: "Drama",
      director: "Robert Zemeckis",
      image:
        "https://berkleyspectator.com/wp-content/uploads/2022/01/vgPj2F128qtShMaT9DNa8ODtWUFhqqrFPEUWfTRo-e1642785179405-683x900.jpeg",
    },
    {
      id: 6,
      title: "The Matrix",
      duration: 136,
      genre: "Sci-Fi",
      director: "Lana & Lilly Wachowski",
      image:
        "https://assetscdn1.paytm.com/images/cinema/sikanderrr-ed801230-0981-11f0-9ad0-15515cce4369.jpg?format=webp&imwidth=322",
    },
  ],
  scheduledMovies: [],
  selectedMovie: null,
  zoomLevel: 1,
  xDomain: [8, 24], // Changed to show 8am-midnight by default
};

const movieScheduleSlice = createSlice({
  name: "movieScheduleSlice",
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
    setZoomLevel: (state, action) => {
      state.zoomLevel = action.payload;
    },
    setXDomain: (state, action) => {
      state.xDomain = action.payload;
    },
  },
});

export const {
  setSelectedMovie,
  setZoomLevel,
  setXDomain,
  addScheduledMovie,
  updateScheduledMovie,
  removeScheduledMovie,
  addMovie,
  updateMovie,
  removeMovie,
} = movieScheduleSlice.actions;
export default movieScheduleSlice.reducer;
