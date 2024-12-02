import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ALL_CATEGORY_MOCK_API } from "configs/MockConfig";
import { SUB_CATEGORY_URL } from "constants/ApiConstant";
import CategoryMockData from "mock/data/categoryData";
import CategoryService from "services/CategoryService";

const initialState = {
  loading: false,
  categories: [],
  activeTab: "categories",
  subcategories: [],
  filteredCategories: [],
  searchTerm: "",
  selectedCategoryId: null,
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
// Fetch categories
export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      if (ALL_CATEGORY_MOCK_API) {
        const response =  CategoryMockData.fetchAllCategory;        
        return response.data;
      } else {
        const response = await CategoryService.fetchCategory();
        return response.data;
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
      if (SUB_CATEGORY_URL) {
       
        const response = CategoryMockData.fetchSubCategory;
        const subCategory = response.data.filter(
          (subcategory) => subcategory.category_id === categoryId
        );
        return { categoryId, subcategories: subCategory };
      }

      const response = await CategoryService.fetchSubCategory(categoryId);
      return { categoryId, subcategories: response.data };
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
      .addCase(addCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories.push(payload);
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
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.filteredCategories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch categories";
      })
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        const { categoryId, subcategories } = action.payload;
        state.loading = false;
        state.selectedCategoryId = categoryId;
        state.subcategories = subcategories;
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch categories";
      });
  },
});

export const { setSearchTerm, setActiveTab, clearSubcategories } =
  categorySlice.actions;

export default categorySlice.reducer;
