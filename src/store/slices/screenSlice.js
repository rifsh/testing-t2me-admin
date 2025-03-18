import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ScreenService from "services/ScreenService";

const initialState = {
    response: [],
    screens: [],
    loading: false,
    error: null,
    message: null,
    pagination: { size: 10, page: 1 }
};

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
            .addCase(createScreen.pending, (state) => {
                state.loading = true;
            })
            .addCase(createScreen.fulfilled, (state, action) => {
                state.loading = true;
                state.response = action.payload;
                state.screens = action.payload.data.screens
            })
            .addCase(createScreen.rejected, (state, action) => {
                state.loading = true;
                state.error = action.payload;
            })
    },
});

export const { } = screenSlice.actions;

export default screenSlice.reducer;
