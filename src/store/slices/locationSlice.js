import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import LocationService from "services/LocationService";

export const initialState = {
  loading: false,
  list: [],
  error: null,
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
      });

  },
});



export const { setSearchTerm, setStatusFilter, setOptions, onSelect, onchange, onSearch } = locationSlice.actions;
export const allLocations = (state) => state.location;
export default locationSlice.reducer;
