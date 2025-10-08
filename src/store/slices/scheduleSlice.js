import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GET_SCHEDULE_MOCK_API, ENABLE_MOCK_API } from "configs/MockConfig";
import ScheduleMockData from "mock/data/scheduleData";
import ScheduleService from "services/ScheduleService";

export const initialState = {
  loading: false,
  schedules: [],
  filteredSchedules: [],
  selectedCoupons: [],
  submitedData: null,
  selectedAddOnServiceList: [],
  selectedOffers: [],
  selectedItemForModal: null,
  isSelectTime: false,
  error: null,
  message: null,
  editable_status: true,
  responseData: null,
  responseMessage: null,
  timeSlots: {},
  foodTimeSlots: {},
  scheduleDetails: {},
  activeTab: null,
  dates: [],
  slotStatus: {},
  scrollPosition: 0,
  pagination: { size: 10, page: 1 },
  scheduleFormData: {},
  checkedscheduleDetails: null,
};

export const fetchAllSchedules = createAsyncThunk(
  "schedule/fetchAll",
  async (pageData, { rejectWithValue }) => {
    try {
      if (GET_SCHEDULE_MOCK_API && ENABLE_MOCK_API) {
        const response = ScheduleMockData.fetchAllSchedules;
        return response.data;
      } else {
        const response = await ScheduleService.getAllSchedule(pageData);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching schedules"
      );
    }
  }
);
export const fetchSingleSchedules = createAsyncThunk(
  "schedule/fetchSingle",
  async (pageData, { rejectWithValue }) => {
    try {
      if (GET_SCHEDULE_MOCK_API && ENABLE_MOCK_API) {
        const response = ScheduleMockData.fetchAllSchedules;
        return response.data;
      } else {
        const response = await ScheduleService.getSingleSchedule(pageData);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching schedules"
      );
    }
  }
);
export const checkScheduleEdit = createAsyncThunk(
  "schedule/checkScheduleEdit",
  async (params, { rejectWithValue }) => {
    try {
      const response = await ScheduleService.checkScheduleEdit(params);
      return response.data[0];
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
      console.log("errortesting", error);

      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

export const editScheduleStatus = createAsyncThunk(
  "schedule/editScheduleStatus",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await ScheduleService.editScheduleStatus(data, action);
      return response.status;
    } catch (error) {
      console.log("errortesting", error);

      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

const scheduleSlice = createSlice({
  name: "schedules",
  initialState,
  reducers: {
    setScheduleFormData: (state, action) => {
      // Deep merge to handle nested objects properly
      state.scheduleFormData = {
        ...state.scheduleFormData,
        ...action.payload,
        // Ensure arrays are properly handled
        show_dates:
          action.payload.show_dates || state.scheduleFormData.show_dates || [],
        add_ons: action.payload.add_ons || state.scheduleFormData.add_ons || [],
        food_slots:
          action.payload.food_slots || state.scheduleFormData.food_slots || [],
        offer_ids:
          action.payload.offer_ids || state.scheduleFormData.offer_ids || [],
        coupon_ids:
          action.payload.coupon_ids || state.scheduleFormData.coupon_ids || [],
      };
    },
    resetScheduleData: (state) => {
      state.scheduleFormData = initialState.scheduleFormData;
    },
    updateScheduleField: (state, action) => {
      const { field, value } = action.payload;
      state.scheduleFormData[field] = value;
    },

    setTimeSlots: (state, action) => {
      state.timeSlots = action.payload;
    },
    reSetOffersAndCoupons: (state, action) => {
      state.selectedCoupons = [];
      state.selectedOffers = [];
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setDates: (state, action) => {
      state.dates = action.payload;
    },
    setSlotStatus: (state, action) => {
      state.slotStatus = action.payload;
    },
    setScheduleSubmitData: (state, action) => {
      state.submitedData = action.payload;
    },
    addNewTimeSlot: (state, action) => {
      const { dateStr } = action.payload;
      if (!state.timeSlots[dateStr]) {
        state.timeSlots[dateStr] = [];
      }
      state.timeSlots[dateStr].push({ start_time: null, end_time: null });
    },
    removeExistingTimeSlot: (state, action) => {
      const { dateStr, index } = action.payload;
      if (state.timeSlots[dateStr]) {
        state.timeSlots[dateStr] = state.timeSlots[dateStr].filter(
          (_, i) => i !== index
        );
      }
    },
    addTimeSlot: (state, action) => {
      const { dateStr } = action.payload;
      if (!state.timeSlots[dateStr]) {
        state.timeSlots[dateStr] = [];
      }
      state.timeSlots[dateStr].push({ start_time: null, end_time: null });
    },
    removeTimeSlot: (state, action) => {
      const { dateStr, index } = action.payload;
      if (state.timeSlots[dateStr]) {
        state.timeSlots[dateStr] = state.timeSlots[dateStr].filter(
          (_, i) => i !== index
        );
      }
    },
    updateTimeSlot: (state, action) => {
      const { dateStr, index, field, value } = action.payload;
      if (!state.timeSlots[dateStr]) {
        state.timeSlots[dateStr] = [];
      }
      if (!state.timeSlots[dateStr][index]) {
        state.timeSlots[dateStr][index] = {};
      }
      state.timeSlots[dateStr][index][field] = value;
    },
    clearTimeSlots: (state, action) => {
      const { dateStr, indices } = action.payload;
      if (state.timeSlots[dateStr]) {
        indices.forEach((index) => {
          if (state.timeSlots[dateStr][index]) {
            state.timeSlots[dateStr][index] = {
              ...state.timeSlots[dateStr][index],
              start_time: null,
              end_time: null,
            };
          }
        });
      }
    },
    filterSchedules: (state, action) => {
      const { searchTerm, status } = action.payload;

      let fltreSchedule = state.schedules;

      if (status && status !== "All") {
        fltreSchedule = fltreSchedule.filter(
          (schedule) =>
            (status === "Active" && schedule.status === true) ||
            (status === "Inactive" && schedule.status === false)
        );
      }

      if (searchTerm) {
        fltreSchedule = fltreSchedule.filter((schedule) => {
          if (!schedule.name) return false;
          return schedule.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }

      state.filteredSchedules = fltreSchedule;
    },
    toggleSelectedOffer: (state, action) => {
      const existingOfferIndex = state.selectedOffers.findIndex(
        (offer) => offer.offer.id === action.payload.offer.id
      );

      if (existingOfferIndex !== -1) {
        // Store original dates before removing
        const existingOffer = state.selectedOffers[existingOfferIndex];
        state.selectedOffers.splice(existingOfferIndex, 1);
      } else {
        // Add new offer with original dates
        const newOffer = {
          ...action.payload,
          offer: {
            ...action.payload.offer,
            original_start_date: action.payload.offer.start_date,
            original_end_date: action.payload.offer.end_date,
          },
        };
        state.selectedOffers.push(newOffer);
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
            wasAdjusted: true,
          },
        };
      }
    },

    toggleSelectedCoupon: (state, action) => {
      const existingCouponIndex = state.selectedCoupons.findIndex(
        (coupon) => coupon.id === action.payload.id
      );

      if (existingCouponIndex !== -1) {
        // Store original dates before removing
        const existingCoupon = state.selectedCoupons[existingCouponIndex];
        state.selectedCoupons.splice(existingCouponIndex, 1);
      } else {
        // Add new coupon with original dates
        const newCoupon = {
          ...action.payload,
          coupons: {
            ...action.payload.coupons,
            original_start_date: action.payload.coupons.start_date,
            original_end_date: action.payload.coupons.end_date,
          },
        };
        state.selectedCoupons.push(newCoupon);
      }
    },

    updateSelectedCoupons: (state, action) => {
      const existingCouponIndex = state.selectedCoupons.findIndex(
        (coupon) => coupon.id === action.payload.id
      );

      if (existingCouponIndex !== -1) {
        state.selectedCoupons[existingCouponIndex] = {
          ...state.selectedCoupons[existingCouponIndex],
          coupons: {
            ...state.selectedCoupons[existingCouponIndex].coupons,
            start_date: action.payload.start_date,
            end_date: action.payload.end_date,
            wasAdjusted: true,
          },
        };
      }
    },
    setSelectedItemForModal: (state, action) => {
      state.selectedItemForModal = action.payload;
    },
    setScheduleSelectTime: (state, action) => {
      state.isSelectTime = action.payload;
    },
    setAddOnServie: (state, action) => {
      // Replace the entire selectedAddOnServiceList with new data
      state.selectedAddOnServiceList = action.payload;
    },

    // Alternative: If you want to add/remove individual items
    toggleAddOnService: (state, action) => {
      const { addon, isSelected } = action.payload;

      if (isSelected) {
        // Add to list if not already present
        const existingIndex = state.selectedAddOnServiceList.findIndex(
          (item) => item.name === addon.name
        );

        if (existingIndex === -1) {
          state.selectedAddOnServiceList.push({
            name: addon.name,
            status: true,
            id: addon.id,
            price: addon.price,
          });
        }
      } else {
        // Remove from list
        state.selectedAddOnServiceList = state.selectedAddOnServiceList.filter(
          (item) => item.name !== addon.name
        );
      }
    },
    resetSchedule: (state, action) => {
      return initialState;
    },
    setFoodTimeSlots: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.foodTimeSlots = action.payload;
      } else {
        state.foodTimeSlots = {
          ...state.foodTimeSlots,
          ...action.payload,
        };
      }
    },
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
          state.editable_status = payload.editable_status;
        }
      })
      .addCase(editSchedule.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(editScheduleStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editScheduleStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
          state.editable_status = payload.editable_status;
        }
      })
      .addCase(editScheduleStatus.rejected, (state, { payload }) => {
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
        state.pagination = action.payload;
      })
      .addCase(fetchAllSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSingleSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduleDetails = action.payload;
      })
      .addCase(fetchSingleSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkScheduleEdit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkScheduleEdit.fulfilled, (state, action) => {
        state.loading = false;
        state.checkedscheduleDetails = action.payload;
      })
      .addCase(checkScheduleEdit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addNewTimeSlot,
  removeExistingTimeSlot,
  filterSchedules,
  resetSchedule,
  toggleSelectedOffer,
  toggleSelectedCoupon,
  updateSelectedCoupons,
  reSetOffersAndCoupons,
  setSelectedItemForModal,
  setTimeSlots,
  setActiveTab,
  setDates,
  setSlotStatus,
  setScheduleFormData,
  resetScheduleData,
  updateScheduleField,
  addTimeSlot,
  removeTimeSlot,
  updateTimeSlot,
  setScheduleSubmitData,
  setScheduleSelectTime,
  updateSelectedOffer,
  setAddOnServie,
  setFoodTimeSlots,
  toggleAddOnService,
} = scheduleSlice.actions;
export default scheduleSlice.reducer;
