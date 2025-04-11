import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import PersonalityService from "services/PersonalityService";

const initialState = {
    loading: false,
    editLoading: false,
    response: null,
    editResponse: null,
    editId: null,
    singleResponse: null,
    personalities: null,
    submitMessage: null,
    message: null,
    editData: [],
    editable_status: null,
    pagination: { size: 10, page: 1 }
};

export const createPersonality = createAsyncThunk(
    "cast/addPersonality",
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
    "cast/fetchPersonalitiesData",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await PersonalityService.getPersonalityData(pageData);
            return response.data[0];

        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch cast features");
        }
    }
);
export const fetchPersonalitiesById = createAsyncThunk(
    "cast/fetchPersonalitiesById",
    async (person_id, { rejectWithValue }) => {
        try {
            const response = await PersonalityService.getPersonalityDataById(person_id);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch Personality");
        }
    }
);
export const editPersonality = createAsyncThunk(
    "cast/editPersonality",
    async ({ data, action }, { rejectWithValue }) => {
        try {
            const response = await PersonalityService.editPersonality(data, action);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error editing personality");
        }
    }
);
export const editPersonalityStatus = createAsyncThunk(
    "cast/editPersonalityStatus",
    async ({ data, action }, { rejectWithValue }) => {
        try {
            const response = await PersonalityService.editStatus(data, action);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error updating status");
        }
    }
);

const castSlice = createSlice({
    name: "screen",
    initialState,
    reducers: {
        setPersonalityEditId(state, action) {
            state.editId = action.payload
        },
        setPersonalityEditData(state, action) {
            state.editData = action.payload
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
                state.pagination = action.payload;
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
            .addCase(editPersonality.pending, (state) => {
                state.loading = true;
            })
            .addCase(editPersonality.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.response = payload.data;
                if (payload.status) {
                    state.message = payload.status.message;
                    state.editable_status = payload.status?.editable_status;
                }
            })
            .addCase(editPersonality.rejected, (state) => {
                state.loading = false;
            })
            .addCase(editPersonalityStatus.pending, (state) => {
                state.editLoading = true;
            })
            .addCase(editPersonalityStatus.fulfilled, (state, { payload }) => {
                state.editLoading = false;
                state.editResponse = payload.data;
                if (payload.status) {
                    state.message = payload.status.message;
                    state.editable_status = payload.status?.editable_status;
                }
            })
            .addCase(editPersonalityStatus.rejected, (state) => {
                state.editLoading = false;
            })
    },
});

export const { setPersonalityEditId, setPersonalityEditData } = castSlice.actions;

export default castSlice.reducer;
