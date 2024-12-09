import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ALL_OFFERS_MOCK_API, ENABLE_MOCK_API, GET_SCHEDULE_MOCK_API } from "configs/MockConfig";
import ScheduleMockData from "mock/data/scheduleData";
import ScheduleService from "services/ScheduleService";

export const initialState = {
  loading: false,
  schedules: [],
  filteredSchedules: [],
  selectedCoupons: [],
  selectedOffers: [],
  selectedItemForModal: null,
  error: null,
};

export const fetchAllSchedules = createAsyncThunk(
  "schedule/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      if (GET_SCHEDULE_MOCK_API && ENABLE_MOCK_API) {
        const response = ScheduleMockData.fetchAllSchedules;
        return response.data;
      } else {
        const response = await ScheduleService.getAllSchedule();
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching schedules"
      );
    }
  }
);
export const addSchedule = createAsyncThunk(
  "offer/add",
  async (offerData, { rejectWithValue }) => {
    try {
      const response = await ScheduleService.addSchedule(offerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating user");
    }
  }
);
const scheduleSlice = createSlice({
  name: "schedules",
  initialState,
  reducers: {
    filterSchedules: (state, action) => {
      const { searchTerm, status } = action.payload;

      let filteredSchedules = state.schedules;
      if (status && status !== "All") {
        filteredSchedules = filteredSchedules.filter(
          (schedule) =>
            (status === "Active" && schedule.status === true) ||
            (status === "Inactive" && schedule.status === false)
        );
      }

      if (searchTerm) {
        filteredSchedules = filteredSchedules.filter((schedule) =>
          schedule.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      state.filteredSchedules = filteredSchedules;
    },
    toggleSelectedOffer: (state, action) => {
      const existingOfferIndex = state.selectedOffers.findIndex(
        (offer) => offer.id === action.payload.id
      );

      if (existingOfferIndex !== -1) {
        state.selectedOffers.splice(existingOfferIndex, 1);
      } else {
        state.selectedOffers.push(action.payload);
      }
    },
    toggleSelectedCoupon: (state, action) => {
      const existingCouponIndex = state.selectedCoupons.findIndex(
        (coupon) => coupon.id === action.payload.id
      );

      if (existingCouponIndex !== -1) {
        state.selectedCoupons.splice(existingCouponIndex, 1);
      } else {
        state.selectedCoupons.push(action.payload);
      }
    },
    setSelectedItemForModal: (state, action) => {
      state.selectedItemForModal = action.payload;
    },
    updateSelectedOffer: (state, action) => {
      const existingOfferIndex = state.selectedOffers.findIndex(
        (offer) => offer.id === action.payload.id
      );
      state.selectedOffers[existingOfferIndex].start_date =
        action.payload.start_date;
      state.selectedOffers[existingOfferIndex].end_date =
        action.payload.end_date;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSchedule.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.filteredSchedules.push(payload);
      })
      .addCase(addSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
        state.filteredSchedules = action.payload;
      })
      .addCase(fetchAllSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  filterSchedules,
  toggleSelectedOffer,
  toggleSelectedCoupon,
  setSelectedItemForModal,
  updateSelectedOffer,
} = scheduleSlice.actions;
export default scheduleSlice.reducer;
