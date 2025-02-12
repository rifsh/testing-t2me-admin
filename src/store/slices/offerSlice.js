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
  editItemId: null,
  responseImpactData: null,
  selectedOffer: null,
  offerDetails: null,
  ValidateData: null,
  offerCouponValidationDialogVisible: false,
  validationStatus: false,
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

export const validateOfferCoupon = createAsyncThunk(
  "offer/validate",
  async ({ offers, coupons }, { rejectWithValue }) => {
    try {
      const response = await OfferService.validateOfferCoupon(offers, coupons);

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);

export const fetchOfferDetails = createAsyncThunk(
  "offer/fetchOfferDetails",
  async (offerId, { rejectWithValue }) => {
    try {
      const response = await OfferService.fetchOfferDetails(offerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
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
      console.log(data, "DATA IN SERVICE");
      const response = await OfferService.editOffer(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

export const editOfferStatus = createAsyncThunk(
  "offer/editStatus",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await OfferService.editOfferStatus(data, action);
      return response;
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
    setEditItemId: (state, action) => {
      state.editItemId = action.payload;
    },
    setOfferDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setOfferModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
    setSelectedOffer: (state, action) => {
      state.selectedOffer = action.payload;
    },
    setOfferCouponValidationDialogVisible(state, action) {
      state.offerCouponValidationDialogVisible = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateOfferCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateOfferCoupon.fulfilled, (state, { payload }) => {
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
      .addCase(validateOfferCoupon.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to validate place";
      })
      .addCase(editOffer.pending, (state) => {
        state.loading = true;
      })
      .addCase(editOffer.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          state.responseMessage = payload.status.message;
          state.responseImpactData = payload.status.data.active_schedules;
          state.editable_status = payload.status.editable_status;
        }
      })
      .addCase(editOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editOfferStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editOfferStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          state.responseMessage = payload.status.message;
          state.responseImpactData = payload.status.data.active_schedules;
          state.editable_status = payload.status.editable_status;
        }
      })
      .addCase(editOfferStatus.rejected, (state, { payload }) => {
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
      .addCase(fetchOfferDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfferDetails.fulfilled, (state, action) => {
        state.loading = false;
        const offerData = { ...action.payload[0] };
        state.offerDetails = offerData;
      })
      .addCase(fetchOfferDetails.rejected, (state, action) => {
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

export const {
  filterOffers,
  setIsDateRequired,
  setEditItemId,
  setOfferDialogVisible,
  setOfferModalLoading,
  setSelectedOffer,
  setOfferCouponValidationDialogVisible,
} = offerSlice.actions;
export default offerSlice.reducer;
