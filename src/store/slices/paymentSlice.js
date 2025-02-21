// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { ALL_PAYMENT_MOCK_API, ENABLE_MOCK_API } from "configs/MockConfig";
// import PaymentMockData from "mock/data/paymentData";
// import PaymentService from "services/paymentService";

// export const initialState = {
//   loading: false,
//   payments: [],
//   singlePayment: null, // Added explicit singlePayment to initial state
//   error: null,
//   message: null,
//   responseData: null,
//   responseMessage: null,
//   editable_status: null,
//   pagination: { size: 10, page: 1 },
// };

// export const fetchAllPayment = createAsyncThunk(
//   "payment/fatchAll",
//   async (pageData, { rejectWithValue }) => {
//     try {
//       if (ALL_PAYMENT_MOCK_API && ENABLE_MOCK_API) {
//         const response = PaymentMockData.fetchPaymentDataList;
//         return response.data[0];
//       } else {
//         const response = await PaymentService.getAllPayment(pageData);
//         return response.data[0];
//       }
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Error Fetching Payment");
//     }
//   }
// );

// export const getSinglePayment = createAsyncThunk(
//   "payment/getSingle",
//   async (id, { rejectWithValue }) => {
//     try {
//       if (ALL_PAYMENT_MOCK_API && ENABLE_MOCK_API) {
//         const response = PaymentMockData.fetchPaymentDataList;
//         // Convert id to string for comparison if needed
//         const paymentId = String(id);
//         const payment = response.data[0].items.find(
//           (item) => String(item.id) === paymentId
//         );

//         if (!payment) {
//           throw new Error("Payment not found");
//         }

//         // Add console log to debug mock data
//         console.log("Mock Payment Found:", payment);
//         return payment;
//       } else {
//         const response = await PaymentService.getSinglePayment(id);
//         // Add console log to debug API response
//         console.log("API Response:", response);
//         return response.data;
//       }
//     } catch (error) {
//       console.error("Error in getSinglePayment:", error);
//       return rejectWithValue(
//         error.response?.data ||
//           error.message ||
//           "Error Fetching Payment Details"
//       );
//     }
//   }
// );

// const paymentSlice = createSlice({
//   name: "payment",
//   initialState,
//   reducers: {
//     // Add a reducer to clear single payment
//     clearSinglePayment: (state) => {
//       state.singlePayment = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchAllPayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllPayment.fulfilled, (state, action) => {
//         state.loading = false;
//         state.payments = action.payload.items;
//         state.filteredPayment = action.payload.items;
//         state.pagination = action.payload;
//         state.error = null;
//       })
//       .addCase(fetchAllPayment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(getSinglePayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.singlePayment = null; // Clear previous payment data
//       })
//       .addCase(getSinglePayment.fulfilled, (state, action) => {
//         state.loading = false;
//         state.singlePayment = action.payload;
//         state.error = null;
//       })
//       .addCase(getSinglePayment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.singlePayment = null;
//       });
//   },
// });

// export const { clearSinglePayment } = paymentSlice.actions;
// export default paymentSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ALL_PAYMENT_MOCK_API, ENABLE_MOCK_API } from "configs/MockConfig";
import PaymentMockData from "mock/data/paymentData";
import PaymentService from "services/paymentService";
  
export const initialState = {
  loading: false,
  payments: [],
  singlePayment: null,
  error: null,
  message: null,
  responseData: null,
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

// Fetch single payment
export const getSinglePayment = createAsyncThunk(
  "payment/getSingle",
  async (id, { rejectWithValue }) => {
    try {
      if (ALL_PAYMENT_MOCK_API && ENABLE_MOCK_API) {
        const response = PaymentMockData.fetchPaymentDataList;
        const payment = response.data[0].items.find(
          (item) => String(item.id) === String(id)
        );

        if (!payment) {
          throw new Error("Payment not found");
        }

        console.log("Mock Payment Found:", payment);
        return payment;
      } else {
        const response = await PaymentService.getSinglePayment(id);
        console.log("API Response:", response);
        return response.data;
      }
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

// Add new payment
export const addPayment = createAsyncThunk(
  "payment/add",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await PaymentService.addPayment(paymentData);
      console.log("Payment Added:", response.data);
      return response.data;
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

      // Add new payment
      .addCase(addPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.responseMessage = null;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.responseMessage = "Payment added successfully";
        state.payments = [action.payload, ...state.payments]; // Prepend new payment to the list
        state.error = null;
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.responseMessage = "Failed to add payment";
      });
  },
});

export const { clearSinglePayment } = paymentSlice.actions;
export default paymentSlice.reducer;
