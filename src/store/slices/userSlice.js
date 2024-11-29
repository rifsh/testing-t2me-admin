import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "services/userService";

export const fetchAllUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await userService.getAllUsers();
        return response;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Error fetching users");
    }
});

export const createUser = createAsyncThunk('users/create', async (userData, { rejectWithValue }) => {
    try {
        const response = await userService.createUser(userData);
        return response;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Error Creating user");
    }
})

export const userSlice = createSlice({
    name: "users",
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {
        setUserList(state, action) {
            state.list = action.payload;
        },

    },
    extraReducers: (builder) => {
        builder.addCase(fetchAllUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.list.push(action.payload);
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
});

export const { setUserList } = userSlice.actions;
export default userSlice.reducer;