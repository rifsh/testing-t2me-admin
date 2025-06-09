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
  selectedUser: null,
  responseData: null,
  editable_status: null,
  responseMessage: null,
  editItemId: null,
  singleUser: null,
  editSingleUser: null,
  responseImpactData: null,
  pagination: { size: 10, page: 1 },
};

export const fetchAllUsers = createAsyncThunk(
  "users/fetchAll",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await UserService.getAllUsers(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching users");
    }
  }
);
export const fetchSingleUsers = createAsyncThunk(
  "users/fetchsingleuser",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await UserService.getSingleUsers(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching single users"
      );
    }
  }
);

export const getSingleUser = createAsyncThunk(
  "users/getSingleUser",
  async (userId, { rejectWithValue }) => {
    try {
      console.log(userId, "USERID IN SLICE");

      const response = await UserService.getSingleUser(userId);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching single users"
      );
    }
  }
);
export const fetchAllRoles = createAsyncThunk(
  "users/roles",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await UserService.getAllRoles(pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching users");
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await UserService.createUser(data, action);
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

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await UserService.updateUser(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "users/updateStatus",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await UserService.updateUserStatus(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
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
        filteredUsers = filteredUsers.filter(
          (user) =>
            (status === "Active" && user.is_active === true) ||
            (status === "Inactive" && user.is_active === false)
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
    resetUserstate: (state, action) => {
      state.list = initialState.list;
    },
    resetRoleState: (state, action) => {
      state.roles = initialState.roles;
    },
    setEditItemId: (state, action) => {
      state.editItemId = action.payload;
    },
    setUserDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setUserModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
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
      .addCase(fetchSingleUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.singleUser = action.payload;
      })
      .addCase(fetchSingleUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSingleUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleUser.fulfilled, (state, action) => {
        state.loading = false;
        state.singleUser = action.payload;
        state.editSingleUser = action.payload;
      })
      .addCase(getSingleUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items;
        state.filteredUsers = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.createPlaceLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createPlaceLoading = false;
        state.error = action.payload.data;
      })
      .addCase(editUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.message) {
          state.message = payload.message;
          state.editable_status = payload.editable_status;
        }
      })
      .addCase(editUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit user";
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          // state.responseImpactData = payload.status.data.active_schedules;
          state.editable_status = payload.status.editable_status;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          // state.responseImpactData = payload.status.data.active_schedules;
          state.editable_status = payload.status.editable_status;
        }
      })
      .addCase(updateUserStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit USER";
      });
  },
});

export const {
  filterUsers,
  setSelectedRole,
  setStatusFilter,
  setSearchTerm,
  resetUserstate,
  resetRoleState,
  setEditItemId,
  setUserDialogVisible,
  setUserModalLoading,
  setSelectedUser,
} = userSlice.actions;

export default userSlice.reducer;
