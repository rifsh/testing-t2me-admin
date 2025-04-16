import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import movieService from "services/MovieService";

const initialState = {
    movieFormData: [],
    loading: false,
    editLoading: false,
    response: null,
    editResponse: null,
    movieEditData: null,
    movieEditId: null,
    movieResponse: null,
    movieSingleResponse: null,
    omdbMovie: null,
    filterData: {
        y: null,
        s: null
    },
    editable_status: null,
    imdbId: null,
    pagination: { size: 10, page: 1 }

};

export const fetchMovieData = createAsyncThunk(
    "cast/fetchMovieData",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await movieService.getOmdbMovieData(pageData);
            return response.data[0];

        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch Movie features");
        }
    }
);
export const fetchMovie = createAsyncThunk(
    "cast/fetchMovie",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await movieService.getOmdbMovie(pageData);
            return response.data[0];

        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch Movie features");
        }
    }
);
export const createMovie = createAsyncThunk(
    "cast/createMovie",
    async ({ data, action }, { rejectWithValue }) => {

        try {
            const response = await movieService.addMovie(data, action);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error creating Movie details");
        }
    }
);
export const editMovie = createAsyncThunk(
    "cast/editMovie",
    async ({ data, action }, { rejectWithValue }) => {
        try {
            const response = await movieService.editMovie(data, action);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error editing personality");
        }
    }
);
export const fetchMoviesData = createAsyncThunk(
    "cast/fetchMoviesData",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await movieService.getMovieData(pageData);
            return response.data[0];

        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch Movie features");
        }
    }
);
export const fetchMoviesById = createAsyncThunk(
    "cast/fetchMoviesById",
    async (movie_id, { rejectWithValue }) => {
        try {
            const response = await movieService.getMovieDataById(movie_id);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch Movie");
        }
    }
);
export const editMovieStatus = createAsyncThunk(
    "cast/editMovieStatus",
    async ({ data, action }, { rejectWithValue }) => {
        try {
            const response = await movieService.editStatus(data, action);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error updating status");
        }
    }
);

const movieSlice = createSlice({
    name: "movie",
    initialState,
    reducers: {
        setFilterData(state, action) {
            state.filterData.y = action.payload.year;
            state.filterData.s = action.payload.searchValue;
        },
        setimdbId(state, action) {
            state.imdbId = action.payload
        },
        setEditMovieId(state, action) {
            state.movieEditId = action.payload
        },
        setEditMovieData(state, action) {
            state.movieEditData = action.payload
        },
        setMovieFormData(state, action) {
            state.movieFormData.push(action.payload);
        },
        clearOMDBData(state) {
            state.response = null
            state.omdbMovie = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovieData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMovieData.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
            })
            .addCase(fetchMovieData.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchMovie.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMovie.fulfilled, (state, action) => {
                state.loading = false;
                state.omdbMovie = action.payload;
            })
            .addCase(fetchMovie.rejected, (state) => {
                state.loading = false;
            })
            .addCase(createMovie.pending, (state) => {
                state.loading = true;
            })
            .addCase(createMovie.fulfilled, (state, action) => {
                state.loading = false;
                state.movieResponse = action.payload;
                state.submitMessage = action.payload.status.message;
            })
            .addCase(createMovie.rejected, (state) => {
                state.loading = false;
            })
            .addCase(editMovie.pending, (state) => {
                state.loading = true;
            })
            .addCase(editMovie.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.movieResponse = payload.data;
                if (payload.status) {
                    state.message = payload.status.message;
                    state.editable_status = payload.status?.editable_status;
                }
            })
            .addCase(editMovie.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchMoviesData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMoviesData.fulfilled, (state, action) => {
                state.loading = false;
                state.movieResponse = action.payload;
                state.pagination = action.payload;
            })
            .addCase(fetchMoviesData.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchMoviesById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMoviesById.fulfilled, (state, action) => {
                state.loading = false;
                state.movieSingleResponse = action.payload
            })
            .addCase(fetchMoviesById.rejected, (state) => {
                state.loading = false;
            })
            .addCase(editMovieStatus.pending, (state) => {
                state.editLoading = true;
            })
            .addCase(editMovieStatus.fulfilled, (state, { payload }) => {
                state.editLoading = false;
                state.editResponse = payload.data;
                if (payload.status) {
                    state.message = payload.status.message;
                    state.editable_status = payload.status?.editable_status;
                }
            })
            .addCase(editMovieStatus.rejected, (state) => {
                state.editLoading = false;
            })
    },
});

export const { setFilterData, setimdbId, setMovieFormData, setEditMovieId, setEditMovieData, clearOMDBData } = movieSlice.actions;

export default movieSlice.reducer;
