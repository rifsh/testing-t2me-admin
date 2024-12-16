import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    ALL_EVENT_MOCK_API,
    ENABLE_MOCK_API,
    EVENT_DETAILS_MOCK_API,
  } from "configs/MockConfig";
import StaticsService from 'services/StaticsService'; // Define your service to handle API calls
import StaticsMockData from 'mock/data/staticsData'; // If you have mock data available

const initialState = {
  annualStats: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchAnnualStats = createAsyncThunk(
  "statistics/fetchAnnualStats",
  async (_, { rejectWithValue }) => {
    try {
      // Mock API call check
      if (ENABLE_MOCK_API) {
        const response = StaticsMockData.fetchAnnualStats;
        return response.data.statistics; // Return mock data if mock API is enabled
      } else {
        const response = await StaticsService.fetchAnnualStats(); // Call the actual API
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch annual statistics");
    }
  }
);


export const fetchUserStats = createAsyncThunk(
  "statistics/fetchUserStats",
  async (_, { rejectWithValue }) => {
    try {
      // Mock API call check
      if (ENABLE_MOCK_API) {
        const response = StaticsMockData.fetchUserStats;
        return response.data.statistics; // Return mock data if mock API is enabled
      } else {
        const response = await StaticsService.fetchUserStats(); // Call the actual API
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch annual statistics");
    }
  }
);

const staticsSlice = createSlice({
  name: "statics",
  initialState,
  reducers: {
    setAnnualStats(state, action) {
      state.annualStats = action.payload[0].statistics;
    },
    setMessage(state, action) {
      state.message = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnualStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnualStats.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.annualStats = payload[0].statistics;;
      })
      .addCase(fetchAnnualStats.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to fetch annual statistics";
      });
  },
});

export const { setAnnualStats, setMessage } = staticsSlice.actions;

export default staticsSlice.reducer;
