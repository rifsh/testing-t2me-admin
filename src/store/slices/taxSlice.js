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
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await TaxService.editTax(data, action);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

const taxSlice = createSlice({
  name: "tax",
  initialState: {
    loading: false,
    availableTaxCategory: [],
    allTax: [],
    filteredTax: [],
    error: null,
    message: null,
    responseData: null,
    responseMessage: null,
    selectedTax: null,
    singleTax: null,
    editable_status: null,
    pagination: { size: 10, page: 1 },
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
  },

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
        if (payload.message) {
          state.message = payload.message;
          state.editable_status = payload.editable_status;
        }
      })
      .addCase(editTax.rejected, (state, action) => {
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
export const { filterTax, setSelectedTaxDetails, setTaxDialogVisible, setTaxModalLoading, setEditItemId } = taxSlice.actions;
export default taxSlice.reducer;
