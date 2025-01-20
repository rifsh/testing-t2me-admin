import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  ALL_EVENT_MOCK_API,
  ENABLE_MOCK_API,
  EVENT_DETAILS_MOCK_API,
} from "configs/MockConfig";
import EventMockData from "mock/data/eventData";
import IssuesService from "services/IssueService";

const initialState = {
  IssueDetails: {},
  issues: [],
  CommentDetails : [],
  loading: false,
  error: null,
  submitData: {},
  message: null,
  submitLoading: false,
  dialogVisible: false,
  modalLoading: false,
  selectedEvent: null,
  warningMessage: null,
  responseData: null,
  responseMessage: null,
  editable_status: null,
  pagination: {size:10,page:1},
};

export const fetchIssueDetails = createAsyncThunk(
  "event/fetchIssueDetails",
  async (IssueId, { rejectWithValue }) => {
    try {
      if (EVENT_DETAILS_MOCK_API && ENABLE_MOCK_API) {
        const response = EventMockData.fetchIssueDetails;
        return response.data;
      } else {
        const response = await IssuesService.fetchIssueDetails(IssueId);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchCommentDetails = createAsyncThunk(
  "event/fetchCommentDetails",
  async (pageData, { rejectWithValue }) => {
    try {
      if (EVENT_DETAILS_MOCK_API && ENABLE_MOCK_API) {
        const response = EventMockData.fetchCommentDetails;
        return response.data;
      } else {
        const response = await IssuesService.fetchCommentDetails(pageData);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);


export const fetchAllissues = createAsyncThunk(
    "issue/fetchAllIssue",
    async (pageData, { rejectWithValue }) => {
      try {
        if (ENABLE_MOCK_API && ALL_EVENT_MOCK_API) {
          const response = EventMockData.fetchAllissues;
          return response.data;
        } else {
          const response = await IssuesService.getAllIssue(pageData);
          return response.data[0];
        }
      } catch (error) {
        return rejectWithValue(error.message || "Failed to fetch event details");
      }
    }
  );


export const fetchAllAlertissues = createAsyncThunk(
    "issue/fetchAllIssue",
    async (pageData, { rejectWithValue }) => {
      try {
        if (ENABLE_MOCK_API && ALL_EVENT_MOCK_API) {
          const response = EventMockData.fetchAllAlertissues;
          return response.data;
        } else {
          const response = await IssuesService.getAllAlertissues(pageData);
          return response.data[0];
        }
      } catch (error) {
        return rejectWithValue(error.message || "Failed to fetch event details");
      }
    }
  );
export const AddNewIssue = createAsyncThunk(
  "issue/AddNewIssue",
  async ( data , { rejectWithValue }) => {
    try {
      const response = await IssuesService.AddNewIssue( data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to process event");
    }
  }
);

export const IssueReasignComment = createAsyncThunk(
  "issue/IssueReasignComment",
  async ({ IssueId, data }, { rejectWithValue }) => {
    try {
      const response = await IssuesService.IssueReasignComment(IssueId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to process event");
    }
  }
);
export const IssueStatusUpdate = createAsyncThunk(
  "issue/IssueStatusUpdate",
  async ({ IssueId, data }, { rejectWithValue }) => {
    try {
        console.warn(IssueId, data,'.....')
      const response = await IssuesService.IssueStatusUpdate(IssueId,data);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);


export const IssueCloseUpdate = createAsyncThunk(
  "issue/IssueCloseUpdate",
  async ({ IssueId, data }, { rejectWithValue }) => {
    try {
        console.warn(IssueId, data,'.....')
      const response = await IssuesService.IssueCloseUpdate(IssueId, data);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

export const IssueReasignUpdate = createAsyncThunk(
  "issue/IssueReasignUpdate",
  async ({ IssueId, data }, { rejectWithValue }) => {
    try {
        console.warn(IssueId, data,'.....')
      const response = await IssuesService.IssueReasignUpdate(IssueId, data);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

const eventSlice = createSlice({
  name: "issue",
  initialState,

  reducers: {
    resetState: (state) => {
      return initialState;
    },
    filterEvent: (state, action) => {
      const { searchTerm, status } = action.payload;

      let event = state.events;
      if (status && status !== "All") {
        event = event.filter(
          (offer) =>
            (status === "Active" && offer.status === true) ||
            (status === "Inactive" && offer.status === false)
        );
      }

      if (searchTerm) {
        event = event.filter((offer) =>
          offer.event_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      state.filteredEvents = event;
    },
    setSubmitData(state, action) {
      state.submitData = { ...state.submitData, ...action.payload };
    },
    setCurrentStep(state, action) {
      state.currentStep = action.payload;
    },
    setSubmitLoading(state, action) {
      state.submitLoading = action.payload;
    },
    resetSelected: (state) => {
      state.selectedOffers = [];
      state.selectedCoupons = [];
      state.currentStep = 1;
    },
    setWarningMessage(state, action) {
      state.warningMessage = action.payload;
    },
    toggleSelectedOffer: (state, action) => {
      const existingOfferIndex = state.selectedOffers.findIndex(
        (offer) => offer.id === action.payload.id
      );
      if (existingOfferIndex !== -1) {
        state.selectedOffers.splice(existingOfferIndex, 1);
      } else {
        state.selectedOffers.push(action.payload);
      }
    },
    toggleSelectedCoupon: (state, action) => {
      const existingCouponIndex = state.selectedCoupons.findIndex(
        (coupon) => coupon.id === action.payload.id
      );
      if (existingCouponIndex !== -1) {
        state.selectedCoupons.splice(existingCouponIndex, 1);
      } else {
        state.selectedCoupons.push(action.payload);
      }
    },
    setDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
    setSelectedEvent(state, action) {
      state.selectedEvent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(IssueReasignComment.pending, (state) => {
        console.log("AddEvent - Pending State");
        state.loading = true;
        state.error = null;
        state.responseMessage = null;
      })
      .addCase(IssueReasignComment.fulfilled, (state, action) => {
        console.log("AddEvent - Fulfilled", action.payload);
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(AddNewIssue.pending, (state) => {
        console.log("AddEvent - Pending State");
        state.loading = true;
        state.error = null;
        state.responseMessage = null;
      })
      .addCase(AddNewIssue.fulfilled, (state, action) => {
        console.log("AddEvent - Fulfilled", action.payload);
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(AddNewIssue.rejected, (state, action) => {
        console.error("AddEvent - Rejected", action.payload);
        state.loading = false;
        state.error = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(IssueStatusUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(IssueStatusUpdate.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
        }
      })
      .addCase(IssueReasignUpdate.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to reassign the issue";
      })
      .addCase(IssueReasignUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(IssueReasignUpdate.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
        }
      })
      .addCase(IssueCloseUpdate.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to accept the issue";
      })
      .addCase(IssueCloseUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(IssueCloseUpdate.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
        }
      })
      .addCase(IssueStatusUpdate.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to update status";
      })
      .addCase(fetchAllissues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllissues.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchAllissues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchIssueDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssueDetails.fulfilled, (state, action) => {
        state.loading = false;
        const issueData = { ...action.payload[0] };
        state.IssueDetails = issueData;
      })
      .addCase(fetchIssueDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCommentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentDetails.fulfilled, (state, action) => {
        state.loading = false;
        const commentData = { ...action.payload[0] };
        state.CommentDetails = commentData;
      })
      .addCase(fetchCommentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDialogVisible,
  setModalLoading,
  setSelectedEvent,

  filterEvent,
  setSubmitData,
  toggleSelectedCoupon,
  setWarningMessage,
  resetState,
  toggleSelectedOffer,
  resetSelected,
  setCurrentStep,
  setSubmitLoading,
} = eventSlice.actions;

export default eventSlice.reducer;
