import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ENTRY_TYPES } from 'constants/QrConstants';
import QrVerificationService from 'services/QrVerificationService';

const initialState = {
    response: [],
    serviceType: ENTRY_TYPES.user,
    scannerType: null,
    pagination: { size: 10, page: 1 },
    loading: false,
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
                state.response = action.payload?.items;
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
                state.response = action.payload?.items;
                state.pagination = action.payload;
            })
            .addCase(fetchTcketAddon.rejected, (state, action) => {
                state.message = action.payload;
                state.loading = false;
            })
    }
});

export const {
    setServiceType,
    setScannerType
} = qrVerificationSlice.actions;

export default qrVerificationSlice.reducer;