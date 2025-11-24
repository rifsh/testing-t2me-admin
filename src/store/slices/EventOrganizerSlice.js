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
  comment: "",
  actionType: "",
  showAllComments: false,
};

export const fetchOrganizerUpdates = createAsyncThunk(
  "organizerUpdates/fetchOrganizerUpdates",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await EventOrganizerService.fetchOrganizerUpdates(
        pageData
      );
      console.log("-----------Fetching Organizer Updates", response.data[0]);
      return response.data[0];
    } catch (error) {
      console.log(error, "-------------");
      return rejectWithValue("Failed to fetch Organizer Updates");
    }
  }
);

export const submitOrganizerUpdate = createAsyncThunk(
  "organizerUpdates/submitOrganizerUpdate",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await EventOrganizerService.submitOrganizerUpdate(
        data,
        action
      );
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update category");
    }
  }
);

export const updateOrganizerEvent = createAsyncThunk(
  "organizerUpdates/updateOrganizerEvent",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await EventOrganizerService.updateOrganizerEvent(
        data,
        action
      );
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
      const response = await EventOrganizerService.updateOrganizerReChanges(
        data,
        action
      );
      console.log("responsssssssss", response);

      return response;
    } catch (error) {
      console.log("ERorrrrrrrrr", error);

      return rejectWithValue(error.message || "Failed to update Banner");
    }
  }
);
export const fetchSingleOrganizerUpdate = createAsyncThunk(
  "organizerUpdates/fetchSingleOrganizerUpdate",
  async (eventUpId, { rejectWithValue }) => {
    try {
      const response = await EventOrganizerService.fetchSingleOrganizerUpdate(
        eventUpId
      );
      console.log("-----------Fetching Organizer Updates", response.data[0]);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);

export const submitOrganizerOfferUpdate = createAsyncThunk(
  "organizerUpdates/submitOrganizerOfferUpdate",
  async ({ data, action, params }, { rejectWithValue }) => {
    try {
      const response = await EventOrganizerService.submitOrganizerOfferUpdate(
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
export const submitOrganizerEventUpdate = createAsyncThunk(
  "organizerUpdates/submitOrganizerEventUpdate",
  async ({ data, action, params }, { rejectWithValue }) => {
    try {
      const response = await EventOrganizerService.submitOrganizerEventUpdate(
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
export const submitOrganizerTicketUpdate = createAsyncThunk(
  "organizerUpdates/submitOrganizerTicketUpdate",
  async ({ data, action, params }, { rejectWithValue }) => {
    try {
      const response = await EventOrganizerService.submitOrganizerTicketUpdate(
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
export const submitOrganizerCouponUpdate = createAsyncThunk(
  "organizerUpdates/submitOrganizerCouponUpdate",
  async ({ data, action, params }, { rejectWithValue }) => {
    try {
      const response = await EventOrganizerService.submitOrganizerCouponUpdate(
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
export const submitOrganizerVenueUpdate = createAsyncThunk(
  "organizerUpdates/submitOrganizerVenueUpdate",
  async ({ data, action, params }, { rejectWithValue }) => {
    try {
      const response = await EventOrganizerService.submitOrganizerVenueUpdate(
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

export const fetchOrganizerSingleOfferUpdate = createAsyncThunk(
  "organizerUpdates/fetchOrganizerSingleOfferUpdate",
  async (params, { rejectWithValue }) => {
    try {
      const response =
        await EventOrganizerService.fetchOrganizerSingleOfferUpdate(params);
      console.log("-----------Fetching Organizer Updates", response.data[0]);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchOrganizerSingleScheduleUpdate = createAsyncThunk(
  "organizerUpdates/fetchOrganizerSingleScheduleUpdate",
  async (params, { rejectWithValue }) => {
    try {
      const response =
        await EventOrganizerService.fetchOrganizerSingleScheduleUpdate(params);
      console.log("-----------Fetching Organizer Updates", response.data[0]);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchOrganizerSingleEventUpdate = createAsyncThunk(
  "organizerUpdates/fetchOrganizerSingleEventUpdate",
  async (params, { rejectWithValue }) => {
    try {
      const response =
        await EventOrganizerService.fetchOrganizerSingleEventUpdate(params);
      console.log("-----------Fetching Organizer Updates", response.data[0]);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchOrganizerSingleTicket = createAsyncThunk(
  "organizerUpdates/fetchOrganizerSingleTicket",
  async (params, { rejectWithValue }) => {
    try {
      const response = await EventOrganizerService.fetchOrganizerSingleTicket(
        params
      );
      console.log("-----------Fetching Organizer Updates", response.data[0]);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchOrganizerSingleVenue = createAsyncThunk(
  "organizerUpdates/fetchOrganizerSingleVenue",
  async (params, { rejectWithValue }) => {
    try {
      const response = await EventOrganizerService.fetchOrganizerSingleVenue(
        params
      );
      console.log("-----------Fetching Organizer Updates", response.data[0]);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchOrganizerSingleCouponUpdate = createAsyncThunk(
  "organizerUpdates/fetchOrganizerSingleCouponUpdate",
  async (params, { rejectWithValue }) => {
    try {
      const response =
        await EventOrganizerService.fetchOrganizerSingleCouponUpdate(params);
      console.log("-----------Fetching Organizer Updates", response.data[0]);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
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
      .addCase(fetchOrganizerSingleOfferUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrganizerSingleOfferUpdate.fulfilled,
        (state, { payload }) => {
          state.loading = false;
          state.singleOrganizerUpdate = payload;
          state.pagination = payload;
        }
      )
      .addCase(
        fetchOrganizerSingleOfferUpdate.rejected,
        (state, { payload }) => {
          state.loading = false;
          state.error = payload;
        }
      )
      .addCase(fetchOrganizerSingleScheduleUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrganizerSingleScheduleUpdate.fulfilled,
        (state, { payload }) => {
          state.loading = false;
          state.singleOrganizerUpdate = payload;
          state.pagination = payload;
        }
      )
      .addCase(
        fetchOrganizerSingleScheduleUpdate.rejected,
        (state, { payload }) => {
          state.loading = false;
          state.error = payload;
        }
      )
      .addCase(fetchOrganizerSingleEventUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrganizerSingleEventUpdate.fulfilled,
        (state, { payload }) => {
          state.loading = false;
          state.singleOrganizerUpdate = payload;
          state.pagination = payload;
        }
      )
      .addCase(
        fetchOrganizerSingleEventUpdate.rejected,
        (state, { payload }) => {
          state.loading = false;
          state.error = payload;
        }
      )
      .addCase(fetchOrganizerSingleTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizerSingleTicket.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.singleOrganizerUpdate = payload;
        state.pagination = payload;
      })
      .addCase(fetchOrganizerSingleTicket.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchOrganizerSingleVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizerSingleVenue.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.singleOrganizerUpdate = payload;
        state.pagination = payload;
      })
      .addCase(fetchOrganizerSingleVenue.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(submitOrganizerCouponUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrganizerCouponUpdate.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.singleOrganizerUpdate = payload;
        state.pagination = payload;
      })
      .addCase(submitOrganizerCouponUpdate.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(submitOrganizerVenueUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrganizerVenueUpdate.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.singleOrganizerUpdate = payload;
        state.pagination = payload;
      })
      .addCase(submitOrganizerVenueUpdate.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchOrganizerSingleCouponUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrganizerSingleCouponUpdate.fulfilled,
        (state, { payload }) => {
          state.loading = false;
          state.singleOrganizerUpdate = payload;
          state.pagination = payload;
        }
      )
      .addCase(
        fetchOrganizerSingleCouponUpdate.rejected,
        (state, { payload }) => {
          state.loading = false;
          state.error = payload;
        }
      )
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

      .addCase(submitOrganizerOfferUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrganizerOfferUpdate.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
          state.editable_status = payload.editable_status;
        }
      })
      .addCase(submitOrganizerOfferUpdate.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Faileds";
      })
      .addCase(submitOrganizerEventUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrganizerEventUpdate.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
          state.editable_status = payload.editable_status;
        }
      })
      .addCase(submitOrganizerEventUpdate.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Faileds";
      })
      .addCase(submitOrganizerTicketUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrganizerTicketUpdate.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
          state.editable_status = payload.editable_status;
        }
      })
      .addCase(submitOrganizerTicketUpdate.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Faileds";
      });
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
  toggleComments,
} = OrganizerUpdateSlice.actions;

export default OrganizerUpdateSlice.reducer;
