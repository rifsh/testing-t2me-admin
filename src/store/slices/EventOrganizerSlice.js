import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import EventOrganizerService from "services/EventOrganizerService";

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
    comment: '',
    actionType: '',
    showAllComments: false,
};


export const fetchOrganizerUpdates = createAsyncThunk(
    "organizerUpdates/fetchOrganizerUpdates",
    async (pageData, { rejectWithValue }) => {
        try {

            const response = await EventOrganizerService.fetchOrganizerUpdates(pageData);
            console.log("-----------Fetching Organizer Updates", response.data[0])
            return response.data[0];

        } catch (error) {
            console.log(error, "-------------")
            return rejectWithValue("Failed to fetch Organizer Updates");
        }
    }
);

export const submitOrganizerUpdate = createAsyncThunk(
    "organizerUpdates/submitOrganizerUpdate",
    async ({ data, action }, { rejectWithValue }) => {
        try {
            const response = await EventOrganizerService.submitOrganizerUpdate(data, action);
            return response.status;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to update category");
        }
    }
);

export const fetchSingleOrganizerUpdate = createAsyncThunk(
    "organizerUpdates/fetchSingleOrganizerUpdate",
    async (eventUpId, { rejectWithValue }) => {
        try {

            const response = await EventOrganizerService.fetchSingleOrganizerUpdate(eventUpId);
            console.log("-----------Fetching Organizer Updates", response.data[0])
            return response.data[0];

        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch event details");
        }
    }
);

export const updateOrganizerEvent = createAsyncThunk(
    "organizerUpdates/updateOrganizerEvent",
    async ({ data, action }, { rejectWithValue }) => {
        try {
            const response = await EventOrganizerService.updateOrganizerEvent(data, action);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to update Event");
        }
    }
);

export const updateOrganizerReChanges = createAsyncThunk(
    "organizerUpdates/updateOrganizerReChanges",
    async ({ data, action }, { rejectWithValue }) => {
        try {
            console.log("------------------HEREEEEEEEEEEEEEEEEEE", data);
            console.log("------------------HEREEEEEEEEEEEEEEEEEE", action);
            const response = await EventOrganizerService.updateOrganizerReChanges(data, action);
            console.log("responsssssssss", response);

            return response;
        } catch (error) {
            console.log("ERorrrrrrrrr", error);

            return rejectWithValue(error.message || "Failed to update Banner");
        }
    }
);



const OrganizerUpdateSlice = createSlice({
    name: "organizerUpdates",
    initialState,
    reducers: {
        toggleComments: (state) => {
            state.showAllComments = !state.showAllComments;
        },
        setCommentModalVisibility: (state, action) => {
            state.isCommentModalVisible = action.payload;
        },
        setComment: (state, action) => {
            state.comment = action.payload;
        },
        setActionType: (state, action) => {
            state.actionType = action.payload;
        },
        setOrganizerUpdateDialogVisible(state, action) {
            state.dialogVisible = action.payload;
        },
        setUpdateEventDialogVisible(state, action) {
            state.dialogVisible = action.payload;
        },
        setOrganizerUpdateModalLoading(state, action) {
            state.modalLoading = action.payload;
        },
        setSelectedOrganizerUpdate(state, action) {
            state.selectedOrganizerUpdate = action.payload;
        },
        setSelectedUpdateEvent(state, action) {
            state.selectedUpdateEvent = action.payload;
        },
        setUpdateEventLoading(state, action) {
            state.modalLoading = action.payload;
        },
        filterOrganizerUpdate: (state, action) => {
            const { searchTerm, type } = action.payload;


            state.filteredOrganizerUpdates = state.organizerUpdates.filter((update) =>
                update.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

        },

        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
            state.filteredOrganizerUpdates = state.organizerUpdates.filter((update) =>
                update.name.toLowerCase().includes(action.payload.toLowerCase())
            );
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrganizerUpdates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrganizerUpdates.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.organizerUpdates = payload.items;
                state.filteredOrganizerUpdates = payload.items;
                state.pagination = payload;
            })
            .addCase(fetchOrganizerUpdates.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })
            .addCase(fetchSingleOrganizerUpdate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSingleOrganizerUpdate.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.singleOrganizerUpdate = payload;
                state.pagination = payload;
            })
            .addCase(fetchSingleOrganizerUpdate.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            })
            .addCase(submitOrganizerUpdate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitOrganizerUpdate.fulfilled, (state, { payload }) => {
                state.loading = false;
                if (payload.message) {
                    state.message = payload.message;
                    state.editable_status = payload.editable_status;
                }
            })
            .addCase(submitOrganizerUpdate.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload || "Faileds";
            })
            .addCase(updateOrganizerEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrganizerEvent.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.responseDataEvent = payload.data;
                if (payload.message) {
                    state.message = payload.status.message;
                    state.responseMessageEvent = payload.status.message;
                    state.editable_status = payload.editable_status;
                }
            })
            .addCase(updateOrganizerEvent.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload || "Failed to edit event";
            })
            .addCase(updateOrganizerReChanges.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrganizerReChanges.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.responseDataEvent = payload.data;
                if (payload.message) {
                    state.message = payload.message;
                    state.responseMessageEvent = payload.status.message;
                    state.editable_status = payload.editable_status;
                }
            })
            .addCase(updateOrganizerReChanges.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload || "Failed to edit event";
            })

    },
});

export const {
    filterOrganizerUpdate,
    setOrganizerUpdateDialogVisible,
    setUpdateEventDialogVisible,
    setSelectedUpdateEvent,
    setUpdateEventLoading,
    setOrganizerUpdateModalLoading,
    setSelectedOrganizerUpdate,
    setCommentModalVisibility,
    setComment,
    setActionType,
    toggleComments
} =
    OrganizerUpdateSlice.actions;

export default OrganizerUpdateSlice.reducer;
