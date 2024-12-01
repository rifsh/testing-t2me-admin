import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import LocationService from "services/LocationService";

export const initialState = {
  loading: false,
  locations: [],
  filteredLocations: [],
  placeWithCountryList: [],
  error: null,
  venues:[]
};

export const fetchPlaceWithCountry = createAsyncThunk(
  "place/fetchPlaceWithCountry",
  async (place, { rejectWithValue }) => {
    try {
      const response = await LocationService.placeWithCountry(place);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);
export const addVenue = createAsyncThunk(
  "place/addVenue",
  async (data, { rejectWithValue }) => {
    try {
      const response = await LocationService.addVenue(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaceWithCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaceWithCountry.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.placeWithCountryList = payload;
      })
      .addCase(fetchPlaceWithCountry.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to fetch places";
      })
      .addCase(addVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVenue.fulfilled, (state, { payload }) => {
        state.loading = false;
        const categoryIndex = state.venues.findIndex(
          (cat) => cat.id === payload.venueId
        );
        if (categoryIndex !== -1) {
          state.venues[categoryIndex].subcategories.push(payload);
        } else {
          state.subcategories.push(payload); 
        }
      })
      .addCase(addVenue.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to add subcategory";
      })
      ;
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
