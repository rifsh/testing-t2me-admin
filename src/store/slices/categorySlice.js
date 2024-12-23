import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ALL_CATEGORY_MOCK_API,
  SUB_CATEGORY_MOCK_API,
} from "configs/MockConfig";
import CategoryMockData from "mock/data/categoryData";
import CategoryService from "services/CategoryService";

const initialState = {
  loading: false,
  categories: [],
  activeTab: "categories",
  subcategories: [],
  filteredCategories: [],
  searchTerm: "",
  responseData:null,
  responseMessage:null,
  selectedCategoryId: null,
  error: null,
  message: null,
};
export const addCategory = createAsyncThunk(
  "category/add",
  async ({data, action}, { rejectWithValue }) => {
    try {
      const response = await CategoryService.addCategory(data, action);
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add category";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await CategoryService.updateCategory(data, action);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update category");
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      if (ALL_CATEGORY_MOCK_API) {
        const response = CategoryMockData.fetchAllCategory;
        return response.data;
      } else {
        const response = await CategoryService.fetchCategory();
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue("Failed to fetch categories");
    }
  }
);

export const fetchSubcategories = createAsyncThunk(
  "category/fetchSubcategories",
  async (categoryId, { rejectWithValue }) => {
    try {
      if (SUB_CATEGORY_MOCK_API) {
        const response = CategoryMockData.fetchSubCategory;
        const subCategory = response.data.filter(
          (subcategory) => subcategory.category_id === categoryId
        );
        return { categoryId, subcategories: subCategory };
      }

      const response = await CategoryService.fetchSubCategory(categoryId);
      return response.data[0];
    } catch (error) {
      return rejectWithValue("Failed to fetch subcategories");
    }
  }
);

export const addSubCategory = createAsyncThunk(
  "category/addSubCategory",
  async ({ data, categoryId }, { rejectWithValue }) => {
    try {
      const response = await CategoryService.addSubCategory(data, categoryId);
      console.log("response data", response);

      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add subcategory";
      return rejectWithValue(errorMessage);
    }
  }
);
export const editSubCategory = createAsyncThunk(
  "category/editSubCategory",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await CategoryService.editSubCategory(data, action);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update category");
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.filteredCategories = state.categories.filter((cat) =>
        cat.name.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      if (action.payload === "categories") {
        state.selectedCategoryId = null;
      }
    },
    clearSubcategories: (state) => {
      state.subcategories = [];
      state.selectedCategoryId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to create category";
      })
      .addCase(addSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        const categoryIndex = state.categories.findIndex(
          (cat) => cat.id === payload.categoryId
        );
        if (categoryIndex !== -1) {
          state.categories[categoryIndex].subcategories.push(payload);
        } else {
          state.subcategories.push(payload);
        }
      })
      .addCase(addSubCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to add subcategory";
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories = payload.items;
        state.filteredCategories = payload.items;
      })
      .addCase(fetchCategories.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.subcategories = payload.items;
      })
      .addCase(fetchSubcategories.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
        }
      })
      .addCase(updateCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(editSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSubCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
        }
      })
      .addCase(editSubCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      });
  },
});

export const { setSearchTerm, setActiveTab, clearSubcategories } =
  categorySlice.actions;

export default categorySlice.reducer;
