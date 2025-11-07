import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AppInfoService from "services/AppInfoService";

const initialState = {
  loading: false,
  submitting: false,
  adCategories: [],
  filteredAdCategories: [],
  responseData: null,
  appInfo: null,
  appInfoData: {},
  maintenanceData: null,
  error: null,
  message: null,
  pagination: {},
  editable_status: null,
  isModalVisible: false,
};

export const fetchAppInfo = createAsyncThunk(
  "appinfo/fetchAppInfo",
  async (_, { rejectWithValue }) => {
    try {
      console.log("FETCHING INFOS");
      const response = await AppInfoService.getInfo();
      console.log(response, "THIS IS INFO RESPONSE");

      return response;
    } catch (error) {
      return rejectWithValue("Failed to fetch FAQs");
    }
  }
);

export const updateInfo = createAsyncThunk(
  "appinfo/updateAppInfo",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AppInfoService.updateInfo(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

const AppInfoSlice = createSlice({
  name: "appinfo",
  initialState,
  reducers: {
    setModalVisible: (state, action) => {
      state.isModalVisible = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppInfo.pending, (state) => {
        console.log("fetchAllFaqs pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppInfo.fulfilled, (state, { payload }) => {
        console.log("fetchAllFaqs fulfilled", payload);
        state.loading = false;
        state.appInfo = payload;
        state.appInfoData = payload;
        state.maintenanceData = payload.details.under_maintenance;
      })
      .addCase(fetchAppInfo.rejected, (state, { payload }) => {
        console.log("fetchAllFaqs rejected", payload);
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInfo.fulfilled, (state, { payload }) => {
        state.loading = false;
        // state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          // state.responseImpactData = payload.status.data?.active_schedules;
          // state.editable_status = payload.status?.editable_status;
          // state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(updateInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setModalVisible } = AppInfoSlice.actions;

export default AppInfoSlice.reducer;
