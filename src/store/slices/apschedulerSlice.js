import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apschedulerService from "services/ApschedulerService";

export const initialState = {
    loading: false,
    coupons: [],
    allActivityLogs: [],
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
    countsByTypes: null,
    pagination: {
        page: 1,
        size: 10,
        total: 0,
        pages: 0,
    },
};
export const fetchAllApschedulerLogs = createAsyncThunk(
    "apscheduler/fetchAllApschedulerLogs",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await apschedulerService.getAllapschedulerLogs(pageData);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error fetching coupons");
        }
    }
);
export const fetchAllActivityLogs = createAsyncThunk(
    "activity/fetchAll",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await apschedulerService.getAllActivityLogs(pageData);
            return response.data[0];
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error fetching coupons");
        }
    }
);

const apschedulerSlice = createSlice({
    name: "apscheduler",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllApschedulerLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllApschedulerLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload.items;
                state.allActivityLogs = action.payload.data.items;
                state.pagination = action.payload.data;
                state.countsByTypes = action.payload.counts_by_types;
            })
            .addCase(fetchAllApschedulerLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAllActivityLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllActivityLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload.items;
                state.allActivityLogs = action.payload.data.items;
                state.pagination = action.payload.data;
                state.countsByTypes = action.payload.counts_by_types;
            })
            .addCase(fetchAllActivityLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { } = apschedulerSlice.actions;
export default apschedulerSlice.reducer;
