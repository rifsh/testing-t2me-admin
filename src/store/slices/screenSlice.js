import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ScreenService from "services/ScreenService";

const initialState = {
    response: [],
    screenTechResponse: [],
    screenTechnologies: [],
    screenAudioResponse: [],
    screenAudioTechnologies: [],
    screenFeaturesResponse: [],
    screenFeatures: [],
    screens: [],
    loading: false,
    techLoading: false,
    error: null,
    message: null,
    pagination: { size: 10, page: 1 }
};

export const fetchScreenTech = createAsyncThunk(
    "screen/fetchScreenTech",
    async (venue_id, { rejectWithValue }) => {
        try {
            const response = await ScreenService.fetchScreenTech(venue_id);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch screen technologies");
        }
    }
);
export const fetchScreenAudio = createAsyncThunk(
    "screen/fetchScreenAudio",
    async (venue_id, { rejectWithValue }) => {
        try {
            const response = await ScreenService.fetchScreenAudio(venue_id);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch screen audio technologies");
        }
    }
);
export const fetchScreenFeatures = createAsyncThunk(
    "screen/fetchScreenFeatures",
    async (venue_id, { rejectWithValue }) => {
        try {
            const response = await ScreenService.fetchScreenFeatures(venue_id);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch screen features");
        }
    }
);
export const createScreen = createAsyncThunk(
    "screen/addScreen",
    async ({ data, action }, { rejectWithValue }) => {
        try {
            const response = await ScreenService.addScreen(data, action);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error creating screen");
        }
    }
);

const screenSlice = createSlice({
    name: "screen",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchScreenTech.pending, (state) => {
                state.techLoading = true;
            })
            .addCase(fetchScreenTech.fulfilled, (state, action) => {
                state.techLoading = false;
                state.screenTechnologies = action.payload?.items;
                state.screenTechResponse = action.payload;
            })
            .addCase(fetchScreenTech.rejected, (state, action) => {
                state.techLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchScreenAudio.pending, (state) => {
                state.techLoading = true;
            })
            .addCase(fetchScreenAudio.fulfilled, (state, action) => {
                state.techLoading = false;
                state.screenAudioTechnologies = action.payload?.items;
                state.screenAudioResponse = action.payload;
            })
            .addCase(fetchScreenAudio.rejected, (state, action) => {
                state.techLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchScreenFeatures.pending, (state) => {
                state.techLoading = true;
            })
            .addCase(fetchScreenFeatures.fulfilled, (state, action) => {
                state.techLoading = false;
                state.screenFeatures = action.payload?.items;
                state.screenFeaturesResponse = action.payload;
            })
            .addCase(fetchScreenFeatures.rejected, (state, action) => {
                state.techLoading = false;
                state.error = action.payload;
            })
            .addCase(createScreen.pending, (state) => {
                state.loading = true;
            })
            .addCase(createScreen.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
                state.screens = action.payload.data.screens
            })
            .addCase(createScreen.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
});

export const { } = screenSlice.actions;

export default screenSlice.reducer;
