import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AUTH_TOKEN } from "constants/AuthConstant";
import FirebaseService from "services/FirebaseService";
import AuthService from "services/AuthService";
import { jwtDecode } from "jwt-decode";

export const initialState = {
  loading: false,
  message: "",
  showMessage: false,
  redirect: "",
  userData: localStorage.getItem(AUTH_TOKEN)
  ? jwtDecode(localStorage.getItem(AUTH_TOKEN))
  : null,
  token: localStorage.getItem(AUTH_TOKEN) || null,
};
export const signIn = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    const { username, password } = data;
    try {
      const response = await AuthService.login({ username, password });
      console.log("response data");

      const token = response.data.access_token;

      if (token) {
        localStorage.setItem(AUTH_TOKEN, token);
        return token;
      } else {
        return rejectWithValue("Authentication failed, no token received.");
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    const { email, password } = data;
    try {
      const response = await AuthService.register({ email, password });
      const token = response.data.token;
      localStorage.setItem(AUTH_TOKEN, token);
      return token;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

export const signOut = createAsyncThunk("auth/logout", async () => {
  const response = await FirebaseService.signOutRequest();
  localStorage.removeItem(AUTH_TOKEN);
  return response.data;
});

export const signInWithGoogle = createAsyncThunk(
  "auth/signInWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.loginInOAuth();
      const token = response.data.token;
      localStorage.setItem(AUTH_TOKEN, token);
      return token;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

export const signInWithFacebook = createAsyncThunk(
  "auth/signInWithFacebook",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.loginInOAuth();
      const token = response.data.token;
      localStorage.setItem(AUTH_TOKEN, token);
      return token;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);
export const getUserdata = createAsyncThunk(
  "auth/getUserData",
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

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authenticated: (state, action) => {
      state.loading = false;
      state.redirect = "/";
      state.token = action.payload;
    },
    showAuthMessage: (state, action) => {
      state.message = action.payload;
      state.showMessage = true;
      state.loading = false;
    },
    hideAuthMessage: (state) => {
      state.message = "";
      state.showMessage = false;
    },
    signOutSuccess: (state) => {
      state.loading = false;
      state.token = null;
      state.redirect = "/";
    },
    showLoading: (state) => {
      state.loading = true;
    },
    signInSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.redirect = "/";
        state.token = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.message = action.payload;
        state.showMessage = true;
        state.loading = false;
      })
      .addCase(getUserdata.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserdata.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(getUserdata.rejected, (state, action) => {
        state.message = action.payload;
        state.showMessage = true;
        state.loading = false;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.token = null;
        state.redirect = "/";
      })
      .addCase(signOut.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.redirect = "/";
      })
      .addCase(signUp.pending, (state) => {
        state.loading = true;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.redirect = "/";
        state.token = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.message = action.payload;
        state.showMessage = true;
        state.loading = false;
      })
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.redirect = "/";
        state.token = action.payload;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.message = action.payload;
        state.showMessage = true;
        state.loading = false;
      })
      .addCase(signInWithFacebook.pending, (state) => {
        state.loading = true;
      })
      .addCase(signInWithFacebook.fulfilled, (state, action) => {
        state.loading = false;
        state.redirect = "/";
        state.token = action.payload;
      })
      .addCase(signInWithFacebook.rejected, (state, action) => {
        state.message = action.payload;
        state.showMessage = true;
        state.loading = false;
      });
  },
});

export const {
  authenticated,
  showAuthMessage,
  hideAuthMessage,
  signOutSuccess,
  showLoading,
  signInSuccess,
} = authSlice.actions;

export default authSlice.reducer;
