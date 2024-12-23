import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GET_SCHEDULE_MOCK_API, ENABLE_MOCK_API } from "configs/MockConfig";
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
  message: null,
  responseData: null,
  responseMessage: null,
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
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching schedules"
      );
    }
  }
);

export const addSchedule = createAsyncThunk(
  "schedule/add",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await ScheduleService.addSchedule(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating user");
    }
  }
);

export const editSchedule = createAsyncThunk(
  "schedule/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await ScheduleService.editSchedule(data, action);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
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
        (offer) => offer.offer.id === action.payload.offer.id
      );

      if (existingOfferIndex !== -1) {
        state.selectedOffers.splice(existingOfferIndex, 1);
      } else {
        state.selectedOffers.push(action.payload);
      }
    },
    updateSelectedOffer: (state, action) => {
      const existingOfferIndex = state.selectedOffers.findIndex(
        (offer) => offer.offer.id === action.payload.id
      );
      
      if (existingOfferIndex !== -1) {
        state.selectedOffers[existingOfferIndex] = {
          ...state.selectedOffers[existingOfferIndex],
          offer: {
            ...state.selectedOffers[existingOfferIndex].offer,
            start_date: action.payload.start_date,
            end_date: action.payload.end_date,
            date_required: true,
            wasAdjusted: true,
          }
        };
      }
    },
    updateSelectedCoupons: (state, action) => {
      const existingCouponsIndex = state.selectedCoupons.findIndex(
        (coupons) => coupons.coupons.id === action.payload.id
      );
      
      if (existingCouponsIndex !== -1) {
        state.selectedCoupons[existingCouponsIndex] = {
          ...state.selectedCoupons[existingCouponsIndex],
          coupons: {
            ...state.selectedCoupons[existingCouponsIndex].coupons,
            start_date: action.payload.start_date,
            end_date: action.payload.end_date,
            wasAdjusted: true,
          }
        };
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
    resetSchedule:(state,action)=>{
      return initialState
    }
   
  },
  extraReducers: (builder) => {
    builder
      .addCase(editSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSchedule.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
        }
      })
      .addCase(editSchedule.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(addSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
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
        state.schedules = action.payload.items;
        state.filteredSchedules = action.payload.items;
      })
      .addCase(fetchAllSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  filterSchedules,resetSchedule,
  toggleSelectedOffer,
  toggleSelectedCoupon,updateSelectedCoupons,
  setSelectedItemForModal,
  updateSelectedOffer,
} = scheduleSlice.actions;
export default scheduleSlice.reducer;
