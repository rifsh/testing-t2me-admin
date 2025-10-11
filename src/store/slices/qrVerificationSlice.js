import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ENTRY_TYPES } from 'constants/QrConstants';
import QrVerificationService from 'services/QrVerificationService';

const initialState = {
    response: [],
    serviceType: ENTRY_TYPES.user,
    scannerType: null,
    pagination: { size: 10, page: 1 },
    loading: false,
    submitLoading: false,
    error: "",
    message: "",
};

export const fetchTcketUsers = createAsyncThunk(
    "qr/fetchTcketUsers",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await QrVerificationService.getUserData(pageData);
            return response.data[0];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);
export const cosnumeTicketUsers = createAsyncThunk(
    "qr/cosnumeTicketUsers",
    async ({ pageData, bookingTicketId }, { rejectWithValue }) => {
        try {
            const response = await QrVerificationService.consumeUsers(pageData, bookingTicketId);
            return response.data[0];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);
export const cosnumeAddons = createAsyncThunk(
    "qr/cosnumeAddons",
    async ({ pageData, bookingTicketId }, { rejectWithValue }) => {
        try {
            const response = await QrVerificationService.consumeAddons(pageData, bookingTicketId);
            return response.data[0];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);
export const fetchTcketAddon = createAsyncThunk(
    "qr/fetchTcketAddon",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await QrVerificationService.getFoodData(pageData);
            return response.data[0];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);
export const verifyEventBooking = createAsyncThunk(
    "qr/verifyEventBooking",
    async ({ bookingType, bookingTicketId, eventId }, { rejectWithValue }) => {
        try {
            const response = await QrVerificationService.verifyEvenetBooking(bookingType, bookingTicketId, eventId);
            return response.data[0];
        } catch (err) {
            console.log("API_ERROR", err);
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);


const qrVerificationSlice = createSlice({
    name: 'qr',
    initialState,
    reducers: {
        setServiceType(state, action) {
            state.serviceType = action.payload;
        },
        setScannerType(state, action) {
            state.scannerType = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTcketUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTcketUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
                state.pagination = action.payload;
            })
            .addCase(fetchTcketUsers.rejected, (state, action) => {
                state.message = action.payload;
                state.loading = false;
            })
            .addCase(fetchTcketAddon.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTcketAddon.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
                state.pagination = action.payload;
            })
            .addCase(fetchTcketAddon.rejected, (state, action) => {
                state.message = action.payload;
                state.loading = false;
            })
            .addCase(cosnumeTicketUsers.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(cosnumeTicketUsers.fulfilled, (state, action) => {
                state.submitLoading = false;
                state.response = action.payload;
            })
            .addCase(cosnumeTicketUsers.rejected, (state, action) => {
                state.message = action.payload;
                state.submitLoading = false;
            })
            .addCase(cosnumeAddons.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(cosnumeAddons.fulfilled, (state, action) => {
                state.submitLoading = false;
                state.response = action.payload;
            })
            .addCase(cosnumeAddons.rejected, (state, action) => {
                state.message = action.payload;
                state.submitLoading = false;
            })
            .addCase(verifyEventBooking.pending, (state) => {
                state.submitLoading = true;
            })
            .addCase(verifyEventBooking.fulfilled, (state, action) => {
                state.submitLoading = false;
                state.response = action.payload;
            })
            .addCase(verifyEventBooking.rejected, (state, action) => {
                state.message = action.payload;
                console.log("action.payload", action.payload);

                state.submitLoading = false;
            })
    }
});

export const {
    setServiceType,
    setScannerType
} = qrVerificationSlice.actions;

export default qrVerificationSlice.reducer;