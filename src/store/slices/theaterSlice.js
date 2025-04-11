import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import TheaterService from "services/theaterService";

const initialState = {
    loading: false,
    editLoading: false,
    response: null,
    statusEditresponse: null,
    editId: null,
    editData: [],
    singleResponse: null,
    submitMessage: null,
    formType: null,
    editable_status: null,
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
    async ({ data, action, pageData }, { rejectWithValue }) => {
        try {
            const response = await TheaterService.editTheaterStatus(data, action, pageData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error creating screen");
        }
    }
);

const theaterSlice = createSlice({
    name: "theater",
    initialState,
    reducers: {
        setTheaterEditData(state, action) {
            state.editData = action.payload;
        },
        setTheaterEditId(state, action) {
            state.editId = action.payload;
        },
        setCleraAllData(state) {
            state.response = null;
            state.singleResponse = null;
        },
        setFormType(state, action) {
            state.formType = action.payload;
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
            .addCase(editTheaterStatus.pending, (state) => {
                state.editLoading = true;
            })
            .addCase(editTheaterStatus.fulfilled, (state, { payload }) => {
                state.editLoading = false;
                state.statusEditresponse = payload.data;
                if (payload.status) {
                    state.message = payload.status.message;
                    state.editable_status = payload.status?.editable_status;
                }
            })
            .addCase(editTheaterStatus.rejected, (state, action) => {
                state.editLoading = false;
                state.error = action.payload;
            })
    },
});

export const { setTheaterEditData, setTheaterEditId, setCleraAllData, setFormType } = theaterSlice.actions;

export default theaterSlice.reducer;
