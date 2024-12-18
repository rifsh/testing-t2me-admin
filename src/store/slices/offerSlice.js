import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ALL_OFFERS_MOCK_API,
  ENABLE_MOCK_API,
} from "configs/MockConfig";
import OfferMockData from "mock/data/offerData";
import OfferService from "services/OfferService";

export const initialState = {
  loading: false,
  offers: [],
  filteredOffers: [], 
  isDateRequired:false,
  error: null,
  message:null
};
export const fetchAllOffers = createAsyncThunk(
  "offer/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      if (ALL_OFFERS_MOCK_API && ENABLE_MOCK_API) {
        const response = OfferMockData.fetchAllOffers;
        return response.data;
      } else {
        const response = await OfferService.getAllOffer();
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching offers");
    }
  }
);

export const addOffer = createAsyncThunk(
  "offer/add",
  async (offerData, { rejectWithValue }) => {
    try {
      const response = await OfferService.addOffer(offerData);
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
    setIsDateRequired:(state, action)=>{
      state.isDateRequired=action.payload
    }
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
        state.offers = action.payload;
        state.filteredOffers = action.payload;
      })
      .addCase(fetchAllOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { filterOffers,setIsDateRequired } = offerSlice.actions;
export default offerSlice.reducer;
