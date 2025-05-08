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

const reportSlice = createSlice({
  name: "report",
  initialState: {
    reportData: null,
    loading: false,
    error: null,
  },
  reducers: {},
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
      });
  },
});

export default reportSlice.reducer;
