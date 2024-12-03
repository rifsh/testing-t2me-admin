import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ALL_COUNTRIES_MOCK_API } from "configs/MockConfig";
import LocationMockData from "mock/data/location";
import LocationService from "services/LocationService";

export const initialState = {
  loading: false,
  countries: [],
  placeWithCountryList: [],
  error: null,
  venues: [],
  coordinates: { lat: 23.4241, lng: 53.8478 },
  options: [],
  searchTerm: "",
  statusFilter: "All",
  selectedCountry: null,
  createPlaceLoading: false,
};

export const fetchAllCountires = createAsyncThunk(
  "country/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      if (ALL_COUNTRIES_MOCK_API) {
        const response = LocationMockData.fetchAllCountries;
        return response.data;
      }else{
      const response = await LocationService.getAllCountries();
      return response.data;}
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching Countries"
      );
    }
  }
);

export const createPlace = createAsyncThunk(
  "place/create",
  async (placeData, { rejectWithValue }) => {
    try {console.log(placeData);
    
      const response = await LocationService.addPlace(placeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating user");
    }
  }
);

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
  async ({ data, placeId }, { rejectWithValue }) => { 
    try {
      console.log('venue data', data, 'id', placeId);
      
      const response = await LocationService.addVenue(data, placeId);
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
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
    },
    setOptions(state, action) {
      state.options = action.payload;
    },
    onSelect(state, action) {
      state.selectedCountry = action.payload;
      console.log("Selected country:", action.payload);
    },
    onchange(state, action) {
      state.searchTerm = action.payload;
    },
    onSearch(state, action) {
      const filteredOptions = state.countries
        .filter((item) =>
          `${item.code}, ${item.country}`
            .toLowerCase()
            .includes(action.payload.toLowerCase())
        )
        .map((item) => ({ value: `${item.code}, ${item.country}` }));

      state.options = filteredOptions;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCountires.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCountires.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload;
      })
      .addCase(fetchAllCountires.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //place create case
      .addCase(createPlace.pending, (state) => {
        state.createPlaceLoading = true;
        state.error = null;
      })
      .addCase(createPlace.fulfilled, (state, action) => {
        state.createPlaceLoading = false;
        state.countries.push(action.payload);
      })
      .addCase(createPlace.rejected, (state, action) => {
        state.createPlaceLoading = false;
        state.error = action.payload;
      })
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

export const {
  setSearchTerm,
  setStatusFilter,
  setOptions,
  onSelect,
  onchange,
  onSearch,
  setCoordinates,
} = locationSlice.actions;
export const allLocations = (state) => state.location;
export default locationSlice.reducer;
