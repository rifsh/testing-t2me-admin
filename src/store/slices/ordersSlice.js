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

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    loading: false,
    pagination: { size: 10, page: 1 },
    error: null,
    message: null,
    eventOrdersDataList: [],
    ordersDates: [],
    ordersTime: [],
    bookingTickets: null,
    bookingTicketUser: null,
  },
  reducers: {
    // Add a reset action to clear data when needed
    resetOrderDetails: (state) => {
      state.ordersDates = [];
      state.ordersTime = [];
      state.bookingTickets = null;
      state.bookingTicketUser = null;
    },
    // Action to clear user specific data
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

        // Check if response has data array
        const responseData = Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload;

        if (responseData) {
          // If has booking_ticket_user (user list for table)
          if (responseData.booking_ticket_user) {
            state.bookingTicketUser = responseData;
            state.ordersTime = [responseData]; // Also store in ordersTime for stats
          }
          // If has booking_tickets (individual user's bookings)
          else if (responseData.booking_tickets) {
            state.bookingTickets = responseData.booking_tickets;
          }
          // Otherwise it's time slots data
          else {
            state.ordersTime = action.payload;
          }
        }
      })
      .addCase(getEventOrderDetailsTime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOrderDetails, clearUserData } = orderSlice.actions;
export default orderSlice.reducer;
