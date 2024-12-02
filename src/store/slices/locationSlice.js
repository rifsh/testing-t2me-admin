import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import LocationService from "services/LocationService";

export const initialState = {
  loading: false,
  placeWithCountryList: [],
  coordinates: { lat: 23.4241, lng: 53.8478 },
  error: null,
};

export const fetchPlaceWithCountry = createAsyncThunk(
  "locations/fetchPlaceWithCountry",
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
  "locations/addVenue",
  async (data, { rejectWithValue }) => {
    try {
      const response = await LocationService.addVenue(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add venue");
    }
  }
);

const locationSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    setCoordinates: (state, action) => {
      state.coordinates = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaceWithCountry.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlaceWithCountry.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.placeWithCountryList = payload;
      })
      .addCase(fetchPlaceWithCountry.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(addVenue.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addVenue.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setCoordinates } = locationSlice.actions;
export default locationSlice.reducer;
