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
  events: [],
  filteredEvents: [],
  loading: false,
  error: null,
  selectedCoupons: [],
  selectedOffers: [],
  validationData: [],
  submitData: {},
  message: null,
  currentStep: 1,
  submitLoading: false,
  dialogVisible: false,
  modalLoading: false,
  selectedEvent: null,
  warningMessage: null,
  responseData: null,
  responseMessage: null,
  editable_status: null,
  pagination: {},
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
  async (pageData, { rejectWithValue }) => {
    try {
      if (ENABLE_MOCK_API && ALL_EVENT_MOCK_API) {
        const response = EventMockData.fetchAllEvent;
        return response.data;
      } else {
        const response = await EventService.getAllEvent(pageData);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);
export const checkEventValidation = createAsyncThunk(
  "event/validation",
  async (_, { rejectWithValue }) => {
    try {
      const response = await EventService.checkValidation();
      if (response.status.status_code === "00000") {
        return response.data;
      } else {
        return rejectWithValue(
          response.status.message ||
            "Event validation failed. Please try again."
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to validate event. Please try again."
      );
    }
  }
);

export const addEvent = createAsyncThunk(
  "event/addEvent",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await EventService.addEvent(data, action);
      return response;
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
      .addCase(addEvent.pending, (state) => {
        console.log("AddEvent - Pending State");
        state.loading = true;
        state.error = null;
        state.responseMessage = null;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        console.log("AddEvent - Fulfilled", action.payload);
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addEvent.rejected, (state, action) => {
        console.error("AddEvent - Rejected", action.payload);
        state.loading = false;
        state.error = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(editEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editEvent.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
          state.editable_status = payload.editable_status;
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
        state.events = action.payload.items;
        state.filteredEvents = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchAllEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkEventValidation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkEventValidation.fulfilled, (state, action) => {
        state.loading = false;
        state.validationData = action.payload;
      })
      .addCase(checkEventValidation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.loading = false;
        const eventData = { ...action.payload[0] };

        const uniqueOffers = eventData.event_offers.reduce((acc, current) => {
          const isDuplicate = acc.find(
            (item) => item.offer.id === current.offer.id
          );
          if (!isDuplicate) {
            acc.push(current);
          }
          return acc;
        }, []);

        const uniqueCoupons = eventData.event_coupons.reduce((acc, current) => {
          const isDuplicate = acc.find(
            (item) => item.coupons.id === current.coupons.id
          );
          if (!isDuplicate) {
            acc.push(current);
          }
          return acc;
        }, []);

        eventData.event_offers = uniqueOffers;
        eventData.event_coupons = uniqueCoupons;

        state.eventDetails = eventData;
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
