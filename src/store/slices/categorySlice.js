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
  responseImpactData: null,
  filteredCategories: [],
  filteredSubCategories: [],
  searchTerm: "",
  responseData: null,
  responseMessage: null,
  selectedCategoryId: null,
  error: null,
  message: null,
  subPagination: {},
  pagination: {},
  editable_status: null,
  singleCategory: null,
  singleSubcategory: null,
  warningPagination: { page: 1, size: 10 },
  editItemId: null,
  selectedCat: null,
  validationStatus: false,
  ValidateData: null,
  categoryValidationDialogVisible: false,
};

export const validateCategory = createAsyncThunk(
  "category/validation",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await CategoryService.validateCategory(categoryId);

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);

export const validateSubCategory = createAsyncThunk(
  "subCategory/validation",
  async (subCategoryId, { rejectWithValue }) => {
    try {
      const response = await CategoryService.validateSubCategory(subCategoryId);

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);

export const addCategory = createAsyncThunk(
  "category/add",
  async ({ data, action }, { rejectWithValue }) => {
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
  async (pageData, { rejectWithValue }) => {
    try {
      if (ALL_CATEGORY_MOCK_API) {
        const response = CategoryMockData.fetchAllCategory;
        return response.data;
      } else {
        const response = await CategoryService.fetchCategory(pageData);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue("Failed to fetch categories");
    }
  }
);
export const getSingleCateory = createAsyncThunk(
  "category/getSingleCateory",
  async (category_id, { rejectWithValue }) => {
    try {
      if (ALL_CATEGORY_MOCK_API) {
        const response = CategoryMockData.fetchAllCategory;
        return response.data;
      } else {
        const response = await CategoryService.getSingleCateory(category_id);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue("Failed to fetch single categories");
    }
  }
);
export const getSingleSubCateory = createAsyncThunk(
  "category/getSingleSubCateory",
  async (subcategory_id, { rejectWithValue }) => {
    try {
      if (ALL_CATEGORY_MOCK_API) {
        const response = CategoryMockData.fetchAllCategory;
        return response.data;
      } else {
        const response = await CategoryService.getSingleSubCateory(
          subcategory_id
        );
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue("Failed to fetch single categories");
    }
  }
);
export const fetchSubcategories = createAsyncThunk(
  "category/fetchSubcategories",
  async (pageData, { rejectWithValue }) => {
    try {
      if (SUB_CATEGORY_MOCK_API) {
        const response = CategoryMockData.fetchSubCategory;
        const subCategory = response.data.filter(
          (subcategory) => subcategory.category_id === pageData.category_id
        );
        return { categoryId: pageData.category_id, subcategories: subCategory };
      }

      const response = await CategoryService.fetchSubCategory(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue("Failed to fetch subcategories");
    }
  }
);

export const addSubCategory = createAsyncThunk(
  "category/addSubCategory",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await CategoryService.addSubCategory(data, action);
      console.log("response data", response);

      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add subcategory";
      return rejectWithValue(errorMessage);
    }
  }
);
export const editCategory = createAsyncThunk(
  "category/editCategory",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await CategoryService.editCategory(
        data,
        action,
        pageData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);
export const editCategoryStatus = createAsyncThunk(
  "category/editCategoryStatus",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await CategoryService.editCatStatus(
        data,
        action,
        pageData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);
export const editSubCategory = createAsyncThunk(
  "category/editSubCategory",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await CategoryService.editSubCategory(
        data,
        action,
        pageData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update category");
    }
  }
);
export const editSubCategoryStatus = createAsyncThunk(
  "category/editSubCategoryStatus",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await CategoryService.editSubCatStatus(
        data,
        action,
        pageData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    filterCategory: (state, action) => {
      const { searchTerm, type } = action.payload;

      if (type === "category") {
        state.filteredCategories = state.categories.filter((category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else if (type === "subCategory") {
        state.filteredSubCategories = state.subcategories.filter(
          (subCategory) =>
            subCategory.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    },

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
    setCategoryValidationDialogVisible(state, action) {
      state.categoryValidationDialogVisible = action.payload;
    },
    clearSubcategories: (state) => {
      state.subcategories = [];
      state.selectedCategoryId = null;
    },
    setSelectedCatDetails: (state, action) => {
      state.selectedCat = action.payload;
    },
    setEditItemId: (state, action) => {
      state.editItemId = action.payload;
    },
    setCatDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setCatModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        console.log("HELOOOOOOOOOO");

        if (payload.message === "warning") {
          state.validationStatus = false;
          state.message = payload.status.message;
          state.ValidateData = payload.status.data;
          console.log(payload.status.data, "DATAAAAAAA IN PAYLOAD");
          state.editable_status = payload.status.editable_status;
        } else if (payload.data) {
          state.validationStatus = payload.data[0].validation_status;
          if (payload.status) {
            state.message = payload.status.message;
          }
        }
      })
      .addCase(validateCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to validate place";
      })
      .addCase(validateSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateSubCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        console.log("HELOOOOOOOOOO");

        if (payload.message === "warning") {
          state.validationStatus = false;
          state.message = payload.status.message;
          state.ValidateData = payload.status.data;
          console.log(payload.status.data, "DATAAAAAAA IN PAYLOAD");
          state.editable_status = payload.status.editable_status;
        } else if (payload.data) {
          state.validationStatus = payload.data[0].validation_status;
          if (payload.status) {
            state.message = payload.status.message;
          }
        }
      })
      .addCase(validateSubCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to validate place";
      })
      .addCase(getSingleCateory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleCateory.fulfilled, (state, action) => {
        state.loading = false;
        state.singleCategory = action.payload;
      })
      .addCase(getSingleCateory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSingleSubCateory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleSubCateory.fulfilled, (state, action) => {
        state.loading = false;
        state.singleSubcategory = action.payload;
      })
      .addCase(getSingleSubCateory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
        state.responseMessage = null;
      })
      .addCase(addSubCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;

        // ✅ Store response data and message properly
        state.responseData = payload.data;
        state.responseMessage =
          payload.status?.message || "Subcategory added successfully";

        // Optional: Update local state if needed
        const categoryIndex = state.categories.findIndex(
          (cat) => cat.id === payload.data?.[0]?.category_id
        );
        if (categoryIndex !== -1 && payload.data?.[0]) {
          state.categories[categoryIndex].subcategories =
            state.categories[categoryIndex].subcategories || [];
          state.categories[categoryIndex].subcategories.push(payload.data[0]);
        }
      })
      .addCase(addSubCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to add subcategory";
        state.responseMessage = null;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories = payload.items;
        state.filteredCategories = payload.items;
        state.pagination = payload;
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
        state.filteredSubCategories = payload.items;
        state.subPagination = payload;
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
          state.editable_status = payload.editable_status;
        }
      })
      .addCase(updateCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(editCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(editCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editCategoryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCategoryStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editCategoryStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(editSubCategoryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSubCategoryStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editSubCategoryStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(editSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSubCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editSubCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      });
  },
});

export const {
  filterCategory,
  setActiveTab,
  clearSubcategories,
  setSelectedCatDetails,
  setCatDialogVisible,
  setCatModalLoading,
  setEditItemId,
  setCategoryValidationDialogVisible,
} = categorySlice.actions;

export default categorySlice.reducer;
