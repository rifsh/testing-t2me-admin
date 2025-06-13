import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import permissionService from 'services/PermissionService';

const initialState = {
    response: [],
    addResponse: [],
    displayNames: [],
    selectedDisplayIndex: 0,
    selectedDisplayName: null,
    selectedRole: [],
    permissions: [],
    message: null,
    loading: false,
    permissionLoading: false,
    error: null,
    pagination: { size: 10, page: 1 },
    displayNamePagination: { size: 10, page: 1 }
};

export const fetchPermissions = createAsyncThunk(
    "permissions/fetchPermissions",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await permissionService.getPermissionData(pageData);
            return response.data[0];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);
export const fetchPermissionsDisplayNames = createAsyncThunk(
    "permissions/fetchPermissionsDisplayNames",
    async (pageData, { rejectWithValue }) => {
        try {
            const response = await permissionService.getPermissionDisplayNames(pageData);
            return response.data[0];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);
export const addhPermissionsAccess = createAsyncThunk(
    "permissions/addhPermissionsAccess",
    async (data, { rejectWithValue }) => {
        try {
            const response = await permissionService.addPermissionAccess(data);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);

const permissionSlice = createSlice({
    name: 'permissions',
    initialState,
    reducers: {
        setSelectedDisplayIndex(state, action) {
            state.selectedDisplayIndex = action.payload
        },
        setSelectedDisplayName(state, action) {
            state.selectedDisplayName = action.payload
        },
        setSelectedRole(state, action) {
            state.selectedRole = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPermissions.pending, (state) => {
                state.permissionLoading = true;
            })
            .addCase(fetchPermissions.fulfilled, (state, action) => {
                state.permissionLoading = false;
                state.response = action.payload?.items;
                state.pagination = action.payload;
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.message = action.payload;
                state.permissionLoading = false;
            })
            .addCase(fetchPermissionsDisplayNames.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPermissionsDisplayNames.fulfilled, (state, action) => {
                state.loading = false;
                state.displayNames = action.payload?.items;
                state.displayNamePagination = action.payload;
            })
            .addCase(fetchPermissionsDisplayNames.rejected, (state, action) => {
                state.message = action.payload;
                state.loading = false;
            })
            .addCase(addhPermissionsAccess.pending, (state) => {
                state.loading = true;
            })
            .addCase(addhPermissionsAccess.fulfilled, (state, action) => {
                state.loading = false;
                state.addResponse = action.payload?.items;
            })
            .addCase(addhPermissionsAccess.rejected, (state, action) => {
                state.message = action.payload;
                state.loading = false;
            })
    }
});

export const {
    setSelectedDisplayIndex,
    setSelectedDisplayName,
    setSelectedRole,
} = permissionSlice.actions;

export default permissionSlice.reducer;