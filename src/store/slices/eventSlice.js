import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ALL_EVENT_MOCK_API,
  ENABLE_MOCK_API,
  EVENT_DETAILS_MOCK_API,
} from "configs/MockConfig";
import EventMockData from "mock/data/eventData";
import EventService from "services/EventService";

const initialState = {
  eventDetails: null,
  allEvents: [],
  filteredEvents: [],
  loading: false,
  error: null,
  selectedCoupons: [],
  selectedOffers: [],
  submitData: {},
  currentStep: 1,
  submitLoading: false,
};

export const fetchEventDetails = createAsyncThunk(
  "event/fetchEventDetails",
  async (_, { rejectWithValue }) => {
    try {
      if (EVENT_DETAILS_MOCK_API) {
        const response = EventMockData.fetchEventDetails;
        return response.data;
      } else {
        // const response = await EventService.fetchEventDetails();
        // return response.data;
        throw new Error("Real API not implemented.");
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
  async (data, { rejectWithValue }) => {
    try {
      const response = await EventService.addEvent(data);
      return response.data;
     
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    handleShowStatus(state, action) {
      const status = action.payload;
      if (status === "All") {
        state.filteredEvents = state.allEvents;
      } else {
        state.filteredEvents = state.allEvents.filter(
          (event) => event.status === status
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
      state.currentStep=1
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(addEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEvent.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.allEvents.push(payload);
      })
      .addCase(addEvent.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to create category";
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
  handleShowStatus,
  setSubmitData,
  toggleSelectedCoupon,
  toggleSelectedOffer,
  resetSelected,
  setCurrentStep,
  setSubmitLoading,
} = eventSlice.actions;

export default eventSlice.reducer;
