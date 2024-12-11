import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ALL_COUNTRIES_MOCK_API,
  ENABLE_MOCK_API,
  GET_PLACE_MOCK_API,
  GET_VENUE_MOCK_API,
} from "configs/MockConfig";
import LocationMockData from "mock/data/location";
import LocationService from "services/LocationService";

export const initialState = {
  loading: false,
  countries: [],
  filteredVenues: [],
  filteredPlaces: [],
  placeWithCountryList: [],
  error: null,
  venues: [],
  detailedCountryList:[],
  places: [],
  selectedVenue: null,
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
      if (ALL_COUNTRIES_MOCK_API && ENABLE_MOCK_API) {
        const response = LocationMockData.fetchAllCountries;
        return response.data;
      } else {
        const response = await LocationService.getAllCountries();
        return response.data;
      }
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
    try {
      console.log(placeData);

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
      console.log("venue data", data, "id", placeId);

      const response = await LocationService.addVenue(data, placeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add venue");
    }
  }
);

export const getVenues = createAsyncThunk(
  "locations/getVenues",
  async (place_id, { rejectWithValue }) => {
    try {
      if (GET_VENUE_MOCK_API) {
        const response = LocationMockData.getAllVenues;
        return response.data;
      } else {
        const response = await LocationService.getVenues(place_id);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);
export const getPlaces = createAsyncThunk(
  "locations/getPlaces",
  async (country_id, { rejectWithValue }) => {
    try {
      if (GET_PLACE_MOCK_API && ENABLE_MOCK_API) {
        const response = LocationMockData.getAllPlaces;
        return response.data;
      } else {
        const response = await LocationService.getPlaces(country_id);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);
export const getCoutryDetails = createAsyncThunk(
  "locations/getCountryDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await LocationService.getCoutryDetails();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
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
    setSelectedVenue(state, action) {
      state.selectedVenue = action.payload;
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
    singleVenue(state, action) {
      console.warn(action);
      state.venues.push(action.payload);
    },
    filterVenues(state, action) {
      const { searchTerm, status } = action.payload;

      let filteredVenues = state.venues; 
      if (status && status !== "All") {
        filteredVenues = filteredVenues.filter(
          (venue) =>
            (status === "Active" && venue.status === true) ||
            (status === "Inactive" && venue.status === false)
        );
      }

      if (searchTerm) {
        filteredVenues = filteredVenues.filter((venue) =>
          venue.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      state.filteredVenues = filteredVenues;
    },

    filterPlaces(state, action) {
      const { searchTerm, status } = action.payload;

      let filteredPlaces = state.places;
      if (status && status !== "All") {
        filteredPlaces = filteredPlaces.filter(
          (place) =>
            (status === "Active" && place.status === true) ||
            (status === "Inactive" && place.status === false)
        );
      }

      if (searchTerm) {
        filteredPlaces = filteredPlaces.filter((place) =>
          place.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      state.filteredPlaces = filteredPlaces;
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
      .addCase(getVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload;
        state.filteredVenues = action.payload;
      })
      .addCase(getVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCoutryDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCoutryDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload;
        state.detailedCountryList = action.payload;

      })
      .addCase(getCoutryDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlaces.fulfilled, (state, action) => {
        state.loading = false;
        state.places = action.payload;
        state.filteredPlaces = action.payload;
      })
      .addCase(getPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
  filterVenues,
  singleVenue,
  onSearch,
  setCoordinates,
  filterPlaces,
  setSelectedVenue,
} = locationSlice.actions;
export const allLocations = (state) => state.location;

export default locationSlice.reducer;
