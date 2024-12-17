import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


import {
  ALL_EVENT_MOCK_API,
  ENABLE_MOCK_API,
  EVENT_DETAILS_MOCK_API,
} from "configs/MockConfig";
import EventMockData from "mock/data/eventData";
import EventService from "services/EventService";
import { ActionType } from "utils/api/warning-submit-util";
const initialState = {
  eventDetails: {},
  allEvents: [],
  filteredEvents: [],
  loading: false,
  error: null,
  selectedCoupons: [],
  selectedOffers: [],
  submitData: {},
  message: null,
  currentStep: 1,
  submitLoading: false,
  dialogVisible: false,
  modalLoading: false,
  selectedEvent: null,
  warningMessage: null,
  successResponse:null
};

export const fetchEventDetails = createAsyncThunk(
  "event/fetchEventDetails",
  async (eventId, { rejectWithValue }) => {
    try {
      if (EVENT_DETAILS_MOCK_API && ENABLE_MOCK_API) {
        const response = EventMockData.fetchEventDetails;
        return response.data;
      } else {
        const response = await EventService.fetchEventDetails(eventId);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const fetchAllEvent = createAsyncThunk(
  "event/fetchAllEvent",
  async (_, { rejectWithValue }) => {
    try {
      if (ENABLE_MOCK_API && ALL_EVENT_MOCK_API) {
        const response = EventMockData.fetchAllEvent;
        return response.data;
      } else {
        const response = await EventService.getAllEvent();
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const addEvent = createAsyncThunk(
  "event/addEvent",
  async ({ data, action }, { rejectWithValue }) => {

    
    try {
      if (action ===ActionType.SUBMIT) {console.log('actiontype', action);
      
        const response = await EventService.addEvent(data, action);
        return response.data; 
      } else if (action === ActionType.CONFIRM) {
       
        const response = await EventService.addEvent(data, action);
        return response.data;
      }
      throw new Error("Invalid action type");
    } catch (error) {
      return rejectWithValue(error.message || "Failed to process event");
    }
  }
);
export const editEvent = createAsyncThunk(
  "event/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await EventService.updateEvent(data, action);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

const eventSlice = createSlice({
  name: "event",
  initialState,
  
  reducers: {
    resetState: (state) => {
      return initialState; 
    },
    handleShowStatus: (state, action) => {
      const value = action.payload;
      if (value === "All") {
        state.filteredEvents = state.allEvents;
      } else {
        state.filteredEvents = state.allEvents.filter(
          (event) => event.status === value
        );
      }
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
    .addCase(addEvent.pending, (state) => {
      console.log("AddEvent - Pending State");
      state.loading = true;
      state.error = null;
      state.debugInfo = null;
    })
    .addCase(addEvent.fulfilled, (state, action) => {
      console.log("AddEvent - Fulfilled", action.payload);
      state.loading = false;
      state.error = null;
      state.successResponse=action.payload
      state.debugInfo = action.payload;
      
    })
    .addCase(addEvent.rejected, (state, action) => {
      console.error("AddEvent - Rejected", action.payload);
      state.loading = false;
      state.error = action.payload;
      state.debugInfo = action.payload;
    })
      .addCase(editEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editEvent.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
        }
      })
      .addCase(editEvent.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(fetchAllEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.allEvents = action.payload;
        state.filteredEvents = action.payload;
      })
      .addCase(fetchAllEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.eventDetails = action.payload[0];
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDialogVisible,
  setModalLoading,
  setSelectedEvent,
  handleShowStatus,
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
