import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ALL_COUPONS_MOCK_API,
  ENABLE_MOCK_API,
} from "configs/MockConfig";
import CouponMockData from "mock/data/couponData";
import CouponService from "services/CouponService";

export const initialState = {
  loading: false,
  coupons: [],
  filteredCoupons: [], 
  error: null,
  message: null,
};
export const fetchAllCoupons = createAsyncThunk(
  "coupon/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      if (ALL_COUPONS_MOCK_API && ENABLE_MOCK_API) {
        const response = CouponMockData.fetchAllCoupons;
        return response.data;
      } else {
        const response = await CouponService.getAllCoupon();
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching coupons");
    }
  }
);

export const addCoupon = createAsyncThunk(
  "coupon/add",
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await CouponService.addCoupon(couponData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating user");
    }
  }
);

export const editCoupon = createAsyncThunk(
  "coupon/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await CouponService.editCoupon(data, action);
      return response.status;
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
  },
  extraReducers: (builder) => {
    builder
     .addCase(editCoupon.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(editCoupon.fulfilled, (state, { payload }) => {
            state.loading = false;
            if (payload.message) {
              state.message = payload.message;
            }
          })
          .addCase(editCoupon.rejected, (state, { payload }) => {
            state.loading = false;
            state.error = payload || "Failed to edit event";
          })
      .addCase(fetchAllCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
        state.filteredCoupons = action.payload;
      })
      .addCase(fetchAllCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { filterCoupons } = couponSlice.actions;
export default couponSlice.reducer;
