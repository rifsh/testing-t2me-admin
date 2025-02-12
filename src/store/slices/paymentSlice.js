import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ALL_PAYMENT_MOCK_API, ENABLE_MOCK_API } from "configs/MockConfig";
import PaymentMockData from "mock/data/paymentData";
import PaymentService from "services/paymentService";

export const initialState = {
    loading: false,
    payments: [],
    error: null,
    message: null,
    responseData: null,
    responseMessage: null,
    editable_status: null,
    pagination: { size: 10, page: 1 }
};

export const fetchAllPayment = createAsyncThunk(
 "payment/fatchAll",
 async (pageData, { rejectWithValue }) => {
    try {
        if(ALL_PAYMENT_MOCK_API && ENABLE_MOCK_API) {
            const response = PaymentMockData.fetchPaymentDataList;
            return response.data[0];
        } else {
            const response = await PaymentService.getAllPayment(pageData);
            return response.data[0];
        }

    } catch (error) {
        return rejectWithValue(error.response?.data || "Error Fetching Payment");
    }
 }
);

export const getSinglePayment = createAsyncThunk(
  "payment/getSingle",
  async (id, { rejectWithValue }) => {
    try {
      if (ALL_PAYMENT_MOCK_API && ENABLE_MOCK_API) {
        const response = PaymentMockData.fetchPaymentDataList;
        // Find the specific payment from mock data
        const payment = response.data[0].items.find(item => item.id === id);
        return payment;
      } else {
        const response = await PaymentService.getSinglePayment(id);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error Fetching Payment Details");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
  
      .addCase(fetchAllPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.items;
        state.filteredPayment = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchAllPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSinglePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSinglePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.singlePayment = action.payload;
      })
      .addCase(getSinglePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
   
  },
});

export const {} = paymentSlice.actions;
export default paymentSlice.reducer;