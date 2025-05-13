import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ReportService from "../../services/AdminReportService";

export const fetchReports = createAsyncThunk(
  "report/fetchReports",
  async ({ pageData, contentType }, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchReports(pageData, contentType);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchUserReports = createAsyncThunk(
  "report/fetchUserReports",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchUserReports(pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  "report/fetchUserDetails",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchUserDetails(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const fetchMovieUserDetails = createAsyncThunk(
  "report/fetchMovieUserDetails",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await ReportService.fetchMovieUserDetails(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

const reportSlice = createSlice({
  name: "report",
  initialState: {
    reportData: null,
    loading: false,
    error: null,
    pagination: { size: 20, page: 1 },
    userReports: {
      data: null,
      loading: false,
      error: null,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
    },
    userDetails: {
      data: null,
      loading: false,
      error: null,
      pagination: { size: 10, page: 1 },
    },
    movieUserDetails: {
      data: null,
      loading: false,
      error: null,
    },
  },
  reducers: {
    setUserReportsPagination: (state, action) => {
      state.userReports.pagination = {
        ...state.userReports.pagination,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        console.log("Redux slice got payload:", action.payload);
        state.loading = false;
        state.reportData = action.payload?.[0] || null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // report - users listing

      .addCase(fetchUserReports.pending, (state) => {
        state.userReports.loading = true;
        state.userReports.error = null;
      })
      .addCase(fetchUserReports.fulfilled, (state, action) => {
        state.userReports.loading = false;
        state.userReports.data = action.payload || null;

        if (action.payload?.[0]?.pagination) {
          state.userReports.pagination = {
            ...state.userReports.pagination,
            current: action.payload[0].pagination.page,
            pageSize: action.payload[0].pagination.size,
            total: action.payload[0].pagination.total,
          };
        }
      })

      .addCase(fetchUserReports.rejected, (state, action) => {
        state.userReports.loading = false;
        state.userReports.error = action.payload || action.error.message;
      })

      //event-user-details

      .addCase(fetchUserDetails.pending, (state) => {
        state.userDetails.loading = true;
        state.userDetails.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.userDetails.loading = false;
        state.userDetails.data = action.payload || null;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.userDetails.loading = false;
        state.userDetails.error = action.payload || action.error.message;
      })

      .addCase(fetchMovieUserDetails.pending, (state) => {
        state.movieUserDetails.loading = true;
        state.movieUserDetails.error = null;
      })
      .addCase(fetchMovieUserDetails.fulfilled, (state, action) => {
        state.movieUserDetails.loading = false;
        state.movieUserDetails.data = action.payload || null;
      })
      .addCase(fetchMovieUserDetails.rejected, (state, action) => {
        state.movieUserDetails.loading = false;
        state.movieUserDetails.error = action.payload || action.error.message;
      });
  },
});

export default reportSlice.reducer;
