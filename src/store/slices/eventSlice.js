import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ALL_EVENT_MOCK_API, EVENT_DETAILS_MOCK_API } from "configs/MockConfig";
import EventMockData from "mock/data/eventData";
import EventService from "services/EventService";
import Utils from "utils";

const initialState = {
  eventDetails: null,
  allEvents: [],
  filteredEvents: [],
  loading: false,
  error: null,
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
      if (ALL_EVENT_MOCK_API) {
        const response = EventMockData.fetchAllEvent;
        return response.data;
      } else {
        const response = await EventService.fetchAllEvents();
        return response.data;
        }
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
      if (status === 'All') {
        state.filteredEvents = state.allEvents;  
      } else {
        state.filteredEvents = state.allEvents.filter(event => event.status === status);
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAllEvent.pending, state => {
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
      .addCase(fetchEventDetails.pending, state => {
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

export const { handleShowStatus } = eventSlice.actions;

export default eventSlice.reducer;
