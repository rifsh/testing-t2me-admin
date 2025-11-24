import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AUTH_TOKEN } from "constants/AuthConstant";
import AuthService from "services/AuthService";
import { jwtDecode } from "jwt-decode";
import UserService from "services/userService";

export const initialState = {
  loading: false,
  message: "",
  showMessage: false,
  redirect: "",
  userData: null,
  allowedAccess: [],
  token: localStorage.getItem(AUTH_TOKEN) || null,
  termsConditionData: null,
  termsLoading: false,
};
export const signIn = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    const { username, password, country_id } = data;
    try {
      const response = await AuthService.login({ username, password, country_id });
      console.log("response data");

      const token = response.data.access_token;

      if (token) {
        localStorage.setItem(AUTH_TOKEN, token);
        return response;
      } else {
        return rejectWithValue("Authentication failed, no token received.");
      }
    } catch (err) {
      return rejectWithValue(err?.data?.status?.message || "Error");
    }
  }
);
// export const signOut = createAsyncThunk("auth/logout", async () => {
//   const response = await FirebaseService.signOutRequest();
//   localStorage.removeItem(AUTH_TOKEN);
//   return response.data;
// });
export const signOut = createAsyncThunk("auth/logout", async () => {
  try {
    console.log("LOGOUT STARTED-----------------");
    const response = await AuthService.logout();
    // console.log("response data", response.data);
    console.log("LOGOUT SUCCESS-----------------");
    localStorage.removeItem(AUTH_TOKEN);
    return response.data;
  } catch (err) {
    return err.response?.data?.message || "Error";
  }
});

export const signUp = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(data);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data, { rejectWithValue }) => {
    try {
      console.log("verify serviceeeeeeeeeeeeeeeeeeeee");
      const response = await AuthService.verifyOtp(data);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);
export const ResendOtp = createAsyncThunk(
  "auth/ResendOtp",
  async (data, { rejectWithValue }) => {
    try {
      const response = await AuthService.ResendOtp(data);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
    }
  }
);

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
export const TermsCondition = createAsyncThunk(
  "auth/termsCondition",
  async (_, { rejectWithValue }) => {
    try {
      console.log("FETCHING TERMS AND CONDITIONS");
      const response = await AuthService.TermsCondition();
      console.log(response, "TERMS AND CONDITIONS RESPONSE");
      return response;
    } catch (error) {
      return rejectWithValue("Failed to fetch Terms and Conditions");
    }
  }
);
export const PostTermsCondition = createAsyncThunk(
  "auth/PosttermsCondition",
  async (data, { rejectWithValue }) => {
    try {
      console.log("FETCHING TERMS AND CONDITIONS");
      const response = await AuthService.PostTermsCondition(data);
      console.log(response, "POST TERMS AND CONDITIONS RESPONSE");
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error");
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
        state.token = action.payload.data.access_token;
        state.allowedAccess = action.payload.data.access_matrix;
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
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(ResendOtp.pending, (state) => {
        state.loading = true;
      })
      .addCase(ResendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(ResendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(TermsCondition.pending, (state) => {
        console.log("TermsCondition pending");
        state.termsLoading = true;
        state.error = null;
      })
      .addCase(TermsCondition.fulfilled, (state, { payload }) => {
        console.log("TermsCondition fulfilled", payload);
        state.termsLoading = false;
        state.termsConditionData = payload;
      })
      .addCase(TermsCondition.rejected, (state, { payload }) => {
        console.log("TermsCondition rejected", payload);
        state.termsLoading = false;
        state.error = payload;
      })
      .addCase(PostTermsCondition.pending, (state) => {
        state.loading = true;
      })
      .addCase(PostTermsCondition.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(PostTermsCondition.rejected, (state, action) => {
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
        if (action.payload.access_matrix) {
          state.allowedAccess = action.payload.access_matrix;
        }
      })
      .addCase(fetchSingleUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
