import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import OrderService from "services/OrdersService";

export const getEventOrders = createAsyncThunk(
  "orders/fetchEventOrders",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await OrderService.getEventOrders(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getEventOrderSummary = createAsyncThunk(
  "orders/getEventOrderSummary",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await OrderService.getEventOrderSammary(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getEventOrderDetailsDate = createAsyncThunk(
  "orders/fetchEventOrderDetailsDate",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await OrderService.getEventOrderDetailsDate(pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getEventOrderDetailsTime = createAsyncThunk(
  "orders/fetchEventOrderDetailsTime",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await OrderService.getEventOrderDetailsTime(pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getMovieOrders = createAsyncThunk(
  "orders/fetchMovieOrders",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await OrderService.getMovieOrders(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getMovieOrderSummary = createAsyncThunk(
  "orders/getMovieOrderSummary",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await OrderService.getMovieOrderSammary(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getOrderByBookings = createAsyncThunk(
  "orders/getOrderByBookings",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await OrderService.getMovieOrderByBookings(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMovieOrderDetailsDate = createAsyncThunk(
  "orders/fetchMovieOrderDetailsDate",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await OrderService.getMovieOrderDetailsDate(pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMovieOrderDetailsTime = createAsyncThunk(
  "orders/fetchMovieOrderDetailsTime",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await OrderService.getMovieOrderDetailsTime(pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    loading: false,
    pagination: { size: 10, page: 1 },
    error: null,
    message: null,
    eventOrdersDataList: [],
    ordersDates: [],
    ordersByBooking: [],
    ordersTime: [],
    allOrdersTime: [],
    bookingTickets: null,
    bookingTicketUser: null,
    eventOrderSummary: null,
  },
  reducers: {
    resetOrderDetails: (state) => {
      state.ordersDates = [];
      state.ordersTime = [];
      state.bookingTickets = null;
      state.bookingTicketUser = null;
    },
    clearTimes: (state) => {
      state.allOrdersTime = [];
    },
    clearTicketUser: (state) => {
      state.bookingTicketUser = null;
    },
    clearUserData: (state) => {
      state.bookingTickets = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getEventOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.eventOrdersDataList = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(getEventOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getEventOrderSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventOrderSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.eventOrderSummary = action.payload;
      })
      .addCase(getEventOrderSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getEventOrderDetailsDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventOrderDetailsDate.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersDates = action.payload;
      })
      .addCase(getEventOrderDetailsDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getEventOrderDetailsTime.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventOrderDetailsTime.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;

        if (responseData) {
          if (responseData.is_time_only === true) {
            state.allOrdersTime = action.payload;
          } else if (
            responseData.booking_tickets ||
            responseData.user_seat_bookings
          ) {
            state.bookingTickets = responseData;
          } else if (
            responseData.booking_ticket_user ||
            responseData.seat_state
          ) {
            state.bookingTicketUser = responseData;
            state.ordersTime = [responseData];
          } else {
            state.ordersTime = action.payload;
          }
        }
      })
      .addCase(getEventOrderDetailsTime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMovieOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMovieOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.eventOrdersDataList = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(getMovieOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMovieOrderSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMovieOrderSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.eventOrderSummary = action.payload;
      })
      .addCase(getMovieOrderSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMovieOrderDetailsDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMovieOrderDetailsDate.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersDates = action.payload;
      })
      .addCase(getMovieOrderDetailsDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMovieOrderDetailsTime.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMovieOrderDetailsTime.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;

        if (responseData) {
          if (responseData.is_time_only === true) {
            state.allOrdersTime = action.payload;
          } else if (
            responseData.booking_tickets ||
            responseData.user_seat_bookings
          ) {
            state.bookingTickets = responseData;
          } else if (
            responseData.booking_ticket_user ||
            responseData.movie_seat_state
          ) {
            state.bookingTicketUser = responseData;
            state.ordersTime = [responseData];
          } else {
            state.ordersTime = action.payload;
          }
        }
      })
      .addCase(getMovieOrderDetailsTime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrderByBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderByBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersByBooking = action.payload;
        state.pagination = action.payload;
      })
      .addCase(getOrderByBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

  },
});

export const { resetOrderDetails, clearUserData, clearTicketUser, clearTimes } =
  orderSlice.actions;
export default orderSlice.reducer;
