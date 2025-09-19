import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import QrVerificationService from 'services/QrVerificationService';

const initialState = {
    response: [],
    serviceType: 'user-entry',
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


const qrVerificationSlice = createSlice({
    name: 'qr',
    initialState,
    reducers: {
        setServiceType(state, action) {
            state.serviceType = action.payload;
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
    }
});

export const {
    setServiceType
} = qrVerificationSlice.actions;

export default qrVerificationSlice.reducer;