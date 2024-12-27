import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ALL_OFFERS_MOCK_API, ENABLE_MOCK_API } from "configs/MockConfig";
import OfferMockData from "mock/data/offerData";
import OfferService from "services/OfferService";

export const initialState = {
  loading: false,
  offers: [],
  filteredOffers: [],
  isDateRequired: false,
  error: null,
  message: null,
  responseData: null,
  responseMessage: null,
  editable_status: null,
  pagination: { size: 10, page: 1 },
};
export const fetchAllOffers = createAsyncThunk(
  "offer/fetchAll",
  async (pageData, { rejectWithValue }) => {
    try {
      if (ALL_OFFERS_MOCK_API && ENABLE_MOCK_API) {
        const response = OfferMockData.fetchAllOffers;
        return response.data[0];
      } else {
        const response = await OfferService.getAllOffer(pageData);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching offers");
    }
  }
);

export const addOffer = createAsyncThunk(
  "offer/add",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await OfferService.addOffer(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating user");
    }
  }
);

export const editOffer = createAsyncThunk(
  "offer/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await OfferService.editOffer(data, action);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

const offerSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    filterOffers: (state, action) => {
      const { searchTerm, status } = action.payload;

      let filteredOffers = state.offers;
      if (status && status !== "All") {
        filteredOffers = filteredOffers.filter(
          (offer) =>
            (status === "Active" && offer.status === true) ||
            (status === "Inactive" && offer.status === false)
        );
      }

      if (searchTerm) {
        filteredOffers = filteredOffers.filter((offer) =>
          offer.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      state.filteredOffers = filteredOffers;
    },
    setIsDateRequired: (state, action) => {
      state.isDateRequired = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(editOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editOffer.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
          state.editable_status = payload.editable_status;
        }
      })
      .addCase(editOffer.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(fetchAllOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload.items;
        state.filteredOffers = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchAllOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addOffer.pending, (state) => {
        state.createPlaceLoading = true;
        state.error = null;
      })
      .addCase(addOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addOffer.rejected, (state, action) => {
        state.createPlaceLoading = false;
        state.error = action.payload.data;
      });
  },
});

export const { filterOffers, setIsDateRequired } = offerSlice.actions;
export default offerSlice.reducer;
