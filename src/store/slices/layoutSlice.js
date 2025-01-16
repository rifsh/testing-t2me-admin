import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ALL_FOOTER_MOCK_API,
  ENABLE_MOCK_API,
} from "configs/MockConfig";
import LayoutMockData from "mock/data/layoutData";
import LayoutService from "services/LayoutService";

export const initialState = {
  loading: false,
  footers: [],
  error: null,
  message: null,
  responseData: null,
  responseMessage: null,
  editable_status: null,
  pagination: { size: 10, page: 1 },
};
export const fetchAllFooter = createAsyncThunk(
  "footer/fetchAll",
  async (pageData, { rejectWithValue }) => {
    try {
      if (ALL_FOOTER_MOCK_API && ENABLE_MOCK_API) {
        const response = LayoutMockData.fetchFooterListData;
        return response.data[0];
      } else {
        console.log('afsjdjflasfaslfal');
        
        const response = await LayoutService.getAllFooter(pageData);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching offers");
    }
  }
);

export const addFooter = createAsyncThunk(
  "footer/add",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await LayoutService.addFooter(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating user");
    }
  }
);

const offerSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
  
      .addCase(fetchAllFooter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFooter.fulfilled, (state, action) => {
        state.loading = false;
        state.footers = action.payload.items;
        state.filteredFooters = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchAllFooter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFooter.pending, (state) => {
        state.createPlaceLoading = true;
        state.error = null;
      })
      .addCase(addFooter.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addFooter.rejected, (state, action) => {
        state.createPlaceLoading = false;
        state.error = action.payload.data;
      });
  },
});

export const {} = offerSlice.actions;
export default offerSlice.reducer;
