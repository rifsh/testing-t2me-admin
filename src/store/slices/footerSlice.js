import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import FooterService from "services/FooterService";

const initialState = {
  loading: false,
  submitting: false,
  adCategories: [],
  filteredAdCategories: [],
  responseData: null,
  footerData: null,
  error: null,
  message: null,
  pagination: {},
  editable_status: null,
  singleCategory: null,
  addingSectionLoading: false,
  isModalVisible: false,
  uploadingImages: false,
};

export const fetchFooterData = createAsyncThunk(
  "footer/fetchFooterData",
  async (_, { rejectWithValue }) => {
    try {
      console.log("FETCHING FAQS");
      const response = await FooterService.getFooterData();
      return response;
    } catch (error) {
      return rejectWithValue("Failed to fetch FAQs");
    }
  }
);

export const createFooter = createAsyncThunk(
  "footer/createFooter",
  async (data, { rejectWithValue }) => {
    try {
      const response = await FooterService.createFooter(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

export const uploadImageToCdnFooter = createAsyncThunk(
  "footer/uploadImageToCdnFooter",
  async ({ file, moduleName }, { rejectWithValue }) => {
    try {
      const response = await FooterService.uploadImageToCdn(file, moduleName);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to upload image");
    }
  }
);

const FooterSlice = createSlice({
  name: "footer",
  initialState,
  reducers: {
    setModalVisible: (state, action) => {
      state.isModalVisible = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImageToCdnFooter.pending, (state) => {
        state.uploadingImages = true;
        state.error = null;
      })
      .addCase(uploadImageToCdnFooter.fulfilled, (state, { payload }) => {
        state.uploadingImages = false;
        console.log("Image uploaded successfully:", payload);
      })
      .addCase(uploadImageToCdnFooter.rejected, (state, { payload }) => {
        state.uploadingImages = false;
        state.error = payload;
      })
      .addCase(fetchFooterData.pending, (state) => {
        console.log("fetchAllFaqs pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFooterData.fulfilled, (state, { payload }) => {
        console.log("fetchAllFaqs fulfilled", payload);
        state.loading = false;
        state.footerData = payload;
      })
      .addCase(fetchFooterData.rejected, (state, { payload }) => {
        console.log("fetchAllFaqs rejected", payload);
        state.loading = false;
        state.error = payload;
      })
      .addCase(createFooter.pending, (state) => {
        state.loading = true;
      })
      .addCase(createFooter.fulfilled, (state, { payload }) => {
        state.loading = false;
        // state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          // state.responseImpactData = payload.status.data?.active_schedules;
          // state.editable_status = payload.status?.editable_status;
          // state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(createFooter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setModalVisible } = FooterSlice.actions;

export default FooterSlice.reducer;
