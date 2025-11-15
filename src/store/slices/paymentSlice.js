import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ALL_PAYMENT_MOCK_API, ENABLE_MOCK_API } from "configs/MockConfig";
import PaymentMockData from "mock/data/paymentData";
import PaymentService from "services/paymentService";

export const initialState = {
  loading: false,
  payments: [],
  singlePayment: null,
  addOnServiceList: [],
  error: null,
  // message: null,
  responseData: null,
  paymentServices: [],
  responseMessage: null,
  editable_status: null,
  pagination: { size: 10, page: 1 },
};

// Fetch all payments
export const fetchAllPayment = createAsyncThunk(
  "payment/fetchAll",
  async (pageData, { rejectWithValue }) => {
    try {
      if (ALL_PAYMENT_MOCK_API && ENABLE_MOCK_API) {
        const response = PaymentMockData.fetchPaymentDataList;
        return response.data[0];
      } else {
        const response = await PaymentService.getAllPayment(pageData);
        return response.data[0];
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error Fetching Payments");
    }
  }
);
export const fetchAllPaymentService = createAsyncThunk(
  "payment/fetchAllPaymentService",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await PaymentService.getAllPaymentServices(pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error Fetching Payments");
    }
  }
);

// Fetch single payment
export const getSinglePayment = createAsyncThunk(
  "payment/getSingle",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await PaymentService.getSinglePayment(pageData);
      console.log("API Response:", response);
      return response.data[0];
    } catch (error) {
      console.error("Error in getSinglePayment:", error);
      return rejectWithValue(
        error.response?.data ||
          error.message ||
          "Error Fetching Payment Details"
      );
    }
  }
);
export const getPaymentAddOnService = createAsyncThunk(
  "payment/getPaymentAddOnService",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await PaymentService.getPaymentAddOnService(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(
        error.response?.data ||
          error.message ||
          "Error Fetching Payment Details"
      );
    }
  }
);

//payments methods

export const fetchAllPaymentMethod = createAsyncThunk(
  "paymentMethod/fetchAllPaymentMethod",
  async (_, { rejectWithValue }) => {
    try {
      const response = await PaymentService.getPaymentsMethod();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error Fetching Payments");
    }
  }
);

// Add new payment
export const addPayment = createAsyncThunk(
  "payment/add",
  async ({ data, action }, { rejectWithValue }) => {
    console.log("Payment Added:", data);
    try {
      const response = await PaymentService.addPayment(data, action);
      return response;
    } catch (error) {
      console.error("Error in addPayment:", error);
      return rejectWithValue(error.response?.data || "Error Adding Payment");
    }
  }
);

export const editPayment = createAsyncThunk(
  "payment/edit",
  async ({ data, action }, { rejectWithValue }) => {
    console.log("Payment Edited in Store:", data);
    try {
      const response = await PaymentService.editPayment(data, action);
      return response;
    } catch (error) {
      console.error("Error in addPayment:", error);
      return rejectWithValue(error.response?.data || "Error Adding Payment");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearSinglePayment: (state) => {
      state.singlePayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all payments
      .addCase(fetchAllPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.items;
        state.filteredPayment = action.payload.items;
        state.pagination = action.payload;
        state.error = null;
      })
      .addCase(fetchAllPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllPaymentService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPaymentService.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentServices = action.payload;

        state.error = null;
      })
      .addCase(fetchAllPaymentService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single payment
      .addCase(getSinglePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.singlePayment = null;
      })
      .addCase(getSinglePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.singlePayment = action.payload;
        state.error = null;
      })
      .addCase(getSinglePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singlePayment = null;
      })
      .addCase(getPaymentAddOnService.pending, (state) => {
        state.loading = true;
        state.error = null;
        // state.singlePayment = null;
      })
      .addCase(getPaymentAddOnService.fulfilled, (state, action) => {
        state.loading = false;
        state.addOnServiceList = action.payload;
        state.error = null;
      })
      .addCase(getPaymentAddOnService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.singlePayment = null;
      })

      // Add new payment
      .addCase(addPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.responseMessage = null;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
        state.error = null;
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.responseMessage = "Failed to add payment";
      })

      .addCase(editPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.responseMessage = null;
      })
      .addCase(editPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
        state.error = null;
      })
      .addCase(editPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.responseMessage = "Failed to add payment";
      })

      .addCase(fetchAllPaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.methods = action.payload;
      })
      .addCase(fetchAllPaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSinglePayment } = paymentSlice.actions;
export default paymentSlice.reducer;
