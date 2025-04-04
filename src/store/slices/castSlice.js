import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import PersonalityService from "services/PersonalityService";

const initialState = {
    loading: false,
    response: null,
    editId: null,
    singleResponse: null,
    personalities: null,
    submitMessage: null,
    pagination: { size: 10, page: 1 }
};

export const createPersonality = createAsyncThunk(
    "screen/addPersonality",
    async ({ data, action }, { rejectWithValue }) => {

        try {
            const response = await PersonalityService.addPersonality(data, action);
            console.log('working', response);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error creating personality details");
        }
    }
);
export const fetchPersonalitiesData = createAsyncThunk(
    "screen/fetchPersonalitiesData",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await PersonalityService.getPersonalityData(pageData);
            return response.data[0];

        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch screen features");
        }
    }
);
export const fetchPersonalitiesById = createAsyncThunk(
    "screen/fetchPersonalitiesById",
    async (person_id, { rejectWithValue }) => {
        try {
            const response = await PersonalityService.getPersonalityDataById(person_id);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch screen features");
        }
    }
);

const castSlice = createSlice({
    name: "screen",
    initialState,
    reducers: {
        setPersonalityEditId(state, action) {
            state.editId = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPersonality.pending, (state) => {
                state.loading = true;
            })
            .addCase(createPersonality.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
                state.submitMessage = action.payload.status.message;
            })
            .addCase(createPersonality.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchPersonalitiesData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPersonalitiesData.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
            })
            .addCase(fetchPersonalitiesData.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchPersonalitiesById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPersonalitiesById.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload
            })
            .addCase(fetchPersonalitiesById.rejected, (state) => {
                state.loading = false;
            })
    },
});

export const { setPersonalityEditId } = castSlice.actions;

export default castSlice.reducer;
