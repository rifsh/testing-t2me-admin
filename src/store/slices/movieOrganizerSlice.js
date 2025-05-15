import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import EventOrganizerService from "services/EventOrganizerService";
import MovieOrganizerService from "services/MovieOrganizerService";

const initialState = {
    loading: false,
    organizerUpdates: [],
    filteredOrganizerUpdates: [],
    searchTerm: "",
    responseDataEvent: null,
    selectedOrganizerUpdate: null,
    responseMessageEvent: null,
    selectedOrganizerUpdateId: null,
    selectedUpdateEvent: null,
    error: null,
    message: null,
    subPagination: {},
    pagination: {},
    editable_status: null,
    modalVisible: false,
    singleOrganizerUpdate: {},
    isCommentModalVisible: false,
    comment: "",
    actionType: "",
    showAllComments: false,
};

export const submitOrganizerMovieSeatUpdate = createAsyncThunk(
    "organizerUpdates/submitOrganizerOfferUpdate",
    async ({ data, action, params }, { rejectWithValue }) => {
        try {
            const response = await MovieOrganizerService.submitOrganizerMovieUpdate(
                data,
                action,
                params
            );
            return response.status;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to update category");
        }
    }
);

const movieOrganizerUpdateSlice = createSlice({
    name: "movieOrganizerUpdates",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(submitOrganizerMovieSeatUpdate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitOrganizerMovieSeatUpdate.fulfilled, (state, { payload }) => {
                state.loading = false;
                if (payload.message) {
                    state.message = payload.message;
                    state.editable_status = payload.editable_status;
                }
            })
            .addCase(submitOrganizerMovieSeatUpdate.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload || "Faileds";
            });
    },
});

export const {

} = movieOrganizerUpdateSlice.actions;

export default movieOrganizerUpdateSlice.reducer;
