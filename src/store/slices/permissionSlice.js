import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AUTH_TOKEN } from 'constants/AuthConstant';
import { jwtDecode } from 'jwt-decode';

const initialState = {
    response: null,
    permissions: [],
    message: null,
    loading: false,
    error: null
};

export const fetchPermissions = createAsyncThunk(
    "permissions/fetchPermissions",
    async (_, { rejectWithValue }) => {
        try {
            const response = localStorage.getItem(AUTH_TOKEN)
                ? jwtDecode(localStorage.getItem(AUTH_TOKEN))
                : null;
            return response;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);

const permissionSlice = createSlice({
    name: 'permissions',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPermissions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.permissions = action.payload;
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.message = action.payload;
                state.loading = false;
            })
    }
});

export const {

} = permissionSlice.actions;

export default permissionSlice.reducer;