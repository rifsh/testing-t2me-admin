import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import S3CloudflareService from "services/S3CloudflareService";

const initialState = {
  loading: false,
  s3CloudflareData: null,
  error: null,
  message: null,
};

export const deleteS3Image = createAsyncThunk(
  "s3Cloudflare/deleteImage",
  async (params, { rejectWithValue }) => {
    try {
      console.log("FETCHING FAQS");
      const response = await S3CloudflareService.deleteImage(params);
      return response;
    } catch (error) {
      return rejectWithValue("Failed to fetch FAQs");
    }
  }
);

const S3CloudflareSlice = createSlice({
  name: "s3Cloudflare",
  initialState,
  reducers: {
    setModalVisible: (state, action) => {
      state.isModalVisible = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteS3Image.pending, (state) => {
        console.log("fetchAllFaqs pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteS3Image.fulfilled, (state, { payload }) => {
        console.log("fetchAllFaqs fulfilled", payload);
        state.loading = false;
        state.s3CloudflareData = payload;
      })
      .addCase(deleteS3Image.rejected, (state, { payload }) => {
        console.log("fetchAllFaqs rejected", payload);
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setModalVisible } = S3CloudflareSlice.actions;

export default S3CloudflareSlice.reducer;
