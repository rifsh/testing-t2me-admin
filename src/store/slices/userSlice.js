import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "services/userService";

export const initialState = {
  loading: false,
  list: [],
  error: null,
  searchTerm: "",
  statusFilter: "All",
  createUserLoading: false,
};

export const fetchAllUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getAllUsers();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching users");
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating user");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchAllUsers.pending, (state) => {
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
      // Create User
      .addCase(createUser.pending, (state) => {
        state.createUserLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createUserLoading = false;
        state.list.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createUserLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm, setStatusFilter } = userSlice.actions;
export const selectFilteredUsers = (state) => {
  let { list, searchTerm, statusFilter } = state.users;
  if (statusFilter !== "All") {
    const isActive = statusFilter === "Active";
    list = list.filter((user) => user.is_active === isActive);
  }
  if (searchTerm) {
    list = list.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  return list;
};

export default userSlice.reducer;
