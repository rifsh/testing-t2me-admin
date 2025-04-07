import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import movieService from "services/MovieService";

const initialState = {
    loading: false,
    response: null,
    omdbMovie: null,
    filterData: {
        y: null,
        s: null
    },
    imdbId: null,
};

export const fetchMovieData = createAsyncThunk(
    "cast/fetchMovieData",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await movieService.getOmdbMovieData(pageData);
            return response.data[0];

        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch cast features");
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
            return rejectWithValue(error.message || "Failed to fetch cast features");
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
    },
});

export const { setFilterData, setimdbId } = movieSlice.actions;

export default movieSlice.reducer;
