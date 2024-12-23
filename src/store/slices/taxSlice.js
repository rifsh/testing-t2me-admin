import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import TaxService from "services/TaxService";

export const fetchAvailableCategory = createAsyncThunk(
  "tax/fetchAvailableCategory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await TaxService.fetchAvailableTaxCategory();
      return response.data[0].available_category;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchAllTax = createAsyncThunk(
  "tax/fetchAllTax",
  async (data, { rejectWithValue }) => {
    try {
      const response = await TaxService.fetchAllTax(data);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTax = createAsyncThunk(
  "tax/addTax",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await TaxService.addTax(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const taxSlice = createSlice({
  name: "tax",
  initialState: {
    loading: false,
    availableTaxCategory: [],
    allTax: [],
    error: null,
    responseData: null,
    responseMessage: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.availableTaxCategory = action.payload;
      })
      .addCase(fetchAvailableCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllTax.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTax.fulfilled, (state, action) => {
        state.loading = false;
        state.allTax = action.payload.items;
      })
      .addCase(fetchAllTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTax.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTax.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default taxSlice.reducer;
