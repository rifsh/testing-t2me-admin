import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    ALL_EVENT_MOCK_API,
    ENABLE_MOCK_API,
    EVENT_DETAILS_MOCK_API,
} from "configs/MockConfig";
import StaticsService from "services/StaticsService"; // Define your service to handle API calls
import StaticsMockData from "mock/data/staticsData"; // If you have mock data available

const initialState = {
  annualStatsForEvents: [],
  annualStatsForUsers: [], // Corrected casing to match naming convention
  loading: false,
  error: null,
  message: null,
};

// Async thunk for fetching event stats
export const fetchAnnualStatsforEvents = createAsyncThunk(
  "statistics/fetchAnnualStatsforEvents",
  async (_, { rejectWithValue }) => {
    try {
      if (ENABLE_MOCK_API) {
        const response = StaticsMockData.fetchAnnualStatsForEvents;
        return response.data; // Return mock data if mock API is enabled
      } else {
        const response = await StaticsService.fetchAnnualStatsforEvents(); // Call the actual API
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch annual statistics for events");
    }
  }
);

// Async thunk for fetching user stats
export const fetchUserStatsForUsers = createAsyncThunk(
  "statistics/fetchUserStatsForUsers",
  async (_, { rejectWithValue }) => {
    try {
      if (ENABLE_MOCK_API) {
        const response = StaticsMockData.fetchAnnualStatsForUsers;
        return response.data; // Return mock data if mock API is enabled
      } else {
        const response = await StaticsService.fetchAnnualStatsforUsers(); // Call the actual API
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch annual statistics for users");
    }
  }
);

// Slice definition
const staticsSlice = createSlice({
  name: "statics",
  initialState,
  reducers: {
    setAnnualStats(state, action) {
      state.annualStatsForEvents = action.payload[0].statistics;
    },
    setUserStats(state, action) {
      state.annualStatsForUsers = action.payload[0].statistics;
    },
    setMessage(state, action) {
      state.message = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Event stats cases
      .addCase(fetchAnnualStatsforEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnualStatsforEvents.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.annualStatsForEvents = payload[0].statistics;
      })
      .addCase(fetchAnnualStatsforEvents.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to fetch annual statistics for events";
      })
      // User stats cases
      .addCase(fetchUserStatsForUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStatsForUsers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.annualStatsForUsers = payload[0].statistics;
      })
      .addCase(fetchUserStatsForUsers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to fetch annual statistics for users";
      });
  },
});

// Export actions
export const { setAnnualStats, setUserStats, setMessage } = staticsSlice.actions;

// Export reducer
export default staticsSlice.reducer;
