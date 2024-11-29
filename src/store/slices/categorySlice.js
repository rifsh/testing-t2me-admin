import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CategoryService from "services/CategoryService";

export const initialState = {
  loading: false,
  categories: [],
  filteredCategories: [],
  error: null,
};

export const addCategory = createAsyncThunk(
  "category/add",
  async (data, { rejectWithValue }) => {
    try {
      const response = await CategoryService.addCategory(data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add category";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCategory = createAsyncThunk(
  "category/list",
  async (_, { rejectWithValue }) => {
    try {
      const response = await CategoryService.fetchCategory();
      console.log(response,"------------------")

      if (Array.isArray(response)) {
        return response.data;
      } else {
        return rejectWithValue("Invalid response data");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch categories";
      return rejectWithValue(errorMessage);
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.filteredCategories = state.categories.filter((cat) =>
        cat.name.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories.push(payload);
      })
      .addCase(addCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to create category";
      })
      .addCase(fetchCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch categories";
      });
  },
});

export const { clearError } = categorySlice.actions;
export const { setSearchTerm } = categorySlice.actions;
export default categorySlice.reducer;
