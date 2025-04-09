import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import TheaterService from "services/theaterService";

const initialState = {
    loading: false,
    response: null,
    editId: null,
    editData: [],
    singleResponse: null,
    submitMessage: null,
    message: null,
    pagination: { size: 10, page: 1 },
    error: null,
};

export const createTheater = createAsyncThunk(
    "cast/createTheater",
    async ({ data, action }, { rejectWithValue }) => {
        try {
            const response = await TheaterService.createTheater(data, action);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error creating personality details");
        }
    }
);
export const fetchTheaters = createAsyncThunk(
    "cast/fetchTheaters",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await TheaterService.getTheater(pageData);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch screen features");
        }
    }
);
export const fetchTheaterByid = createAsyncThunk(
    "cast/fetchTheaterByid",
    async (theatre_id, { rejectWithValue }) => {
        try {
            const response = await TheaterService.getTheaterById(theatre_id);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch screen features");
        }
    }
);
export const editTheater = createAsyncThunk(
    "cast/editTheater",
    async ({ data, action, pageData }, { rejectWithValue }) => {
        try {
            const response = await TheaterService.editTheater(data, action, pageData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error creating screen");
        }
    }
);
export const editTheaterStatus = createAsyncThunk(
    "cast/editTheaterStatus",
    async ({ data, action }, { rejectWithValue }) => {
        try {

        } catch (error) {

        }
    }
);

const theaterSlice = createSlice({
    name: "theater",
    initialState,
    reducers: {
        setTheaterEditData(state, action) {
            state.editData = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createTheater.pending, (state) => {
                state.loading = true;
            })
            .addCase(createTheater.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload.data;
                state.submitMessage = action.payload.status.message;
            })
            .addCase(createTheater.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchTheaters.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTheaters.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
                state.pagination = action.payload;
            })
            .addCase(fetchTheaters.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchTheaterByid.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTheaterByid.fulfilled, (state, action) => {
                state.loading = false;
                state.singleResponse = action.payload;
            })
            .addCase(fetchTheaterByid.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(editTheater.pending, (state) => {
                state.loading = true;
            })
            .addCase(editTheater.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.response = payload.data;
                if (payload.status) {
                    state.message = payload.status.message;
                }
            })
            .addCase(editTheater.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
});

export const { setTheaterEditData } = theaterSlice.actions;

export default theaterSlice.reducer;
