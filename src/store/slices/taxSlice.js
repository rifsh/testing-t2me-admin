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
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await TaxService.fetchAllTax(pageData);
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
export const editTax = createAsyncThunk(
  "tax/edit",
  async ({ data, action ,pageData}, { rejectWithValue }) => {
    try {
      const response = await TaxService.editTax(data, action,pageData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

export const editTaxStatus = createAsyncThunk(
  "tax/editStatus",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await TaxService.editTaxStatus(data, action, pageData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

export const validateTax = createAsyncThunk(
  "tax/validate",
  async (taxIds, { rejectWithValue }) => {
    try {
      const response = await TaxService.validateTax(taxIds);

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);

const taxSlice = createSlice({
  name: "tax",
  initialState: {
    loading: false,
    responseImpactData: null,
    availableTaxCategory: [],
    allTax: [],
    filteredTax: [],
    error: null,
    message: null,
    responseData: null,
    responseMessage: null,
    selectedTax: [],
    singleTax: null,
    editable_status: null,
    validationStatus: false,
    taxValidationDialogVisible: false,
    ValidateData: null,
    pagination: { size: 10, page: 1 },
    warningPagination: { size: 10, page: 1 },
    editItemId: null,
  },
  reducers: {
    filterTax: (state, action) => {
      const { searchTerm, status } = action.payload;

      let filteredTax = state.allTax;
      if (status && status !== "All") {
        filteredTax = filteredTax.filter(
          (offer) =>
            (status === "Active" && offer.status === true) ||
            (status === "Inactive" && offer.status === false)
        );
      }

      if (searchTerm) {
        filteredTax = filteredTax.filter((tax) => {
          if (!tax.tax_name) return false;
          return tax.tax_name.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      state.filteredTax = filteredTax;
    },
    setSelectedTaxDetails: (state, action) => {
      state.selectedTax = action.payload;
    },
    setEditItemId: (state, action) => {
      state.editItemId = action.payload;
    },
    setTaxDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setTaxModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
    setTaxValidationDialogVisible(state, action) {
      state.taxValidationDialogVisible = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(validateTax.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateTax.fulfilled, (state, { payload }) => {
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
      .addCase(validateTax.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to validate place";
      })
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
        state.filteredTax = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchAllTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editTax.pending, (state) => {
        state.loading = true;
      })
      .addCase(editTax.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editTaxStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editTaxStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editTaxStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
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
export const {
  filterTax,
  setSelectedTaxDetails,
  setTaxDialogVisible,
  setTaxModalLoading,
  setEditItemId,
  setTaxValidationDialogVisible,
} = taxSlice.actions;
export default taxSlice.reducer;
