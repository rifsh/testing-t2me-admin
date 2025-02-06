import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ALL_COUNTRIES_MOCK_API,
  ENABLE_MOCK_API,
  GET_PLACE_MOCK_API,
  GET_SINGLE_VENUE_MOCK_API,
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
  singleVenues: null,
  singlePlace: null,
  venues: [],
  detailedCountryList: [],
  places: [],
  selectedVenue: null,
  selectedPlace: null,
  coordinates: { lat: 23.4241, lng: 53.8478 },
  options: [],
  message: null,
  responseImpactData: null,
  searchTerm: "",
  statusFilter: "All",
  selectedCountry: null,
  createPlaceLoading: false,
  responseData: null,
  responseMessage: null,
  editable_status: null,
  validationStatus: false,
  ValidateData: null,
  placeValidationDialogVisible: false,
  pagination: { size: 10, page: 1 },
  editItemId: null,
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
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await LocationService.addPlace(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating user");
    }
  }
);
export const editPlace = createAsyncThunk(
  "place/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await LocationService.editPlace(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);
export const editPlaceStatus = createAsyncThunk(
  "place/editStatus",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await LocationService.editPlaceStatus(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);
export const editVenueStatus = createAsyncThunk(
  "venue/editStatus",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await LocationService.editVenueStatus(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);
export const editVenue = createAsyncThunk(
  "venue/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await LocationService.editVenue(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

export const fetchPlaceWithCountry = createAsyncThunk(
  "locations/fetchPlaceWithCountry",
  async (place, { rejectWithValue }) => {
    try {
      const response = await LocationService.placeWithCountry(place);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);

export const addVenue = createAsyncThunk(
  "locations/addVenue",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await LocationService.addVenue(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add venue");
    }
  }
);

export const getVenues = createAsyncThunk(
  "locations/getVenues",
  async (pageData, { rejectWithValue }) => {
    try {
      if (GET_VENUE_MOCK_API) {
        const response = LocationMockData.getAllVenues;
        return response.data[0];
      } else {
        const response = await LocationService.getVenues(pageData);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);
export const getSingleVenues = createAsyncThunk(
  "locations/getSingleVenues",
  async (venue_id, { rejectWithValue }) => {
    try {
      if (GET_SINGLE_VENUE_MOCK_API && ENABLE_MOCK_API) {
        const response = LocationMockData.singleVenue;
        return response.data[0];
      } else {
        const response = await LocationService.getSingleVenues(venue_id);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);

export const getSinglePlace = createAsyncThunk(
  "locations/getSinglePlace",
  async (place_id, { rejectWithValue }) => {
    try {
      if (GET_SINGLE_VENUE_MOCK_API && ENABLE_MOCK_API) {
        const response = LocationMockData.singleVenue;
        return response.data[0];
      } else {
        const response = await LocationService.getSinglePlace(place_id);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);
export const getPlaces = createAsyncThunk(
  "locations/getPlaces",
  async (pageData, { rejectWithValue }) => {
    try {
      if (GET_PLACE_MOCK_API && ENABLE_MOCK_API) {
        const response = LocationMockData.getAllPlaces;
        return response.data;
      } else {
        console.log("Entered------------------");

        const response = await LocationService.getPlaces(pageData);
        console.log(
          "places fetched===============================>",
          response.data[0]
        );
        return response.data[0];
      }
    } catch (error) {
      console.log("places Failes", error);

      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);
export const getCoutryDetails = createAsyncThunk(
  "locations/getCountryDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await LocationService.getCoutryDetails();
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);

// Validation Slice Thunks

export const validatePlace = createAsyncThunk(
  "locations/validatePlace",
  async (placeId, { rejectWithValue }) => {
    try {
      const response = await LocationService.validatePlace(placeId);

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);

export const validateVenue = createAsyncThunk(
  "locations/validateVenue",
  async (venueId, { rejectWithValue }) => {
    try {
      const response = await LocationService.validateVenue(venueId);

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);
export const validateCountry = createAsyncThunk(
  "locations/validateCountry",
  async (countryId, { rejectWithValue }) => {
    try {
      const response = await LocationService.validateCountry(countryId);

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);
const locationSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    setEditItemId: (state, action) => {
      state.editItemId = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
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
    setSelectedPlace(state, action) {
      state.selectedPlace = action.payload;
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
    setLocationDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setLocationModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
    setPlaceValidationDialogVisible(state, action) {
      state.placeValidationDialogVisible = action.payload;
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
    filterPlaceWithCountry(state, action) {
      const { searchTerm, status } = action.payload;

      let filteredVenues = state.placeWithCountryList;
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
        state.venues = action.payload.items;
        state.filteredVenues = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(getVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSingleVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.singleVenues = action.payload;
      })
      .addCase(getSingleVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSinglePlace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSinglePlace.fulfilled, (state, action) => {
        state.loading = false;
        state.singlePlace = action.payload;
      })
      .addCase(getSinglePlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCoutryDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCoutryDetails.fulfilled, (state, action) => {
        state.loading = false;
        // state.venues = action.payload.items;
        state.detailedCountryList = action.payload.items;
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
        state.places = action.payload.items;
        state.filteredPlaces = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(getPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editPlace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editPlace.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data;
          state.editable_status = payload.status.editable_status;
        }
      })
      .addCase(editPlace.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(editPlaceStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editPlaceStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data;
          state.editable_status = payload.status.editable_status;
        }
      })
      .addCase(editPlaceStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(editVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editVenue.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data;
          state.editable_status = payload.status.editable_status;
        }
      })
      .addCase(editVenue.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(editVenueStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editVenueStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data;
          state.editable_status = payload.status.editable_status;
        }
      })
      .addCase(editVenueStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(createPlace.pending, (state) => {
        state.createPlaceLoading = true;
        state.error = null;
      })
      .addCase(createPlace.fulfilled, (state, action) => {
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
        state.createPlaceLoading = false;
      })
      .addCase(createPlace.rejected, (state, action) => {
        state.createPlaceLoading = false;
        state.error = action.payload.data;
      })
      .addCase(fetchPlaceWithCountry.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlaceWithCountry.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.placeWithCountryList = payload.items;
      })
      .addCase(fetchPlaceWithCountry.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(addVenue.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addVenue.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      //VALIDATION EXTRA REDUCERS

      .addCase(validatePlace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validatePlace.fulfilled, (state, { payload }) => {
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
      .addCase(validatePlace.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to validate place";
      })
      .addCase(validateVenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateVenue.fulfilled, (state, { payload }) => {
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
      .addCase(validateVenue.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to validate place";
      })
      .addCase(validateCountry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCountry.fulfilled, (state, { payload }) => {
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
      .addCase(validateCountry.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to validate place";
      });
  },
});

export const {
  setSearchTerm,
  setStatusFilter,
  setOptions,
  onSelect,
  onchange,
  setLocationDialogVisible,
  setLocationModalLoading,
  filterVenues,
  singleVenue,
  onSearch,
  setCoordinates,
  filterPlaces,
  setSelectedVenue,
  setLoading,
  setSelectedPlace,
  setEditItemId,
  setPlaceValidationDialogVisible,
} = locationSlice.actions;
export const allLocations = (state) => state.location;

export default locationSlice.reducer;
