import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { EVENT_DETAILS_MOCK_API } from "configs/MockConfig";
import EventMockData from "mock/data/eventData";

const initialState = {
  eventDetails: null,
  loading: false,
  error: null,
};

// Fetch event details
export const fetchEventDetails = createAsyncThunk(
  "event/fetchEventDetails",
  async (_, { rejectWithValue }) => {
    try {
      if (EVENT_DETAILS_MOCK_API) {
        const response = EventMockData.fetchEventDetails;
        return response.data;
      } else {
        // Uncomment and use real API service if needed
        // const response = await EventService.fetchEventDetails();
        // return response.data;
        throw new Error("Real API not implemented.");
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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

export default eventSlice.reducer;
