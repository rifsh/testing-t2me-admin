import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AdCategoryService from "services/AdCategoryService";
import AdCategoryMockData from "mock/data/adCategoryData";
import {
  ADVERTISEMENT_ALL_CATEGORY_MOCK_API,
} from "configs/MockConfig";

const initialState = {
  loading: false,
  adCategories: [],
  filteredAdCategories: [],
  searchTerm: "",
  responseData: null,
  selectedAdCategory: null,
  responseMessage: null,
  selectedCategoryId: null,
  error: null,
  message: null,
  subPagination: {},
  pagination: {},
  editable_status: null,
  singleCategory: null,
};

export const addAdCategory = createAsyncThunk(
  "adCategory/add",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      console.log("Request Data:", data);
      console.log("Action Type:", action);
      const response = await AdCategoryService.addAdCategory(data, action);
      console.log("Response:", response);
      return response;
    } catch (err) {
      console.log("Error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to add category";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateAdCategory = createAsyncThunk(
  "adCategory/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await AdCategoryService.updateAdCategory(data, action);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update category");
    }
  }
);

export const fetchAdCategories = createAsyncThunk(
  "adCategory/fetchAdCategories",
  async (pageData, { rejectWithValue }) => {
    try {
      if (ADVERTISEMENT_ALL_CATEGORY_MOCK_API) {
        const response = AdCategoryMockData.fetchAllCategory;
        return response.data;
      } else {
        const response = await AdCategoryService.fetchAdCategory(pageData);
        console.log("-----------Fetching categories",response.data[0])
        return response.data[0];
      }
    } catch (error) {
      console.log(error,"-------------")
      return rejectWithValue("Failed to fetch categories");
    }
  }
);

const AdcategorySlice = createSlice({
  name: "adCategory",
  initialState,
  reducers: {
    setAdCategoryDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setAdCategoryModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
    setSelectedAdCategory(state, action) {
      state.selectedAdCategory = action.payload;
    },
    filterCategory: (state, action) => {
      const { searchTerm, type } = action.payload;

      if (type === "category") {
        state.filteredAdCategories = state.adCategories.filter((category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    },

    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.filteredAdCategories = state.adCategories.filter((cat) =>
        cat.name.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addAdCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAdCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addAdCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to create category";
      })
      .addCase(fetchAdCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.adCategories = payload.items;
        state.filteredAdCategories = payload.items;
        state.pagination = payload;
      })
      .addCase(fetchAdCategories.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateAdCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
          state.editable_status = payload.editable_status;
        }
      })
      .addCase(updateAdCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })

  },
});

export const { filterCategory, setAdCategoryDialogVisible,
  setAdCategoryModalLoading, setSelectedAdCategory } =
  AdcategorySlice.actions;

export default AdcategorySlice.reducer;
