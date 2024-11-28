import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CategoryService from "services/CategoryService";

export const initialState = {
  loading: false,
  categories: [],
  error: null,
}; 

export const addCategory = createAsyncThunk(
  "category/add",
  async (data, { rejectWithValue }) => {
    const { title, descr } = data
    try {
      const response = await CategoryService.addCategory(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to add category");
    }
  }
);

export const fetchCategory = createAsyncThunk(
  "category/list",
  async (_, { rejectWithValue }) => {
    
    try {
      const response = await CategoryService.fetchCategory();
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch categories"
      );
    }
  }
);
const categorySlice = createSlice({
  name: "category",
  initialState: {
    loading: false,
    categories: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories.push(payload);
      })
      .addCase(addCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      .addCase(fetchCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories = payload;
      })
      .addCase(fetchCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export default categorySlice.reducer;
