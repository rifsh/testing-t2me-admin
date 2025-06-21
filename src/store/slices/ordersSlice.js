import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import OrderService from "services/OrdersService";

export const fethEventOrders = createAsyncThunk(
  "orders/fethEventOrders",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await OrderService.fethEventOrders(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fethEventOrderDetails = createAsyncThunk(
  "orders/fethEventOrderDetails",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await OrderService.fethEventOrderDetails(pageData);
      return response.data[0];
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
    eventOrdersDataList:[],
    eventOrdersDataDetails:null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fethEventOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fethEventOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.eventOrdersDataList = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fethEventOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fethEventOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fethEventOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.eventOrdersDataDetails = action.payload.items;
       })
      .addCase(fethEventOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const {} = orderSlice.actions;
export default orderSlice.reducer;
