import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ScreenService from "services/ScreenService";

const initialState = {
    response: null,
    editResponse: null,
    singleResponse: null,
    screenTechResponse: [],
    screenTechnologies: [],
    screenAudioResponse: [],
    screenAudioTechnologies: [],
    screenFeaturesResponse: [],
    screenFeatures: [],
    editItemId: null,
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
export const editScreen = createAsyncThunk(
    "screen/editScreen",
    async ({ updatedScreen, action, pageData }, { rejectWithValue }) => {        
        console.log('updated', updatedScreen);
        
        try {
            const response = await ScreenService.editScreen(updatedScreen, action, pageData );
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error creating screen");
        }
    }
);
export const fetchScreenData = createAsyncThunk(
    "screen/fetchScreenData",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await ScreenService.getScreens(pageData);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch screen features");
        }
    }
);
export const fetchScreenById = createAsyncThunk(
    "screen/fetchScreenById",
    async (screen_id, { rejectWithValue }) => {
        try {
            const response = await ScreenService.getScreenById(screen_id);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch screen features");
        }
    }
);

const screenSlice = createSlice({
    name: "screen",
    initialState,
    reducers: {
        setScreenEditItemId(state, action) {
            state.editItemId = action.payload;
        }
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
                state.response = action.payload.data;
            })
            .addCase(createScreen.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(editScreen.pending, (state) => {
                state.loading = true;
            })
            .addCase(editScreen.fulfilled, (state, action) => {
                state.loading = false;
                state.editResponse = action.payload.data;
            })
            .addCase(editScreen.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchScreenData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchScreenData.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
                state.pagination = action.payload;
            })
            .addCase(fetchScreenData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchScreenById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchScreenById.fulfilled, (state, action) => {
                state.loading = false;
                state.singleResponse = action.payload;
            })
            .addCase(fetchScreenById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
});

export const { setScreenEditItemId } = screenSlice.actions;

export default screenSlice.reducer;
