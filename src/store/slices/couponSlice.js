import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { message } from "antd";
import { ALL_COUPONS_MOCK_API, ENABLE_MOCK_API } from "configs/MockConfig";
import { SUCCESS_CODE } from "constants/AppConstants";
import CouponMockData from "mock/data/couponData";
import CouponService from "services/CouponService";

export const initialState = {
  loading: false,
  couponCodeLoading: false,
  coupons: [],
  generatedCouponCodes: [],
  selectedCouponsDays: [],
  filteredCoupons: [],
  error: null,
  message: null,
  responseData: null,
  responseMessage: null,
  editable_status: null,
  couponDetails: null,
  isDateRequired: false,
  editItemId: null,
  selectedCoupon: null,
  responseImpactData: null,
  submitPagination: { size: 10, page: 1 },
  warningPagination: { size: 10, page: 1 },
  pagination: { size: 10, page: 1 },
};
export const fetchAllCoupons = createAsyncThunk(
  "coupon/fetchAll",
  async (pageData, { rejectWithValue }) => {
    try {
      if (ALL_COUPONS_MOCK_API && ENABLE_MOCK_API) {
        const response = CouponMockData.fetchAllCoupons;
        return response.data;
      } else {
        const response = await CouponService.getAllCoupon(pageData);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching coupons");
    }
  }
);
export const fetchAllTrackCoupons = createAsyncThunk(
  "coupon/fetchAllTrackCoupons",
  async (pageData, { rejectWithValue }) => {
    try {
      if (ALL_COUPONS_MOCK_API && ENABLE_MOCK_API) {
        const response = CouponMockData.fetchAllCoupons;
        return response.data;
      } else {
        const response = await CouponService.getAllTrackCoupon(pageData);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching coupons");
    }
  }
);

export const fetchCouponDetails = createAsyncThunk(
  "coupon/fetchCouponDetails",
  async (couponId, { rejectWithValue }) => {
    try {
      const response = await CouponService.fetchCouponDetails(couponId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch event details");
    }
  }
);

export const addCoupon = createAsyncThunk(
  "coupon/add",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await CouponService.addCoupon(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating user");
    }
  }
);
export const generateCouponCodes = createAsyncThunk(
  "coupon/generateCouponCodes",
  async ({ data }, { rejectWithValue }) => {
    try {
      const response = await CouponService.generateCouponCode(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating user");
    }
  }
);

export const editCoupon = createAsyncThunk(
  "coupon/edit",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      console.log(data, "DATA IN SERVICE");
      const response = await CouponService.editCoupon(data, action, pageData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);
export const makeChangesCoupon = createAsyncThunk(
  "coupon/makeChangesCoupon",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      console.log(pageData, "DATA IN SERVICE");
      const response = await CouponService.makeChangeCoupon(data, action, pageData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

export const editCouponStatus = createAsyncThunk(
  "coupon/editStatus",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await CouponService.editCouponStatus(
        data,
        action,
        pageData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

const couponSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {
    filterCoupons: (state, action) => {
      const { searchTerm, status } = action.payload;

      let filteredCoupons = state.coupons;
      if (status && status !== "All") {
        filteredCoupons = filteredCoupons.filter(
          (coupon) =>
            (status === "Active" && coupon.status === true) ||
            (status === "Inactive" && coupon.status === false)
        );
      }

      if (searchTerm) {
        filteredCoupons = filteredCoupons.filter((coupon) =>
          coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      state.filteredCoupons = filteredCoupons;
    },
    setEditItemId: (state, action) => {
      state.editItemId = action.payload;
    },
    setCouponDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setCouponModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
    setSelectedCoupon: (state, action) => {
      state.selectedCoupon = action.payload;
    },
    setIsDateRequired: (state, action) => {
      state.isDateRequired = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchCouponDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCouponDetails.fulfilled, (state, action) => {
        state.loading = false;
        const couponData = { ...action.payload[0] };
        state.couponDetails = couponData;
        state.selectedCouponsDays = couponData?.weekday_associations || null;
      })
      .addCase(fetchCouponDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(editCoupon.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.data?.list_of_updated_Schedules) {
          state.submitPagination = payload.data?.list_of_updated_Schedules;
        }
        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(makeChangesCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(makeChangesCoupon.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.data?.list_of_updated_Schedules) {
          state.submitPagination = payload.data?.list_of_updated_Schedules;
        }
        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(makeChangesCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log("action.payload", action.payload)
      })
      .addCase(editCouponStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCouponStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editCouponStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })

      .addCase(fetchAllCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.items;
        state.filteredCoupons = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchAllCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllTrackCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTrackCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.items;
        state.filteredCoupons = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchAllTrackCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addCoupon.pending, (state) => {
        state.createPlaceLoading = true;
        state.error = null;
      })
      .addCase(addCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addCoupon.rejected, (state, action) => {
        state.createPlaceLoading = false;
        state.error = action.payload.data;
      })
      .addCase(generateCouponCodes.pending, (state) => {
        state.couponCodeLoading = true;
        state.error = null;
      })
      .addCase(generateCouponCodes.fulfilled, (state, action) => {
        state.couponCodeLoading = false;
        if (action.payload.status?.status_code === SUCCESS_CODE) {
          state.generatedCouponCodes = action.payload.data?.coupon_codes;
          message.success('Coupon codes Generated successfully');
          return;
        } else {
          message.success(action.payload.status?.message || 'Error generating coupon codes');
        }
        state.error = null;
      })
      .addCase(generateCouponCodes.rejected, (state, action) => {
        state.couponCodeLoading = false;
        state.error = action.payload.data;
      });
  },
});

export const {
  filterCoupons,
  setEditItemId,
  setCouponDialogVisible,
  setCouponModalLoading,
  setIsDateRequired,
  setSelectedCoupon,
} = couponSlice.actions;
export default couponSlice.reducer;
