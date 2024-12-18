import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import UserService from "services/userService";

export const initialState = {
  loading: false,
  list: [],
  filteredUsers: [],
  searchTerm: "",
  statusFilter: "All",
  error: null,
  createUserLoading: false,
  message: null,
  roles: [],
  selectedRole: null,
};

export const fetchAllUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getAllUsers();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching users");
    }
  }
);
export const fetchAllRoles = createAsyncThunk(
  "users/roles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getAllRoles();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching users");
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await UserService.createUser(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating user");
    }
  }
);

export const editUser = createAsyncThunk(
  "users/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await UserService.editUser(data, action);
      return response.status;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit user");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    filterUsers: (state, action) => {
      const { searchTerm, status } = action.payload;

      let filteredUsers = state.list;

      if (status && status !== "All") {
        const isActive = status === "Active";
        filteredUsers = filteredUsers.filter(
          (user) => user.is_active === isActive
        );
      }

      if (searchTerm) {
        filteredUsers = filteredUsers.filter((user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      state.filteredUsers = filteredUsers;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchAllRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.filteredUsers = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.createUserLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createUserLoading = false;
        state.list.push(action.payload);
        state.filteredUsers.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createUserLoading = false;
        state.error = action.payload;
      })
      .addCase(editUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
        }
      })
      .addCase(editUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit user";
      });
  },
});

export const { filterUsers, setSelectedRole, setStatusFilter, setSearchTerm } =
  userSlice.actions;

export default userSlice.reducer;
