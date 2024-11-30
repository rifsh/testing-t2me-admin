import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import LocationService from "services/LocationService";


export const initialState = {
  loading: false,
  locations: [],
  filteredLocations: [],
  error: null,
};

export const addLocation = createAsyncThunk(
  "category/add",
  async (data, { rejectWithValue }) => {
    try {
      const response = await LocationService.addLocation(data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add category";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchLocation = createAsyncThunk(
  "category/list",
  async (_, { rejectWithValue }) => {
    try {
      const response = await LocationService.fetchLocation();

      if (Array.isArray(response.data)) {
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
  name: "locations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.filteredLocations = state.locations.filter((cat) =>
        cat.name.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addLocation.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.locations.push(payload);
      })
      .addCase(addLocation.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to create category";
      })
      .addCase(fetchLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch categories";
      });
  },
});

export const { clearError } = categorySlice.actions;
export const { setSearchTerm } = categorySlice.actions;
export default categorySlice.reducer;
