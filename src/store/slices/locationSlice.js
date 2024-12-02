import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import LocationService from "services/LocationService";

export const initialState = {
  loading: false,
  list: [],
  placeWithCountryList: [],
  error: null,
  venues: [],
  options: [],
  searchTerm: "",
  statusFilter: "All",
  selectedCountry: null,
  createPlaceLoading: false,
};

export const fetchAllCountires = createAsyncThunk('country/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await LocationService.getAllCountries();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Error fetching Countries");
  }
});

export const createPlace = createAsyncThunk('place/create', async (placeData, { rejectWithValue }) => {
  try {
    const response = await LocationService.createPlace(placeData);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Error creating user");
  }
});

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

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
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
      state.selectedCountry = action.payload
      console.log("Selected country:", action.payload);
    },
    onchange(state, action) {
      state.searchTerm = action.payload;
    },
    onSearch(state, action) {
      const filteredOptions = state.list.filter(
        (item) => `${item.code}, ${item.country}`.toLowerCase().includes(action.payload.toLowerCase())
      ).map((item) => ({ value: `${item.code}, ${item.country}`, }))

      state.options = filteredOptions;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCountires.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCountires.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
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
        state.list.push(action.payload);
      })
      .addCase(createPlace.rejected, (state, action) => {
        state.createPlaceLoading = false;
        state.error = action.payload;
      })

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
      });

  },
});



export const { setSearchTerm, setStatusFilter, setOptions, onSelect, onchange, onSearch } = locationSlice.actions;
export const allLocations = (state) => state.location;
export default locationSlice.reducer;
