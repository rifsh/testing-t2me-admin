import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import OrgUpdateService from "services/OrgUpdateService";
import OrgUpdateMockData from "mock/data/orgUpdates";
import {
  ALL_UPDATES_MOCK_API,
  ENABLE_MOCK_API,
  SINGLE_UPDATE_MOCK_API,
} from "configs/MockConfig";

export const initialState = {
  loading: false,
  updates: [],
  filteredUpdates: [],
  detailedUpdates: [],
  singleUpdate: null,
  selectedUpdate: null,
  error: null,
  message: null,
  pagination: { size: 10, page: 1 },
};

export const fetchAllUpdates = createAsyncThunk(
  "orgUpdates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      if (ALL_UPDATES_MOCK_API && ENABLE_MOCK_API) {
        const response = OrgUpdateMockData.fetchAllUpdates;
        return response.data;
      } else {
        const response = await OrgUpdateService.getAllUpdates();
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching updates");
    }
  }
);

export const fetchSingleUpdate = createAsyncThunk(
  "orgUpdates/fetchSingle",
  async (updateId, { rejectWithValue }) => {
    try {
      if (SINGLE_UPDATE_MOCK_API && ENABLE_MOCK_API) {
        const response = OrgUpdateMockData.singleUpdate;
        return response.data;
      } else {
        const response = await OrgUpdateService.getSingleUpdate(updateId);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching update");
    }
  }
);

export const createUpdate = createAsyncThunk(
  "orgUpdates/create",
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await OrgUpdateService.createUpdate(updateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating update");
    }
  }
);

export const editUpdate = createAsyncThunk(
  "orgUpdates/edit",
  async ({ updateId, updateData }, { rejectWithValue }) => {
    try {
      const response = await OrgUpdateService.editUpdate(updateId, updateData);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error editing update");
    }
  }
);

const orgUpdatesSlice = createSlice({
  name: "orgUpdates",
  initialState,
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    setSelectedUpdate(state, action) {
      state.selectedUpdate = action.payload;
    },
    filterUpdates(state, action) {
      const { searchTerm } = action.payload;
      state.filteredUpdates = state.updates.filter((update) =>
        update.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    setPagination(state, action) {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUpdates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUpdates.fulfilled, (state, action) => {
        state.loading = false;
        state.updates = action.payload.items;
        state.filteredUpdates = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllUpdates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSingleUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.singleUpdate = action.payload;
      })
      .addCase(fetchSingleUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.message = "Update created successfully!";
      })
      .addCase(createUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editUpdate.fulfilled, (state) => {
        state.loading = false;
        state.message = "Update edited successfully!";
      })
      .addCase(editUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchTerm,
  setSelectedUpdate,
  filterUpdates,
  setPagination,
} = orgUpdatesSlice.actions;

export default orgUpdatesSlice.reducer;

